import { AppMentionEvent } from "./types";
import { client, getThread } from "./slack-utils";
import { generateResponseWithMetrics } from "./generate-response";
import { convexClient } from "./convex-client";
import { api } from "../convex/_generated/api";

const updateStatusUtil = async (
  initialStatus: string,
  event: AppMentionEvent,
) => {
  const initialMessage = await client.chat.postMessage({
    channel: event.channel,
    thread_ts: event.thread_ts ?? event.ts,
    text: initialStatus,
  });

  if (!initialMessage || !initialMessage.ts)
    throw new Error("Failed to post initial message");

  const messageTs = initialMessage.ts as string;

  const updateMessage = async (status: string) => {
    await client.chat.update({
      channel: event.channel,
      ts: messageTs,
      text: status,
    });
  };

  return { updateMessage, messageTs };
};

export async function handleNewAppMention(
  event: AppMentionEvent,
  botUserId: string,
) {
  console.log("Handling app mention");
  if (event.bot_id || event.bot_id === botUserId || event.bot_profile) {
    console.log("Skipping app mention");
    return;
  }

  const { thread_ts, channel } = event;
  const { updateMessage, messageTs } = await updateStatusUtil("is thinking...", event);
  const queryId = `${channel}-${event.ts}-${Date.now()}`;

  try {
    let result;
    if (thread_ts) {
      const messages = await getThread(channel, thread_ts, botUserId);
      console.log("Generating response for thread...");
      result = await generateResponseWithMetrics(messages, updateMessage, {
        userId: event.user,
        userName: event.user,
        channelId: event.channel,
      });
    } else {
      console.log("Generating response for new mention...");
      result = await generateResponseWithMetrics(
        [{ role: "user", content: event.text }],
        updateMessage,
        {
          userId: event.user,
          userName: event.user,
          channelId: event.channel,
        },
      );
    }

    console.log(`Response generated, length: ${result.text.length}`);
    console.log("Updating Slack message...");
    await updateMessage(result.text);
    console.log("Slack message updated");

    // Log query metrics and track bot message for reaction linking (async, don't await)
    Promise.all([
      convexClient.mutation(api.dashboard.logQuery, {
        queryId,
        userId: event.user,
        channelId: channel,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        model: result.model,
        tools: result.toolsUsed,
        responseTimeMs: result.responseTimeMs,
      }),
      convexClient.mutation(api.dashboard.trackBotMessage, {
        messageTs,
        channelId: channel,
        threadTs: thread_ts,
        queryId,
        userId: event.user,
      }),
    ]).catch((err) => console.error("Failed to log metrics:", err));
  } catch (error) {
    console.error("Error handling app mention:", error);
    updateMessage(
      `I'm sorry, I encountered an error while processing your request:\n\n> ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
