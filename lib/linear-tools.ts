import { tool } from "ai";
import { z } from "zod";
import { linearClient } from "./linear-client";

// Helper to calculate date boundaries
const getTimeframeBoundary = (timeframe: "today" | "yesterday" | "this_week"): Date => {
  const now = new Date();
  const boundary = new Date(now);

  // Reset to start of day
  boundary.setHours(0, 0, 0, 0);

  switch (timeframe) {
    case "today":
      // Already start of today
      break;
    case "yesterday":
      boundary.setDate(boundary.getDate() - 1);
      break;
    case "this_week":
      boundary.setDate(boundary.getDate() - 7);
      break;
  }
  return boundary;
};

// Extract schemas for proper type inference
const getLinearActivitySchema = z.object({
  timeframe: z.enum(["today", "yesterday", "this_week"]).describe("The time period to check activity for"),
  teamKey: z.string().optional().describe("The team key (e.g. 'ENG') to filter by"),
  activityType: z.enum(["all", "created", "completed", "updated"]).default("all").describe("The type of activity to look for"),
});

const getIssueDetailsSchema = z.object({
  issueId: z.string().describe("The issue identifier (e.g. 'ENG-123')"),
});

const getTeamWorkloadSchema = z.object({
  teamKey: z.string().describe("The team key (e.g. 'ENG')"),
});

const searchIssuesSchema = z.object({
  query: z.string().optional().describe("Text to search for in title/description"),
  label: z.string().optional().describe("Filter by label name"),
  assigneeEmail: z.string().optional().describe("Filter by assignee email"),
});

// @ts-ignore - AI SDK v5 type instantiation too deep with zod
export const getLinearActivity = tool({
  description: "Get activity from Linear for a time period",
  inputSchema: getLinearActivitySchema,
  execute: async ({ timeframe, teamKey, activityType }: z.infer<typeof getLinearActivitySchema>) => {
    try {
      const boundary = getTimeframeBoundary(timeframe);
      const filter: any = {};

      // Add date filter based on activity type
      if (activityType === "created") {
        filter.createdAt = { gte: boundary };
      } else if (activityType === "completed") {
        filter.completedAt = { gte: boundary };
      } else if (activityType === "updated") {
        filter.updatedAt = { gte: boundary };
      } else {
        // For "all", usually we care about updated
        filter.updatedAt = { gte: boundary };
      }

      // Add team filter
      if (teamKey) {
        filter.team = { key: { eq: teamKey } };
      }

      // Query issues
      const issues = await linearClient.issues({
        filter,
        first: 10, // Limit to avoid blowing up context and timeouts
      });

      // Enrich issues (handle async relationships)
      const enrichedIssues = await Promise.all(
        issues.nodes.map(async (issue) => {
          const state = await issue.state;
          const assignee = await issue.assignee;
          return {
            identifier: issue.identifier,
            title: issue.title,
            url: issue.url,
            state: state?.name,
            assignee: assignee?.name,
            createdAt: issue.createdAt,
            completedAt: issue.completedAt,
            updatedAt: issue.updatedAt,
          };
        })
      );

      // Categorize
      const categorized = {
        created: enrichedIssues.filter(i => new Date(i.createdAt) >= boundary),
        completed: enrichedIssues.filter(i => i.completedAt && new Date(i.completedAt) >= boundary),
        inProgress: enrichedIssues.filter(i => !i.completedAt && new Date(i.createdAt) < boundary), // Roughly
      };

      return {
        summary: `Found ${enrichedIssues.length} active issues since ${boundary.toLocaleDateString()}`,
        categorized,
      };
    } catch (error) {
      return { error: `Error fetching Linear activity: ${error instanceof Error ? error.message : String(error)}` };
    }
  },
});

