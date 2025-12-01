import { v } from "convex/values";
import { action, query } from "./_generated/server";
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

// List all entries in knowledge base
export const listEntries = query({
  args: {
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
    const { category = "all", limit = 20 } = args;
    const namespaces =
      category === "all"
        ? (["competitors", "research", "internal", "general"] as const)
        : [category] as const;

    const allEntries = await Promise.all(
      namespaces.map(async (ns) => {
        const namespace = await rag.getNamespace(ctx, { namespace: ns });
        if (!namespace) return [];

        const result = await rag.list(ctx, {
          namespaceId: namespace.namespaceId,
          limit: Math.ceil(limit / namespaces.length),
          order: "desc",
        });

        return result.page.map((entry) => ({
          id: entry.entryId,
          title: entry.title,
          namespace: ns,
          url: entry.metadata?.url,
          addedBy: entry.metadata?.addedByName,
          addedAt: entry.metadata?.addedAt,
        }));
      })
    );

    return allEntries.flat().slice(0, limit);
  },
});
