# Architecture: Current State & Target

## Overview

This document compares the current implementation against the target multi-agent intelligence system.

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CURRENT STATE                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌─────────────────┐     ┌──────────────────────────────┐
│    Slack     │────▶│  Vercel Edge    │────▶│   AI SDK (generateText)     │
│  (mentions,  │     │  api/events.ts  │     │   GPT-4o-mini               │
│   DMs)       │     │                 │     │   Single "Gist-Agent"       │
└──────────────┘     └─────────────────┘     └──────────────────────────────┘
                                                          │
                            ┌─────────────────────────────┼─────────────────┐
                            ▼                             ▼                 ▼
                    ┌───────────────┐          ┌─────────────────┐  ┌─────────────┐
                    │  Linear API   │          │  Convex RAG     │  │  Exa API    │
                    │  (on-demand)  │          │  Knowledge Base │  │  (search +  │
                    │               │          │                 │  │   scrape)   │
                    └───────────────┘          └─────────────────┘  └─────────────┘
                                                      │
                                               ┌──────┴──────┐
                                               │  Manual     │
                                               │  Ingestion  │
                                               │  via Slack  │
                                               │  "ingest X" │
                                               └─────────────┘
```

### Current Components

| Component | Implementation | Status |
|-----------|---------------|--------|
| **Slack Bot** | Vercel Edge Functions | ✅ Working |
| **LLM** | GPT-4o-mini via AI SDK | ✅ Working |
| **Knowledge Base** | Convex RAG (vector DB) | ✅ Working |
| **Linear Integration** | @linear/sdk | ✅ Working |
| **Web Search** | Exa API | ✅ Working |
| **URL Scraping** | Exa getContents | ✅ Working |
| **Ingestion** | Manual via Slack commands | ✅ Working |
| **Delete** | Manual via Slack commands | ✅ Working |

### Current Tools

```typescript
// lib/generate-response.ts
tools: {
  searchWeb,              // Exa web search
  scrapeUrl,              // Exa content extraction
  getLinearActivity,      // Linear issues by timeframe
  getIssueDetails,        // Single Linear issue
  getTeamWorkload,        // Team workload overview
  searchIssues,           // Search Linear issues
  searchKnowledgeBase,    // RAG semantic search
  listKnowledgeEntries,   // List KB articles
  deleteFromKnowledgeBase,// Delete by URL
  ingestContent,          // Manual URL ingestion
}
```

### Current Data Flow

1. **Ingestion**: User says "ingest [URL]" → Exa scrapes → Convex RAG stores
2. **Query**: User asks question → RAG search → LLM synthesizes → Slack response
3. **Linear**: User asks about issues → Linear API → LLM formats → Slack response

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TARGET STATE                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SOURCES                                     │
│  Reddit | Twitter | ArXiv | LinkedIn | YouTube | GitHub | IR Pages | Sites  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           JOBS / WORKERS                                     │
│                    (Scheduled - Inngest/Trigger.dev)                         │
│  • Crawlers (Firecrawl/Playwright)                                          │
│  • API Fetchers (Twitter, Reddit, GitHub, Linear)                           │
│  • RSS Monitors                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INGESTION SERVER                                     │
│  • Content cleaning & extraction                                             │
│  • Chunking (semantic, ~500-1000 tokens)                                    │
│  • Embedding (OpenAI text-embedding-3-small)                                │
│  • Metadata tagging (source, date, entity, category)                        │
│  • Deduplication                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATABASE / KNOWLEDGE BASE                                 │
│                         (Convex RAG)                                         │
│                                                                              │
│  Namespaces:                                                                 │
│  ├── context      (Linear, GitHub, Slack, Figma, meetings)                  │
│  ├── competitors  (competitor sites, social, news)                          │
│  ├── research     (arXiv, industry news, thought leaders)                   │
│  └── internal     (company docs, policies)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AGENT RUNTIME                                       │
│                    (LangChain / AI SDK / Custom)                            │
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  Context EM/PM      │  │  Competitive        │  │  Industry Research  │  │
│  │  Agent              │  │  Research Agent     │  │  Agent              │  │
│  │                     │  │                     │  │                     │  │
│  │  • Sprint status    │  │  • Competitor       │  │  • arXiv papers     │  │
│  │  • PR reviews       │  │    activity         │  │  • AI/ML trends     │  │
│  │  • Design updates   │  │  • Funding alerts   │  │  • New tools        │  │
│  │  • Who owns what    │  │  • Feature launches │  │  • Research papers  │  │
│  │  • Project status   │  │  • Social mentions  │  │  • HN/Reddit        │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SLACK BOT                                         │
│  • Daily digest messages (9 AM PT)                                          │
│  • Urgent alerts (funding, launches)                                        │
│  • On-demand queries (@mention, DM)                                         │
│  • Weekly rollups                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │    SLACK      │
                            │   CHANNEL     │
                            └───────────────┘
```

