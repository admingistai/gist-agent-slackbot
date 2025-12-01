import { CoreMessage, generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  getLinearActivity,
  getIssueDetails,
  getTeamWorkload,
  searchIssues,
} from "./linear-tools";
import { searchWeb, scrapeUrl } from "./web-tools";
import { searchKnowledgeBase, listKnowledgeEntries, createIngestTool, deleteFromKnowledgeBase } from "./knowledge-tools";

// Context type for user/channel information
interface GenerateContext {
  userId: string;
  userName: string;
  channelId: string;
}

export const generateResponse = async (
  messages: CoreMessage[],
  updateStatus?: (status: string) => void,
  context?: GenerateContext,
) => {
  // Create ingest tool with context if available
  const ingestContent = context
    ? createIngestTool(context.userId, context.userName, context.channelId)
    : null;

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    messages,
    system: `You are Gist-Agent, an AI assistant for the Gist GEO team.

Your capabilities:
1. **Knowledge Base**: Search and ingest team knowledge (competitors, research, internal docs)
2. **Linear**: Track issues and team workload
3. **Web Search**: Find current information online

IMPORTANT: Always check the knowledge base FIRST for questions about:
- Competitors (AirOps, Jasper, etc.)
- Industry research and reports
- Internal company information

When user says "ingest", "save", or "remember" with a URL, use ingestContent to save it.
When user says "delete", "remove", or "forget" with a URL, use deleteFromKnowledgeBase to remove it.

Guidelines:
- Keep responses concise and scannable for Slack
- Use bullet points for lists of issues
- Always include issue identifiers (like ENG-123) with their URLs
- When summarizing activity, group by: created, completed, in progress
- Format links for Slack using <url|text> syntax
- Current date: ${new Date().toISOString().split("T")[0]}`,
    tools: {
      searchWeb,
      scrapeUrl,
      getLinearActivity,
      getIssueDetails,
      getTeamWorkload,
      searchIssues,
      searchKnowledgeBase,
      listKnowledgeEntries,
      deleteFromKnowledgeBase,
      ...(ingestContent && { ingestContent }),
    },
    stopWhen: stepCountIs(7),
    onStepFinish: ({ toolCalls }) => {
      const toolCall = toolCalls[0];
      if (updateStatus && toolCall && "input" in toolCall) {
        const input = toolCall.input as Record<string, unknown>;
        if (toolCall.toolName === "searchWeb") {
          updateStatus(`Searching web for "${input.query}"...`);
        } else if (toolCall.toolName === "scrapeUrl") {
          updateStatus(`Reading content from ${input.url}...`);
        } else if (toolCall.toolName === "getLinearActivity") {
          updateStatus("Fetching Linear activity...");
        } else if (toolCall.toolName === "getIssueDetails") {
          updateStatus(`Looking up ${input.issueId}...`);
        } else if (toolCall.toolName === "getTeamWorkload") {
          updateStatus(`Checking workload for team ${input.teamKey}...`);
        } else if (toolCall.toolName === "searchIssues") {
          updateStatus("Searching Linear issues...");
        } else if (toolCall.toolName === "searchKnowledgeBase") {
          updateStatus(`Searching knowledge base for "${input.query}"...`);
        } else if (toolCall.toolName === "ingestContent") {
          updateStatus(`Ingesting ${input.url}...`);
        } else if (toolCall.toolName === "listKnowledgeEntries") {
          updateStatus("Listing knowledge base entries...");
        } else if (toolCall.toolName === "deleteFromKnowledgeBase") {
          updateStatus(`Deleting ${input.url} from knowledge base...`);
        }
      }
    },
  });

  // Convert markdown to Slack mrkdwn format
  return text.replace(/\[(.*?)\]\((.*?)\)/g, "<$2|$1>").replace(/\*\*/g, "*");
};
