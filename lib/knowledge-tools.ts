import { tool } from "ai";
import { z } from "zod";
import { convex } from "./convex-client";
import { api } from "../convex/_generated/api";
import { exa } from "./utils";

// Extract schemas for proper type inference
const searchKnowledgeSchema = z.object({
  query: z.string().describe("Search query"),
  category: z
    .enum(["competitors", "research", "internal", "general", "all"])
    .optional()
    .default("all")
    .describe("Filter by category"),
  limit: z.number().optional().default(5).describe("Number of results"),
});

const listEntriesSchema = z.object({
  category: z
    .enum(["competitors", "research", "internal", "general", "all"])
    .optional()
    .default("all")
    .describe("Filter by category"),
  limit: z.number().optional().default(20).describe("Number of results"),
});

const ingestContentSchema = z.object({
  url: z.string().url().describe("URL to ingest"),
  category: z
    .enum(["competitors", "research", "internal", "general"])
    .describe("Category: competitors, research, internal, or general"),
});

// Search knowledge base tool
// @ts-ignore - AI SDK v5 type instantiation too deep with zod
export const searchKnowledgeBase = tool({
  description: `Search the Gist knowledge base for information about competitors, research, or internal docs.
    Use this BEFORE searching the web for questions about:
    - Competitors (AirOps, Jasper, etc.)
    - Industry research and reports
    - Internal company information
    Categories: competitors, research, internal, general, all`,
  inputSchema: searchKnowledgeSchema,
  execute: async ({ query, category, limit }: z.infer<typeof searchKnowledgeSchema>) => {
    try {
      const results = await convex.action(api.search.searchKnowledge, {
        query,
        category,
        limit,
      });

      if (!results || (Array.isArray(results) && results.length === 0)) {
        return {
          found: false,
          message: "No relevant information found in the knowledge base.",
        };
      }

      return { found: true, results };
    } catch (error) {
      return {
        error: `Knowledge search failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

// List all entries in knowledge base
const listEntriesSchemaInfer = listEntriesSchema;
// @ts-ignore - AI SDK v5 type instantiation too deep with zod
export const listKnowledgeEntries = tool({
  description: `List all articles/entries stored in the knowledge base.
    Use this when user asks "what have you ingested", "list articles", "show knowledge base contents", etc.
    Returns titles, URLs, categories, and who added them.`,
  inputSchema: listEntriesSchema,
  execute: async ({ category, limit }: z.infer<typeof listEntriesSchemaInfer>) => {
    try {
      const entries = await convex.query(api.search.listEntries, {
        category,
        limit,
      });

      if (!entries || entries.length === 0) {
        return {
          found: false,
          message: "No articles have been ingested yet.",
        };
      }

      return {
        found: true,
        count: entries.length,
        entries: entries.map((e: any) => ({
          title: e.title,
          url: e.url,
          category: e.namespace,
          addedBy: e.addedBy,
          addedAt: e.addedAt,
        })),
      };
    } catch (error) {
      return {
        error: `Failed to list entries: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

// Ingest content tool - needs context from handler
export const createIngestTool = (
  userId: string,
  userName: string,
  channelId: string
) =>
  // @ts-ignore - AI SDK v5 type instantiation too deep with zod
  tool({
    description: `Save content to the knowledge base. Use when user says "ingest", "save", "remember", or "add to knowledge".
      Scrapes the URL, then stores it for future retrieval.`,
    inputSchema: ingestContentSchema,
    execute: async ({ url, category }: z.infer<typeof ingestContentSchema>) => {
      try {
        // Step 1: Scrape content using existing Exa
        const { results } = await exa.getContents([url], {
          text: { maxCharacters: 4000 },
        });

        if (!results || results.length === 0) {
          return { success: false, error: "Could not fetch content from URL" };
        }

        const { title, text: content } = results[0];

        // Step 2: Ingest into Convex RAG
        const result = await convex.action(api.ingest.ingestUrl, {
          url,
          title: title || url,
          content,
          category,
          addedBy: userId,
          addedByName: userName,
          channelId,
        });

        return {
          success: true,
          message: `Saved "${title || url}" to ${category} namespace`,
          replaced: result.replaced,
          entryId: result.entryId,
        };
      } catch (error) {
        return {
          error: `Ingestion failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });

// Delete entry schema
const deleteEntrySchema = z.object({
  url: z.string().url().describe("URL to delete from knowledge base"),
});

// Delete from knowledge base tool
// @ts-ignore - AI SDK v5 type instantiation too deep with zod
export const deleteFromKnowledgeBase = tool({
  description: `Delete an article/entry from the knowledge base by URL.
    Use when user says "delete", "remove", or "forget" with a URL.
    Automatically finds which category the URL is in.`,
  inputSchema: deleteEntrySchema,
  execute: async ({ url }: z.infer<typeof deleteEntrySchema>) => {
    try {
      const result = await convex.action(api.delete.deleteByUrl, { url });
      return result;
    } catch (error) {
      return {
        error: `Delete failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

// Helper to suggest category based on content
export function suggestCategory(
  content: string,
  url: string
): "competitors" | "research" | "internal" | "general" {
  const lower = (content + " " + url).toLowerCase();

  if (
    lower.includes("airops") ||
    lower.includes("jasper") ||
    lower.includes("competitor") ||
    lower.includes("vs")
  ) {
    return "competitors";
  }
  if (
    lower.includes("report") ||
    lower.includes("study") ||
    lower.includes("research") ||
    lower.includes("trend")
  ) {
    return "research";
  }
  if (
    lower.includes("internal") ||
    lower.includes("handbook") ||
    lower.includes("policy")
  ) {
    return "internal";
  }

  return "general";
}
