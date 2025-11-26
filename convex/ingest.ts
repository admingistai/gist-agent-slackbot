import { v } from "convex/values";
import { action } from "./_generated/server";
import { rag } from "./rag";

export const ingestUrl = action({
  args: {
    url: v.string(),
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("competitors"),
      v.literal("research"),
      v.literal("internal"),
      v.literal("general")
    ),
    addedBy: v.string(),
    addedByName: v.string(),
    channelId: v.string(),
  },
  handler: async (ctx, args) => {
    const { url, title, content, category, addedBy, addedByName, channelId } =
      args;

    // URL as key - re-ingesting same URL replaces old content
    const { entryId, status, replacedEntry } = await rag.add(ctx, {
      namespace: category,
      key: url,
      title,
      text: content,
      filterValues: [
        { name: "category", value: category },
        { name: "addedBy", value: addedBy },
        { name: "channelId", value: channelId },
        { name: "sourceUrl", value: url },
      ],
      metadata: {
        addedByName,
        addedAt: new Date().toISOString(),
        url,
      },
    });

    return {
      entryId,
      status,
      replaced: !!replacedEntry,
      namespace: category,
    };
  },
});