---

## Gap Analysis

### What We Have vs What We Need

| Capability | Current | Target | Gap |
|------------|---------|--------|-----|
| **Ingestion** | Manual (user triggers) | Automated (scheduled workers) | 🔴 Need workers |
| **Sources** | URLs via Exa | Reddit, Twitter, ArXiv, GitHub, LinkedIn, etc. | 🔴 Need crawlers |
| **Agents** | 1 (Gist-Agent) | 3 (Context, Competitive, Industry) | 🔴 Need multi-agent |
| **Daily Digest** | None | 9 AM automated briefing | 🔴 Need scheduler |
| **Urgent Alerts** | None | Funding/launch detection | 🔴 Need alerting |
| **Knowledge Base** | Convex RAG | Convex RAG (expanded) | 🟡 Need more namespaces |
| **Linear** | On-demand queries | Continuous sync + digest | 🟡 Need webhook/cron |
| **GitHub** | None | PR/commit tracking | 🔴 Need integration |
| **Slack History** | None | Search past discussions | 🔴 Need integration |

### Priority Order

```
Phase 1: Automated Ingestion Infrastructure
├── Scheduled workers (Inngest/Trigger.dev)
├── Crawlers for competitor sites
├── RSS/feed monitoring
└── Deduplication logic

Phase 2: Multi-Agent System
├── Agent controller/router
├── Context Agent (Linear + GitHub + Slack)
├── Competitive Agent (competitor sources)
└── Industry Agent (arXiv + HN + Reddit)

Phase 3: Proactive Intelligence
├── Daily digest scheduler
├── Urgent alert detection
├── Weekly rollup generation
└── Sentiment analysis

Phase 4: Additional Sources
├── Twitter/X API
├── LinkedIn scraping
├── Figma API
└── Meeting notes integration
```

---

## Implementation Roadmap

### Phase 1: Automated Ingestion (Weeks 1-2)

**Goal**: Replace manual ingestion with scheduled workers

```
TODO:
├── [ ] Set up Inngest or Trigger.dev
├── [ ] Create competitor site crawler (Firecrawl)
├── [ ] Add RSS feed monitoring
├── [ ] Implement content deduplication
├── [ ] Add source freshness tracking
└── [ ] Health monitoring for ingestion jobs
```

**New Files:**
- `jobs/crawl-competitors.ts`
- `jobs/monitor-rss.ts`
- `jobs/sync-linear.ts`
- `lib/deduplication.ts`

### Phase 2: Multi-Agent System (Weeks 3-4)

**Goal**: Split single agent into 3 specialized agents

```
TODO:
├── [ ] Create agent controller/router
├── [ ] Build Context Agent
│   ├── Linear integration (existing)
│   ├── GitHub integration (new)
│   └── Slack history search (new)
├── [ ] Build Competitive Agent
│   ├── Query competitors namespace
│   └── Relevance filtering
├── [ ] Build Industry Agent
│   ├── arXiv integration
│   └── HN/Reddit monitoring
└── [ ] Query routing logic
```

**New Files:**
- `lib/agents/controller.ts`
- `lib/agents/context-agent.ts`
- `lib/agents/competitive-agent.ts`
- `lib/agents/industry-agent.ts`
- `lib/github-tools.ts`
- `lib/slack-history-tools.ts`

### Phase 3: Proactive Intelligence (Weeks 5-6)

**Goal**: Automated digests and alerts

```
TODO:
├── [ ] Daily digest generator (9 AM PT)
├── [ ] Urgent alert detection
│   ├── Funding announcements
│   ├── Feature launches
│   └── Executive changes
├── [ ] Weekly rollup generator
├── [ ] Sentiment analysis for competitive intel
└── [ ] Admin config for alert thresholds
```

