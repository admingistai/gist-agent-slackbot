import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { rag } from "./rag";

// Helper: Extract keywords from query for title matching
function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "what", "how", "why", "when", "where",
    "is", "are", "was", "were", "be", "been", "being", "have", "has",
    "do", "does", "did", "will", "would", "could", "should", "may",
    "might", "must", "about", "know", "tell", "me", "you", "your", "my",
    "it", "its", "this", "that", "these", "those", "i", "we", "they",
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

// Helper: Score how well a title matches the query keywords
function scoreTitleMatch(title: string, keywords: string[]): number {
  const titleLower = title.toLowerCase();
  const titleWords = titleLower.split(/\s+/);

  let matchCount = 0;
  let consecutiveBonus = 0;

  for (const keyword of keywords) {
    // Exact word match
    if (titleWords.some(w => w.includes(keyword))) {
      matchCount++;
    }
    // Check for consecutive keyword matches (phrase matching)
    if (titleLower.includes(keyword)) {
      consecutiveBonus += 0.1;
    }
  }

  if (keywords.length === 0) return 0;

  // Score: percentage of keywords matched + bonus for phrase presence
  return (matchCount / keywords.length) + Math.min(consecutiveBonus, 0.3);
}

// Helper: Search entries by title match
async function searchByTitle(
  ctx: any,
  query: string,
  namespaces: readonly string[],
  limit: number
): Promise<Array<{ title: string; namespace: string; url?: string; text?: string; score: number; source: string }>> {
  const keywords = extractKeywords(query);

  if (keywords.length === 0) return [];

  const allMatches: Array<{ title: string; namespace: string; url?: string; text?: string; score: number; source: string }> = [];

  for (const ns of namespaces) {
    const namespace = await rag.getNamespace(ctx, { namespace: ns });
    if (!namespace) continue;

    const result = await rag.list(ctx, {
      namespaceId: namespace.namespaceId,
      limit: 50, // Get more entries to search through
      order: "desc",
    });

    for (const entry of result.page) {
      const score = scoreTitleMatch(entry.title || "", keywords);
      if (score > 0.3) { // At least 30% of keywords match
        allMatches.push({
          title: entry.title || "Untitled",
          namespace: ns,
          url: entry.metadata?.url as string | undefined,
          text: entry.title, // Use title as preview text
          score,
          source: "title_match",
        });
      }
    }
  }

  return allMatches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

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

    const namespaces = category === "all"
      ? (["competitors", "research", "internal", "general"] as const)
      : ([category] as const);

    // Step 1: Try vector search first
    const vectorResults = await Promise.all(
      namespaces.map(async (ns) => {
        const { results } = await rag.search(ctx, {
          namespace: ns,
          query,
          limit: Math.ceil(limit / namespaces.length) + 2, // Get a few extra
          vectorScoreThreshold: 0.4, // Slightly lower threshold
          chunkContext: { before: 1, after: 1 },
        });
        return results.map((r) => ({ ...r, namespace: ns, source: "vector" }));
      })
    );

    const flatVectorResults = vectorResults
      .flat()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Step 2: If vector search found good results, return them
    if (flatVectorResults.length > 0 && flatVectorResults[0].score >= 0.5) {
      return {
        results: flatVectorResults,
        searchMethod: "vector",
      };
    }

    // Step 3: Try title matching as fallback/supplement
    const titleMatches = await searchByTitle(ctx, query, namespaces, limit);

    // Step 4: Combine results - title matches first if they're strong
    if (titleMatches.length > 0 && titleMatches[0].score > 0.5) {
      // Title match is strong - prioritize it but include vector results too
      const combined = [...titleMatches];

      // Add vector results that aren't duplicates
      for (const vr of flatVectorResults) {
        // Extract metadata from the first content chunk
        const firstChunk = vr.content?.[0];
        const chunkMetadata = firstChunk?.metadata;
        const chunkUrl = chunkMetadata?.url as string | undefined;

        const isDuplicate = combined.some(
          tm => tm.url && chunkUrl && tm.url === chunkUrl
        );
        if (!isDuplicate) {
          combined.push({
            title: (chunkMetadata?.title as string) || "Untitled",
            namespace: vr.namespace,
            url: chunkUrl,
            text: firstChunk?.text || "",
            score: vr.score,
            source: "vector",
          });
        }
      }

      return {
        results: combined.slice(0, limit),
        searchMethod: "hybrid",
      };
    }

    // Step 5: Return whatever we found (vector results or title matches)
    if (flatVectorResults.length > 0) {
      return {
        results: flatVectorResults,
        searchMethod: "vector",
      };
    }

    if (titleMatches.length > 0) {
      return {
        results: titleMatches,
        searchMethod: "title_match",
      };
    }

    // Nothing found
    return {
      results: [],
      searchMethod: "none",
    };
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
