import { v } from "convex/values";
import { action } from "./_generated/server";
import { rag } from "./rag";

export const searchKnowledge = action({
  args: {
    query: v.string(),
    category: v.optional(
      v.union(
        v.literal("competitors"),
        v.literal("research"),
        v.literal("internal"),
        v.literal("general"),
        v.literal("all")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query, category = "all", limit = 5 } = args;

    if (category === "all") {
      // Search all namespaces
      const namespaces = [
        "competitors",
        "research",
        "internal",
        "general",
      ] as const;
      const allResults = await Promise.all(
        namespaces.map(async (ns) => {
          const { results } = await rag.search(ctx, {
            namespace: ns,
            query,
            limit: Math.ceil(limit / namespaces.length),
            vectorScoreThreshold: 0.5,
            chunkContext: { before: 1, after: 1 },
          });
          return results.map((r) => ({ ...r, namespace: ns }));
        })
      );

      return allResults
        .flat()
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    // Search specific namespace
    const { results, text } = await rag.search(ctx, {
      namespace: category,
      query,
      limit,
      vectorScoreThreshold: 0.5,
      chunkContext: { before: 1, after: 1 },
    });

    return { results, text };
  },
});
