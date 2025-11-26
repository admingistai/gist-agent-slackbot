import { components } from "./_generated/api";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";

// Filter types for type safety
type GistFilters = {
  category: "competitors" | "research" | "internal" | "general";
  addedBy: string;
  channelId: string;
  sourceUrl: string;
};

export const rag = new RAG<GistFilters>(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  embeddingDimension: 1536,
  filterNames: ["category", "addedBy", "channelId", "sourceUrl"],
});
