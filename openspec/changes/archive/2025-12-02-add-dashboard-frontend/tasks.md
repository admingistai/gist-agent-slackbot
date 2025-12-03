# Tasks: Add Dashboard Frontend

## 1. Backend: Convex Schema & Queries

### 1.1 Schema Updates
- [x] 1.1.1 Create `queryLogs` table in Convex schema
- [x] 1.1.2 Create `feedback` table in Convex schema
- [x] 1.1.3 Add indexes for efficient dashboard queries
- [ ] 1.1.4 Run `npx convex dev` to validate schema

### 1.2 Dashboard Queries
- [x] 1.2.1 Create `convex/dashboard.ts` with stats queries
- [x] 1.2.2 Implement `getIngestionStats` — URL counts by category
- [x] 1.2.3 Implement `getChunkCounts` — entries per namespace
- [x] 1.2.4 Implement `getTokenUsage` — aggregated token metrics
- [x] 1.2.5 Implement `getFeedbackSummary` — sentiment breakdown
- [x] 1.2.6 Implement `getQueryLogs` — paginated query history
- [x] 1.2.7 Implement `testBotResponse` — via separate API endpoint `/api/test-bot`

### 1.3 Token Tracking
- [x] 1.3.1 Create `logQuery` mutation in Convex
- [x] 1.3.2 Modify `lib/generate-response.ts` to capture token counts
- [x] 1.3.3 Add async logging after response generation
- [ ] 1.3.4 Test token tracking doesn't impact response time

## 2. Backend: Slack Feedback Integration

### 2.1 Event Handler
- [ ] 2.1.1 Add `reaction_added` to Slack app event subscriptions (manual step)
- [x] 2.1.2 Create `lib/handle-reaction.ts` for reaction events
- [x] 2.1.3 Filter for reactions on bot messages only
- [x] 2.1.4 Map reactions to sentiment (`:+1:` → positive, `:-1:` → negative)
- [x] 2.1.5 Store feedback in Convex

### 2.2 Message Tracking
- [x] 2.2.1 Store bot message timestamps after posting
- [x] 2.2.2 Link feedback to original query via message timestamp
- [ ] 2.2.3 Test reaction → feedback flow end-to-end

## 3. Frontend: Project Setup

### 3.1 Initialize Dashboard App
- [x] 3.1.1 Create `dashboard/` directory structure
- [x] 3.1.2 Initialize with Bun + Vite + React 19
- [x] 3.1.3 Configure package.json and tsconfig.json
- [x] 3.1.4 Install dependencies: `convex`, `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`
- [x] 3.1.5 Configure Tailwind CSS
- [x] 3.1.6 Set up shadcn-style components manually

### 3.2 shadcn Components
- [x] 3.2.1 Add Tabs component
- [x] 3.2.2 Add Card component
- [x] 3.2.3 Add Table (native)
- [x] 3.2.4 Add Button component
- [x] 3.2.5 Add Badge component
- [x] 3.2.6 Add Textarea component

### 3.3 Convex Integration
- [x] 3.3.1 Configure Convex client in dashboard
- [x] 3.3.2 Create `ConvexProvider` wrapper
- [ ] 3.3.3 Test connection to existing Convex backend

## 4. Frontend: Dashboard Views

### 4.1 Overview Tab
- [x] 4.1.1 Create `OverviewTab.tsx` component
- [x] 4.1.2 Add stats cards: Total URLs, Queries Today, Tokens Today, Feedback Score
- [x] 4.1.3 Add recent activity feed
- [x] 4.1.4 Style with shadcn Card components

### 4.2 Ingested Content Tab
- [x] 4.2.1 Create `IngestedTab.tsx` component
- [x] 4.2.2 Add data table with columns: Title, URL, Category, Added By, Date
- [ ] 4.2.3 Add category filter dropdown
- [ ] 4.2.4 Add search/filter functionality
- [ ] 4.2.5 Show chunk count per entry

### 4.3 Usage Tab
- [x] 4.3.1 Create `UsageTab.tsx` component
- [x] 4.3.2 Add token usage summary cards (today, week, month, total)
- [x] 4.3.3 Add query log table with token breakdown
- [ ] 4.3.4 Add date range filter
- [ ] 4.3.5 Show cost estimates (optional)

### 4.4 Feedback Tab
- [x] 4.4.1 Create `FeedbackTab.tsx` component
- [x] 4.4.2 Add sentiment summary (positive/negative/neutral percentages)
- [x] 4.4.3 Add feedback list with reaction, user, timestamp
- [x] 4.4.4 Link to original query/response when available
- [ ] 4.4.5 Add filter by sentiment

### 4.5 Test Bot Tab
- [x] 4.5.1 Create `TestBotTab.tsx` component
- [x] 4.5.2 Add message input textarea
- [x] 4.5.3 Add conversation history display
- [x] 4.5.4 Connect to `/api/test-bot` endpoint
- [x] 4.5.5 Show tool calls and response time for test queries

## 5. Integration & Polish

### 5.1 App Shell
- [x] 5.1.1 Create main `App.tsx` with tab navigation
- [x] 5.1.2 Add header with title and refresh button
- [x] 5.1.3 Add real-time updates via Convex subscriptions
- [ ] 5.1.4 Add loading states and error handling

### 5.2 Deployment
- [x] 5.2.1 Update `vercel.json` for test-bot endpoint
- [ ] 5.2.2 Configure environment variables
- [ ] 5.2.3 Test production build with `bun run build`
- [ ] 5.2.4 Deploy to Vercel or preferred host

### 5.3 Documentation
- [ ] 5.3.1 Update README with dashboard setup instructions
- [ ] 5.3.2 Document environment variables needed
- [ ] 5.3.3 Add screenshots to docs
