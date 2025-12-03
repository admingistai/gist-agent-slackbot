# Change: Add Dashboard Frontend for Slackbot Analytics

## Why

The Gist-Agent Slackbot currently operates as a black box — there's no visibility into what content has been ingested, how many resources are consumed, or how well the bot is performing. A dashboard provides:

1. **Operational visibility** — See ingested URLs, chunk counts, and storage utilization
2. **Cost management** — Track token usage per query and cumulative totals
3. **Quality assurance** — Collect and review user feedback on bot responses
4. **Debugging** — Test bot responses without going through Slack

## What Changes

### New Capabilities
- **Dashboard Frontend** — React 19 + Bun + shadcn/ui web application
- **Analytics Tracking** — Token usage metrics stored per query and aggregated
- **Feedback Collection** — Slack reaction-based feedback (`reaction_added` event) with optional modal follow-up

### Backend Additions
- New Convex tables: `analytics`, `feedback`, `query_logs`
- New Convex queries for dashboard data aggregation
- Extended Slack event handler for `reaction_added` events

### Infrastructure
- Separate Bun-based frontend app (can be deployed to Vercel or standalone)
- Shared Convex backend between Slackbot and Dashboard

## Impact

- **Affected specs**: None (new capabilities)
- **Affected code**:
  - `convex/` — New tables and queries
  - `lib/generate-response.ts` — Add token tracking
  - `api/events.ts` — Handle `reaction_added` events
  - New `dashboard/` directory — Frontend application

## Success Criteria

1. Dashboard displays all ingested URLs with metadata (category, added by, date)
2. Real-time chunk count per namespace visible
3. Token usage tracked and displayed (per-query and rolling totals)
4. Feedback reactions captured and viewable with sentiment breakdown
5. Bot response testing interface functional without Slack
