# Design: Dashboard Frontend

## Context

The Gist-Agent Slackbot uses Convex as its backend with RAG capabilities. We need a web dashboard to visualize ingestion, usage, and feedback data. The dashboard will share the existing Convex backend.

**Stakeholders**: Engineering team, product owners monitoring bot performance

**Constraints**:
- Must use existing Convex infrastructure (no new backend)
- Slack feedback requires subscribing to `reaction_added` events
- Token tracking must not impact response latency

## Goals / Non-Goals

### Goals
- Real-time dashboard showing ingestion stats, token usage, and feedback
- Test interface for bot responses without Slack
- Minimal latency impact on existing Slackbot functionality
- Modern, accessible UI with shadcn components

### Non-Goals
- User authentication for dashboard (v1 is internal-only)
- Historical data migration (starts tracking from deployment)
- Editing/deleting content from dashboard (read-only + test interface)
- Mobile-optimized design (desktop-first)

## Decisions

### 1. Frontend Stack: React 19 + Bun + Vite + shadcn/ui

**Decision**: Use Bun as runtime/bundler, React 19, Vite for dev server, shadcn/ui for components.

**Rationale**:
- Bun provides faster installs, builds, and runtime
- React 19 offers improved performance and new hooks
- shadcn/ui provides accessible, customizable components without heavy dependencies
- Vite integrates well with Bun and provides fast HMR

**Alternatives considered**:
- Next.js — Overkill for internal dashboard, adds complexity
- Remix — Good option but less familiar to team
- Plain React + Webpack — Slower than Vite

### 2. Token Tracking: Async logging with batch writes

**Decision**: Log token usage asynchronously after response generation, batch writes every 10 seconds.

**Rationale**:
- Avoids blocking response generation
- Reduces Convex write operations
- Acceptable data freshness for dashboard (near real-time, not instant)

**Schema**:
```typescript
// convex/schema.ts
queryLogs: defineTable({
  queryId: v.string(),
  userId: v.string(),
  channelId: v.string(),
  promptTokens: v.number(),
  completionTokens: v.number(),
  totalTokens: v.number(),
  model: v.string(),
  tools: v.array(v.string()),
  responseTime: v.number(),
  timestamp: v.number(),
})
```

### 3. Feedback Collection: Slack reactions + optional modal

**Decision**: Subscribe to `reaction_added` event, capture thumbs up/down reactions on bot messages, optionally prompt for detailed feedback via modal.

**Rationale**:
- Native Slack UX (users already react to messages)
- Low friction for simple feedback
- Modal provides qualitative data when needed

**Feedback flow**:
1. Bot posts response with message timestamp stored
2. User reacts with :+1: or :-1:
3. `reaction_added` event triggers
4. We check if reaction is on a bot message
5. Store feedback with sentiment and optional modal for :-1:

**Schema**:
```typescript
feedback: defineTable({
  messageTs: v.string(),
  channelId: v.string(),
  userId: v.string(),
  reaction: v.string(),
  sentiment: v.union(v.literal("positive"), v.literal("negative"), v.literal("neutral")),
  comment: v.optional(v.string()),
  queryId: v.optional(v.string()), // Link to query log
  timestamp: v.number(),
})
```

### 4. Dashboard Structure: Tab-based single page

**Decision**: Single page with tabs: Overview, Ingested Content, Usage, Feedback, Test Bot

**Rationale**:
- Simple navigation for internal tool
- All data on one page, no routing complexity
- Tabs align with shadcn patterns

**Components**:
```
dashboard/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── tabs/
│   │   │   ├── OverviewTab.tsx
│   │   │   ├── IngestedTab.tsx
│   │   │   ├── UsageTab.tsx
│   │   │   ├── FeedbackTab.tsx
│   │   │   └── TestBotTab.tsx
│   │   └── shared/
│   │       ├── StatsCard.tsx
│   │       └── DataTable.tsx
│   ├── hooks/
│   │   └── useConvex.ts
│   └── lib/
│       └── utils.ts
├── index.html
├── package.json
├── bunfig.toml
├── vite.config.ts
└── tsconfig.json
```

### 5. Convex Queries for Dashboard

**New queries**:
```typescript
// Dashboard stats
getIngestionStats()     // Total URLs, by category, recent additions
getChunkCounts()        // Chunks per namespace
getTokenUsage()         // Daily/weekly/monthly aggregates, per-query breakdown
getFeedbackSummary()    // Sentiment breakdown, recent feedback
getQueryLogs()          // Paginated query history

// Test interface
testBotResponse(message) // Direct bot invocation without Slack
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Token tracking adds latency | Async logging, batch writes |
| Reaction events may miss some feedback | Also provide in-chat `/feedback` command |
| Dashboard exposes internal data | Deploy to internal network or add basic auth in v2 |
| Convex costs increase with new tables | Monitor usage, implement data retention policies |

## Migration Plan

1. **Phase 1**: Add Convex tables and queries (no breaking changes)
2. **Phase 2**: Add token tracking to `generate-response.ts`
3. **Phase 3**: Add `reaction_added` event handler
4. **Phase 4**: Deploy dashboard frontend
5. **Rollback**: Remove event handler and queries if issues arise

No data migration needed — new tables start empty.

## Open Questions

1. **Data retention**: How long to keep query logs and feedback? (Suggest: 90 days)
2. **Access control**: Should dashboard require authentication in v1? (Suggest: No, internal only)
3. **Alerting**: Should we add alerts for high error rates or unusual token usage? (Suggest: v2)