**New Files:**
- `jobs/daily-digest.ts`
- `jobs/urgent-alerts.ts`
- `lib/sentiment-analysis.ts`
- `lib/alert-detection.ts`

### Phase 4: Source Expansion (Weeks 7-8)

**Goal**: Add remaining data sources

```
TODO:
├── [ ] Twitter/X API integration
├── [ ] LinkedIn company page monitoring
├── [ ] arXiv API integration
├── [ ] Figma API (file metadata)
├── [ ] Reddit API (subreddit monitoring)
└── [ ] HN Algolia search integration
```

**New Files:**
- `jobs/crawl-twitter.ts`
- `jobs/crawl-linkedin.ts`
- `jobs/crawl-arxiv.ts`
- `jobs/crawl-reddit.ts`
- `jobs/crawl-hackernews.ts`
- `lib/twitter-tools.ts`

---

## Data Source Refresh Rates

| Source | Frequency | Agent | Priority |
|--------|-----------|-------|----------|
| Linear API | Hourly | Context | P0 |
| GitHub API | Hourly | Context | P1 |
| Competitor sites | Every 6 hours | Competitive | P0 |
| Twitter/X | Every 2 hours | Competitive + Industry | P1 |
| arXiv | Daily | Industry | P1 |
| Reddit | Every 4 hours | Competitive + Industry | P2 |
| Hacker News | Every 4 hours | Competitive + Industry | P2 |
| TechCrunch RSS | Hourly | Competitive | P1 |
| Slack history | Hourly | Context | P2 |
| Figma API | Every 4 hours | Context | P3 |

---

## Knowledge Base Schema (Target)

```typescript
interface KBDocument {
  id: string;
  content: string;
  embedding: number[];  // 1536-dim
  metadata: {
    // Core
    source: 'linear' | 'github' | 'twitter' | 'arxiv' | 'competitor_site' | 'reddit' | 'hn';
    sourceUrl: string;
    timestamp: Date;

    // Classification
    agentType: 'context' | 'competitive' | 'industry';
    category: 'competitors' | 'research' | 'internal' | 'general';

    // Entities
    entities?: string[];        // Companies, people, products mentioned
    competitor?: string;        // If about a specific competitor

    // Quality
    freshness_score?: number;   // Decay over time (1.0 = new, 0.0 = stale)
    relevance_score?: number;   // ML-scored relevance
    sentiment?: 'positive' | 'negative' | 'neutral';

    // Tracking
    addedBy: string;
    addedAt: string;
    lastRefreshed?: string;
  };
}
```

---

## Tech Stack

### Current
- **Runtime**: Vercel Edge Functions
- **LLM**: OpenAI GPT-4o-mini (AI SDK)
- **Vector DB**: Convex RAG
- **Embeddings**: OpenAI text-embedding-3-small
- **Web Scraping**: Exa API
- **Project Tracking**: Linear SDK

### Target Additions
- **Job Scheduler**: Inngest or Trigger.dev
- **Crawling**: Firecrawl API or Playwright
- **Agent Framework**: LangGraph or custom AI SDK agents
- **Monitoring**: LangSmith (optional)
- **Additional APIs**: Twitter, Reddit, GitHub, arXiv

---

## Cost Estimates (Monthly)

| Service | Current | Target | Notes |
|---------|---------|--------|-------|
| OpenAI (LLM) | ~$20 | ~$100 | More queries, digests |
| OpenAI (Embeddings) | ~$5 | ~$30 | Automated ingestion |
| Exa API | ~$10 | ~$50 | More scraping |
| Convex | Free tier | ~$25 | More storage |
| Inngest/Trigger | $0 | ~$20 | Job scheduling |
| Twitter API | $0 | ~$100 | Basic tier |
| Vercel | Free tier | Free tier | Should be fine |
| **Total** | **~$35** | **~$325** | |

---

## Open Questions

1. **Which competitors to track?** (need prioritized list)
2. **Twitter API budget?** ($100/mo for basic access)
3. **Slack history access?** (privacy/compliance concerns)
4. **Admin interface needed?** (add/remove competitors, tune thresholds)
5. **Alert thresholds?** (what triggers "urgent"?)
6. **Digest timing?** (9 AM PT or different?)
