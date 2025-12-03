import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Query logs for token tracking
  queryLogs: defineTable({
    queryId: v.string(),
    userId: v.string(),
    userName: v.optional(v.string()),
    channelId: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    model: v.string(),
    tools: v.array(v.string()),
    responseTimeMs: v.number(),
    messageContent: v.optional(v.string()),
    responseContent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_user", ["userId", "timestamp"])
    .index("by_channel", ["channelId", "timestamp"]),

  // Feedback from Slack reactions
  feedback: defineTable({
    messageTs: v.string(),
    channelId: v.string(),
    userId: v.string(),
    userName: v.optional(v.string()),
    reaction: v.string(),
    sentiment: v.union(
      v.literal("positive"),
      v.literal("negative"),
      v.literal("neutral")
    ),
    comment: v.optional(v.string()),
    queryId: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_sentiment", ["sentiment", "timestamp"])
    .index("by_messageTs", ["messageTs"]),

  // Track bot messages for linking feedback
  botMessages: defineTable({
    messageTs: v.string(),
    channelId: v.string(),
    threadTs: v.optional(v.string()),
    queryId: v.string(),
    userId: v.string(),
    timestamp: v.number(),
  })
    .index("by_messageTs", ["messageTs", "channelId"])
    .index("by_queryId", ["queryId"]),
});
