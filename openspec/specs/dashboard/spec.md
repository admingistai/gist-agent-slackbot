# dashboard Specification

## Purpose
TBD - created by archiving change add-dashboard-frontend. Update Purpose after archive.
## Requirements
### Requirement: Dashboard Web Application

The system SHALL provide a web-based dashboard for monitoring and testing the Gist-Agent Slackbot.

#### Scenario: Dashboard loads successfully
- **WHEN** a user navigates to the dashboard URL
- **THEN** the application displays the Overview tab with current stats
- **AND** all tabs (Overview, Ingested Content, Usage, Feedback, Test Bot) are accessible

#### Scenario: Real-time data updates
- **WHEN** new data is added to Convex (ingestion, query, feedback)
- **THEN** the dashboard updates within 2 seconds without manual refresh

### Requirement: Ingested Content View

The dashboard SHALL display all URLs ingested into the knowledge base with filtering capabilities.

#### Scenario: View all ingested URLs
- **WHEN** a user opens the Ingested Content tab
- **THEN** a table displays with columns: Title, URL, Category, Added By, Date, Chunks
- **AND** entries are sorted by date descending by default

#### Scenario: Filter by category
- **WHEN** a user selects a category filter (competitors, research, internal, general)
- **THEN** only entries matching that category are displayed

#### Scenario: Search ingested content
- **WHEN** a user enters a search term in the search field
- **THEN** entries are filtered to match the search term in title or URL

### Requirement: Bot Testing Interface

The dashboard SHALL provide an interface to test bot responses without using Slack.

#### Scenario: Send test message
- **WHEN** a user enters a message in the test interface and submits
- **THEN** the bot processes the message using the same logic as Slack
- **AND** the response is displayed with tool calls and token usage

#### Scenario: Conversation history in test
- **WHEN** a user sends multiple messages in the test interface
- **THEN** previous messages are maintained as context for subsequent responses

### Requirement: Dashboard Tech Stack

The dashboard SHALL be built with React 19, Bun, Vite, and shadcn/ui components.

#### Scenario: Development server starts
- **WHEN** a developer runs `bun run dev` in the dashboard directory
- **THEN** a Vite dev server starts with hot module replacement

#### Scenario: Production build succeeds
- **WHEN** a developer runs `bun run build`
- **THEN** an optimized production bundle is created in `dist/`

