import { components } from "./_generated/api";
import { RAG } from "@convex-dev/rag";
import OpenAI from "openai";

// Filter types for type safety
type GistFilters = {
  category: "competitors" | "research" | "internal" | "general";
  addedBy: string;
  channelId: string;
  sourceUrl: string;
};

// Custom embedding model using OpenAI SDK directly
const createEmbeddingModel = () => {
  let client: OpenAI | null = null;

  const getClient = () => {
    if (!client) {
      client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return client;
  };

  return {
    specificationVersion: "v2" as const,
    modelId: "text-embedding-3-small",
    provider: "openai",
    maxEmbeddingsPerCall: 2048,
    supportsParallelCalls: true,

    async doEmbed({ values }: { values: string[] }) {
      const openai = getClient();
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: values,
      });

      return {
        embeddings: response.data.map((item) => item.embedding),
        usage: {
          tokens: response.usage.total_tokens,
        },
      };
    },
  };
};

export const rag = new RAG<GistFilters>(components.rag, {
  textEmbeddingModel: createEmbeddingModel() as any,
  embeddingDimension: 1536,
  filterNames: ["category", "addedBy", "channelId", "sourceUrl"],
});
