import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { rag } from "./rag";

// ============ Ingestion Stats ============

export const getIngestionStats = query({
  args: {},
  handler: async (ctx) => {
    const namespaces = ["competitors", "research", "internal", "general"] as const;

    const stats = await Promise.all(
      namespaces.map(async (ns) => {
        const namespace = await rag.getNamespace(ctx, { namespace: ns });
        if (!namespace) return { namespace: ns, count: 0, entries: [] };

        const result = await rag.list(ctx, {
          namespaceId: namespace.namespaceId,
          limit: 100,
          order: "desc",
        });

        return {
          namespace: ns,
          count: result.page.length,
          entries: result.page.map((entry) => ({
            id: entry.entryId,
            title: entry.title,
            url: entry.metadata?.url,
            addedBy: entry.metadata?.addedByName,
            addedAt: entry.metadata?.addedAt,
          })),
        };
      })
    );

    const totalUrls = stats.reduce((sum, s) => sum + s.count, 0);
    const byCategory = Object.fromEntries(stats.map((s) => [s.namespace, s.count]));
    const recentEntries = stats
      .flatMap((s) => s.entries.map((e) => ({ ...e, category: s.namespace })))
      .sort((a, b) => {
        const dateA = a.addedAt ? new Date(String(a.addedAt)).getTime() : 0;
        const dateB = b.addedAt ? new Date(String(b.addedAt)).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 20);

    return { totalUrls, byCategory, recentEntries };
  },
});

export const getChunkCounts = query({
  args: {},
  handler: async (ctx) => {
    const namespaces = ["competitors", "research", "internal", "general"] as const;

    const counts = await Promise.all(
      namespaces.map(async (ns) => {
        const namespace = await rag.getNamespace(ctx, { namespace: ns });
        if (!namespace) return { namespace: ns, chunks: 0, entries: 0 };

        // List entries to count them
        const result = await rag.list(ctx, {
          namespaceId: namespace.namespaceId,
          limit: 1000,
          order: "desc",
        });

        return {
          namespace: ns,
          entries: result.page.length,
          // Estimate chunks (typically 1-10 per entry depending on content length)
          chunks: result.page.length,
        };
      })
    );

    const totalEntries = counts.reduce((sum, c) => sum + c.entries, 0);
    const byNamespace = Object.fromEntries(counts.map((c) => [c.namespace, c.entries]));

    return { totalEntries, byNamespace };
  },
});

// ============ Token Usage ============

export const getTokenUsage = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days ?? 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const logs = await ctx.db
      .query("queryLogs")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), cutoff))
      .order("desc")
      .collect();

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const tokensToday = logs
      .filter((l) => l.timestamp >= oneDayAgo)
      .reduce((sum, l) => sum + l.totalTokens, 0);

    const tokensThisWeek = logs
      .filter((l) => l.timestamp >= oneWeekAgo)
      .reduce((sum, l) => sum + l.totalTokens, 0);

    const tokensTotal = logs.reduce((sum, l) => sum + l.totalTokens, 0);

    const queryCount = logs.length;
    const avgTokensPerQuery = queryCount > 0 ? Math.round(tokensTotal / queryCount) : 0;
    const avgResponseTime = queryCount > 0
      ? Math.round(logs.reduce((sum, l) => sum + l.responseTimeMs, 0) / queryCount)
      : 0;

    return {
      tokensToday,
      tokensThisWeek,
      tokensTotal,
      queryCount,
      avgTokensPerQuery,
      avgResponseTime,
    };
  },
});

export const getQueryLogs = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const logs = await ctx.db
      .query("queryLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);

    return logs.map((log) => ({
      id: log._id,
      queryId: log.queryId,
      userId: log.userId,
      userName: log.userName,
      channelId: log.channelId,
      promptTokens: log.promptTokens,
      completionTokens: log.completionTokens,
      totalTokens: log.totalTokens,
      model: log.model,
      tools: log.tools,
      responseTimeMs: log.responseTimeMs,
      timestamp: log.timestamp,
    }));
  },
});

export const logQuery = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("queryLogs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// ============ Feedback ============

export const getFeedbackSummary = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days ?? 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const feedback = await ctx.db
      .query("feedback")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), cutoff))
      .collect();

    const total = feedback.length;
    const positive = feedback.filter((f) => f.sentiment === "positive").length;
    const negative = feedback.filter((f) => f.sentiment === "negative").length;
    const neutral = feedback.filter((f) => f.sentiment === "neutral").length;

    return {
      total,
      positive,
      negative,
      neutral,
      positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
      negativePercent: total > 0 ? Math.round((negative / total) * 100) : 0,
    };
  },
});

export const getFeedbackList = query({
  args: {
    sentiment: v.optional(
      v.union(v.literal("positive"), v.literal("negative"), v.literal("neutral"), v.literal("all"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const sentiment = args.sentiment ?? "all";

    const feedbackQuery = ctx.db
      .query("feedback")
      .withIndex("by_timestamp")
      .order("desc");

    const allFeedback = await feedbackQuery.take(limit * 2);

    const filtered = sentiment === "all"
      ? allFeedback
      : allFeedback.filter((f) => f.sentiment === sentiment);

    // Look up queryLogs for each feedback to get question/response
    const feedbackWithContext = await Promise.all(
      filtered.slice(0, limit).map(async (f) => {
        let question: string | undefined;
        let response: string | undefined;

        if (f.queryId) {
          // Find the queryLog by queryId
          const queryLog = await ctx.db
            .query("queryLogs")
            .filter((q) => q.eq(q.field("queryId"), f.queryId))
            .first();

          if (queryLog) {
            question = queryLog.messageContent;
            response = queryLog.responseContent;
          }
        }

        return {
          id: f._id,
          messageTs: f.messageTs,
          channelId: f.channelId,
          userId: f.userId,
          userName: f.userName,
          reaction: f.reaction,
          sentiment: f.sentiment,
          comment: f.comment,
          queryId: f.queryId,
          timestamp: f.timestamp,
          question,
          response,
        };
      })
    );

    return feedbackWithContext;
  },
});

export const recordFeedback = mutation({
  args: {
    messageTs: v.string(),
    channelId: v.string(),
    userId: v.string(),
    userName: v.optional(v.string()),
    reaction: v.string(),
    sentiment: v.union(v.literal("positive"), v.literal("negative"), v.literal("neutral")),
    comment: v.optional(v.string()),
    queryId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if feedback already exists for this message/user combo
    const existing = await ctx.db
      .query("feedback")
      .withIndex("by_messageTs", (q) => q.eq("messageTs", args.messageTs))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      // Update existing feedback
      await ctx.db.patch(existing._id, {
        reaction: args.reaction,
        sentiment: args.sentiment,
        comment: args.comment,
        timestamp: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("feedback", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// ============ Bot Message Tracking ============

export const trackBotMessage = mutation({
  args: {
    messageTs: v.string(),
    channelId: v.string(),
    threadTs: v.optional(v.string()),
    queryId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("botMessages", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getBotMessageByTs = query({
  args: {
    messageTs: v.string(),
    channelId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("botMessages")
      .withIndex("by_messageTs", (q) =>
        q.eq("messageTs", args.messageTs).eq("channelId", args.channelId)
      )
      .first();
  },
});

// ============ Test Bot ============
// Note: testBotResponse is implemented as a separate API endpoint
// because Convex actions cannot import Node.js modules like the Linear SDK.
// Use the /api/test-bot endpoint instead.
