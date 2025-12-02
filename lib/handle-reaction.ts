import { convexClient } from "./convex-client";
import { api } from "../convex/_generated/api";

// Slack reaction event type
export interface ReactionAddedEvent {
  type: "reaction_added";
  user: string;
  reaction: string;
  item: {
    type: "message";
    channel: string;
    ts: string;
  };
  item_user: string;
  event_ts: string;
}

// Map reactions to sentiment
const POSITIVE_REACTIONS = ["+1", "thumbsup", "white_check_mark", "heart", "star", "100", "clap", "tada"];
const NEGATIVE_REACTIONS = ["-1", "thumbsdown", "x", "disappointed", "confused", "thinking_face"];

function getSentiment(reaction: string): "positive" | "negative" | "neutral" {
  if (POSITIVE_REACTIONS.includes(reaction)) return "positive";
  if (NEGATIVE_REACTIONS.includes(reaction)) return "negative";
  return "neutral";
}

export async function handleReactionAdded(
  event: ReactionAddedEvent,
  botUserId: string,
) {
  // Only process reactions on messages
  if (event.item.type !== "message") return;

  // Only process reactions on bot messages
  if (event.item_user !== botUserId) return;

  const { channel, ts: messageTs } = event.item;
  const sentiment = getSentiment(event.reaction);

  // Only track positive/negative reactions for QA feedback
  if (sentiment === "neutral") return;

  try {
    // Look up the bot message to get the query ID
    const botMessage = await convexClient.query(api.dashboard.getBotMessageByTs, {
      messageTs,
      channelId: channel,
    });

    // Record the feedback
    await convexClient.mutation(api.dashboard.recordFeedback, {
      messageTs,
      channelId: channel,
      userId: event.user,
      reaction: event.reaction,
      sentiment,
      queryId: botMessage?.queryId,
    });

    console.log(`Recorded ${sentiment} feedback from ${event.user} on message ${messageTs}`);
  } catch (error) {
    console.error("Failed to record feedback:", error);
  }
}
