import { v } from "convex/values";
import { action } from "./_generated/server";
import { rag } from "./rag";

const NAMESPACES = ["competitors", "research", "internal", "general"] as const;

export const deleteByUrl = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const { url } = args;

    // Search all namespaces to find and delete the entry
    for (const ns of NAMESPACES) {
      const namespace = await rag.getNamespace(ctx, { namespace: ns });
      if (!namespace) continue;

      // Check if entry exists by listing and filtering
      const result = await rag.list(ctx, {
        namespaceId: namespace.namespaceId,
        limit: 100,
        order: "desc",
      });

      const entry = result.page.find((e) => e.metadata?.url === url);
      if (entry) {
        // Found it - delete by key (URL is the key)
        await rag.deleteByKey(ctx, {
          namespaceId: namespace.namespaceId,
          key: url,
        });

        return {
          success: true,
          deleted: true,
          title: entry.title,
          namespace: ns,
          message: `Deleted "${entry.title}" from ${ns} namespace`,
        };
      }
    }

    // Not found in any namespace
    return {
      success: true,
      deleted: false,
      message: `URL not found in knowledge base: ${url}`,
    };
  },
});
