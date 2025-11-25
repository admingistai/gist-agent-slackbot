import { CoreMessage, generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { exa } from "./utils";
import {
  getLinearActivity,
  getIssueDetails,
  getTeamWorkload,
  searchIssues,
} from "./linear-tools";

export const generateResponse = async (
  messages: CoreMessage[],
  updateStatus?: (status: string) => void,
) => {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    messages,
    system: `You are a helpful Slack bot that can report on Linear activity.
    - Keep responses concise and scannable for Slack
    - Use bullet points for lists of issues
    - Always include issue identifiers (like ENG-123) with their URLs
    - When summarizing activity, group by: created, completed, in progress
    - Format links for Slack using <url|text> syntax
    - Current date: ${new Date().toISOString().split("T")[0]}`,
    tools: {
      searchWeb: tool({
        description: "Search the web for information",
        parameters: z.object({
          query: z.string().describe("The search query to use"),
        }),
        execute: async ({ query }) => {
          const { results } = await exa.searchAndContents(query, {
            numResults: 3,
            text: { maxCharacters: 1000 },
          });
          return results;
        },
      }),
      getLinearActivity,
      getIssueDetails,
      getTeamWorkload,
      searchIssues,
    },
    maxSteps: 5,
    onStepFinish: ({ toolCalls }) => {
      if (updateStatus && toolCalls.length > 0) {
        const toolCall = toolCalls[0];
        if (toolCall.toolName === "searchWeb") {
          updateStatus(
            `Searching web for "${(toolCall.args as { query: string }).query}"...`,
          );
        } else if (toolCall.toolName === "getLinearActivity") {
          updateStatus("Fetching Linear activity...");
        } else if (toolCall.toolName === "getIssueDetails") {
          updateStatus(
            `Looking up ${(toolCall.args as { issueId: string }).issueId}...`,
          );
        } else if (toolCall.toolName === "getTeamWorkload") {
          updateStatus(
            `Checking workload for team ${(toolCall.args as { teamKey: string }).teamKey}...`,
          );
        } else if (toolCall.toolName === "searchIssues") {
          updateStatus("Searching Linear issues...");
        }
      }
    },
  });

  // Convert markdown to Slack mrkdwn format
  return text.replace(/\[(.*?)\]\((.*?)\)/g, "<$2|$1>").replace(/\*\*/g, "*");
};
