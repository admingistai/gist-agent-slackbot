import { tool } from "ai";
import { z } from "zod";
import { exa } from "./utils";

// Extract schemas for proper type inference
const searchWebSchema = z.object({
  query: z.string().describe("The search query to use"),
});

const scrapeUrlSchema = z.object({
  url: z.string().describe("The URL to scrape"),
});

// @ts-ignore - AI SDK v5 type instantiation too deep with zod
export const searchWeb = tool({
  description: "Search the web for information",
  inputSchema: searchWebSchema,
  execute: async ({ query }: z.infer<typeof searchWebSchema>) => {
    const { results } = await exa.searchAndContents(query, {
      numResults: 3,
      text: { maxCharacters: 1000 },
    });
    return results;
  },
});

// @ts-ignore - AI SDK v5 type instantiation too deep with zod
export const scrapeUrl = tool({
  description: "Scrape and read the content of a specific URL. Use this when the user provides a link to 'read', 'ingest', or 'summarize'.",
  inputSchema: scrapeUrlSchema,
  execute: async ({ url }: z.infer<typeof scrapeUrlSchema>) => {
    try {
      console.log(`Scraping URL: ${url}`);
      const { results } = await exa.getContents([url], {
        text: { maxCharacters: 4000 }, // Get up to 4000 chars of text
      });

      if (!results || results.length === 0) {
        console.log(`No results found for URL: ${url}`);
        return { error: "Could not retrieve content from this URL. It might be behind a paywall or inaccessible." };
      }

      console.log(`Successfully scraped URL: ${url} (${results[0].text.length} chars)`);
      return {
        url: results[0].url,
        title: results[0].title,
        text: results[0].text,
      };
    } catch (error) {
      console.error(`Error scraping URL ${url}:`, error);
      return { error: `Failed to scrape URL: ${error instanceof Error ? error.message : String(error)}` };
    }
  },
});
