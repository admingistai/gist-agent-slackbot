# Project Context

## Purpose

**Gist-Agent** — An AI-powered Slack chatbot for the Gist GEO team that serves as a centralized knowledge and productivity assistant.

### Goals
- Provide instant access to team knowledge (competitors, research, internal docs)
- Integrate with Linear for issue tracking and team workload visibility
- Enable web search and content ingestion from URLs
- Maintain conversation context within Slack threads and DMs

## Tech Stack

### Runtime & Language
- **TypeScript** (strict mode, ESNext target)
- **Node.js** 18+
- **pnpm** as package manager

### AI & LLM
- **Vercel AI SDK** (`ai@5.x`) — Core AI orchestration with tool calling
- **@ai-sdk/openai** — OpenAI provider (using `gpt-4o-mini`)
- **Zod** — Schema validation for tool parameters

### Backend & Database
- **Convex** — Real-time backend with RAG (Retrieval-Augmented Generation)
- **@convex-dev/rag** — Vector search and knowledge base functionality

### Integrations
- **@slack/web-api** — Slack Bot API
- **@linear/sdk** — Linear project management
- **exa-js** — Web search powered by Exa

### Deployment
- **Vercel Functions** — Serverless API endpoints (60s timeout)
- **Vercel** — Hosting and deployment platform

## Project Conventions

### Code Style
- **Functional approach** — Prefer pure functions and explicit data flow
- **Async/await** — Use async functions for all asynchronous operations
- **Named exports** — Export functions and types by name, not default
- **Type-first** — Define interfaces/types before implementations
- **Zod schemas** — Use Zod for runtime validation of tool inputs

### Naming Conventions
- Files: `kebab-case.ts` (e.g., `generate-response.ts`)
- Functions: `camelCase` (e.g., `generateResponse`)
- Types/Interfaces: `PascalCase` (e.g., `GenerateContext`)
- Tools: `camelCase` verb-noun pattern (e.g., `searchKnowledgeBase`)

### Architecture Patterns

```
api/
  events.ts          # Single entry point for Slack webhooks

lib/
  generate-response.ts   # Main AI generation with tool orchestration
  *-tools.ts            # Tool definitions grouped by domain
  handle-*.ts           # Event handlers for different Slack events
  *-client.ts           # API client initializations
  slack-utils.ts        # Slack-specific utilities

convex/
  rag.ts               # RAG configuration
  search.ts            # Knowledge base queries
  ingest.ts            # Content ingestion
  delete.ts            # Content removal
```

**Key Patterns:**
- **Tool-based architecture** — AI capabilities exposed via AI SDK tools
- **Event-driven** — Slack webhooks trigger serverless functions
- **Namespace-based RAG** — Knowledge organized into categories: `competitors`, `research`, `internal`, `general`
- **Status callbacks** — Real-time status updates during tool execution

### Testing Strategy
- Currently no formal test suite
- Manual testing via Slack interactions
- Local development uses Vercel CLI + untun for tunneling

### Git Workflow
- **Main branch**: `main`
- **Commit format**: Conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- Commits include AI generation footer when assisted

## Domain Context

### Knowledge Categories
The knowledge base uses four namespaces:
1. **competitors** — Information about competitors (AirOps, Jasper, etc.)
2. **research** — Industry research and reports
3. **internal** — Internal company documentation
4. **general** — Miscellaneous knowledge

### Linear Integration
- Fetches issue activity and details
- Tracks team workload by team key
- Searches issues with filters

### Slack Message Formatting
- Convert markdown links to Slack format: `[text](url)` → `<url|text>`
- Convert bold: `**text**` → `*text*`
- Use bullet points for lists

## Important Constraints

- **60-second timeout** — Vercel function limit for API responses
- **7-step limit** — AI generation stops after 7 tool call steps
- **Vector threshold** — Knowledge search uses 0.5 score threshold
- **Article limit** — Content ingestion capped at 50k characters

## External Dependencies

### Required API Keys
| Service | Environment Variable | Purpose |
|---------|---------------------|---------|
| Slack | `SLACK_BOT_TOKEN` | Bot authentication |
| Slack | `SLACK_SIGNING_SECRET` | Request verification |
| OpenAI | `OPENAI_API_KEY` | LLM inference |
| Exa | `EXA_API_KEY` | Web search |
| Linear | `LINEAR_API_KEY` | Project management |
| Convex | `CONVEX_URL` | Backend connection |

### External Services
- **Slack Events API** — Receives `app_mention`, `assistant_thread_started`, `message:im`
- **Linear API** — Issue tracking and team workload
- **Exa API** — Web search and content scraping
- **Convex Cloud** — Hosted backend with vector search