// @ts-ignore - AI SDK v5 type instantiation too deep with zod
export const getIssueDetails = tool({
  description: "Get detailed information about a specific Linear issue",
  inputSchema: getIssueDetailsSchema,
  execute: async ({ issueId }: z.infer<typeof getIssueDetailsSchema>) => {
    try {
      const issue = await linearClient.issue(issueId);

      const [state, assignee, labels, comments] = await Promise.all([
        issue.state,
        issue.assignee,
        issue.labels(),
        issue.comments({ first: 3 }),
      ]);

      return {
        identifier: issue.identifier,
        title: issue.title,
        description: issue.description?.slice(0, 500), // Truncate
        priority: issue.priority,
        estimate: issue.estimate,
        state: state?.name,
        assignee: assignee?.name,
        labels: labels.nodes.map(l => l.name),
        recentComments: await Promise.all(comments.nodes.map(async c => {
          const user = await c.user;
          return {
            body: c.body,
            createdAt: c.createdAt,
            user: user?.name
          };
        })),
        url: issue.url,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      };
    } catch (error) {
      return { error: `Could not find issue ${issueId}` };
    }
  },
});

// @ts-ignore - AI SDK v5 type instantiation too deep with zod
export const getTeamWorkload = tool({
  description: "Get workload overview for a team",
  inputSchema: getTeamWorkloadSchema,
  execute: async ({ teamKey }: z.infer<typeof getTeamWorkloadSchema>) => {
    try {
      const team = await linearClient.team(teamKey);
      const [issues, activeCycle] = await Promise.all([
        team.issues({ first: 20, filter: { state: { type: { neq: "completed" } } } }), // Open issues
        team.activeCycle
      ]);

      // Group by state
      const byState: Record<string, number> = {};
      for (const issue of issues.nodes) {
        const state = await issue.state;
        const stateName = state?.name || "Unknown";
        byState[stateName] = (byState[stateName] || 0) + 1;
      }

      return {
        teamName: team.name,
        totalOpenIssues: issues.nodes.length,
        breakdownByState: byState,
        activeCycle: activeCycle ? {
          name: activeCycle.name,
          progress: activeCycle.progress,
          endsAt: activeCycle.endsAt,
        } : "No active cycle",
      };
    } catch (error) {
      return { error: `Could not find team ${teamKey}` };
    }
  },
});

// @ts-ignore - AI SDK v5 type instantiation too deep with zod
export const searchIssues = tool({
  description: "Search for issues by keyword, label, or assignee",
  inputSchema: searchIssuesSchema,
  execute: async ({ query, label, assigneeEmail }: z.infer<typeof searchIssuesSchema>) => {
    const filter: any = {};

    if (label) filter.labels = { name: { eq: label } };
    if (assigneeEmail) filter.assignee = { email: { eq: assigneeEmail } };

    // Linear doesn't have a direct text search in the basic filter object in the same way for all fields,
    // but `issues` query supports a `filter`.
    // For full text search we might rely on the `linearClient.search` or client-side filtering.
    // The prompt suggests "Do client-side text search on title/description if query provided".

    // Let's fetch recent issues (limit 50) and filter client side if query exists,
    // or if no other filter is provided, maybe just fetch recent.
    // If `query` is provided but no other filter, we should probably use `linearClient.issueSearch(query)`.

    if (query && !label && !assigneeEmail) {
      // Use dedicated search if only query is present
      const results = await linearClient.issueSearch({ query });
      return Promise.all(results.nodes.slice(0, 10).map(async (issue) => {
        const state = await issue.state;
        return {
            identifier: issue.identifier,
            title: issue.title,
            state: state?.name,
            url: issue.url
        };
      }));
    }

    // Otherwise fall back to filtering list
    const issues = await linearClient.issues({
        filter,
        first: 50
    });

    let results = issues.nodes;

    if (query) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(i =>
            i.title.toLowerCase().includes(lowerQuery) ||
            (i.description || "").toLowerCase().includes(lowerQuery)
        );
    }

    const finalResults = await Promise.all(
        results.slice(0, 10).map(async (issue) => {
            const state = await issue.state;
            return {
                identifier: issue.identifier,
                title: issue.title,
                state: state?.name,
                url: issue.url
            }
        })
    );

    return finalResults;
  },
});
