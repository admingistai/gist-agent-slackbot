import {
  AssistantThreadStartedEvent,
  GenericMessageEvent,
} from "./types";
import { client, getThread, updateStatusUtil } from "./slack-utils";
import { generateResponseWithMetrics } from "./generate-response";
import { convexClient } from "./convex-client";
import { api } from "../convex/_generated/api";

export async function assistantThreadMessage(
  event: AssistantThreadStartedEvent,
) {
  const { channel_id, thread_ts } = event.assistant_thread;
  console.log(`Thread started: ${channel_id} ${thread_ts}`);
  console.log(JSON.stringify(event));

  await client.chat.postMessage({
    channel: channel_id,
    thread_ts: thread_ts,
    text: "Hello, I'm an AI assistant built with the AI SDK by Vercel!",
  });

  await client.assistant.threads.setSuggestedPrompts({
    channel_id: channel_id,
    thread_ts: thread_ts,
    prompts: [
      {
        title: "Get the weather",
        message: "What is the current weather in London?",
      },
      {
        title: "Get the news",
        message: "What is the latest Premier League news from the BBC?",
      },
    ],
  });
}

export async function handleNewAssistantMessage(
  event: GenericMessageEvent,
  botUserId: string,
) {
  if (
    event.bot_id ||
    event.bot_id === botUserId ||
    event.bot_profile ||
    !event.thread_ts
  )
    return;

  const { thread_ts, channel } = event;
  const updateStatus = updateStatusUtil(channel, thread_ts);
  updateStatus("is thinking...");

  const queryId = `${channel}-${event.ts}-${Date.now()}`;

  try {
    const messages = await getThread(channel, thread_ts, botUserId);
    const result = await generateResponseWithMetrics(messages, updateStatus, {
      userId: event.user,
      userName: event.user,
      channelId: event.channel,
    });

    const response = await client.chat.postMessage({
      channel: channel,
      thread_ts: thread_ts,
      text: result.text,
      unfurl_links: false,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: result.text,
          },
        },
      ],
    });

    updateStatus("");

    // Log query metrics and track bot message (async, don't await)
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
      response.ts && convexClient.mutation(api.dashboard.trackBotMessage, {
        messageTs: response.ts,
        channelId: channel,
        threadTs: thread_ts,
        queryId,
        userId: event.user,
      }),
    ]).catch((err) => console.error("Failed to log metrics:", err));
  } catch (error) {
    console.error("Error handling assistant message:", error);
    updateStatus("");
    await client.chat.postMessage({
      channel: channel,
      thread_ts: thread_ts,
      text: `I'm sorry, I encountered an error while processing your request: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}
