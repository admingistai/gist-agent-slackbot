# analytics Specification

## Purpose
TBD - created by archiving change add-dashboard-frontend. Update Purpose after archive.
## Requirements
### Requirement: Query Token Tracking

The system SHALL track token usage for every bot query and store metrics in Convex.

#### Scenario: Token usage logged per query
- **WHEN** the bot generates a response to a user message
- **THEN** the system logs: prompt tokens, completion tokens, total tokens, model used, tools invoked, response time
- **AND** the logging happens asynchronously without blocking the response

#### Scenario: Query log stored with context
- **WHEN** a query is logged
- **THEN** it includes: query ID, user ID, channel ID, timestamp
- **AND** the data is stored in the `queryLogs` Convex table

### Requirement: Token Usage Dashboard View

The dashboard SHALL display token usage statistics with filtering and aggregation.

#### Scenario: View usage summary
- **WHEN** a user opens the Usage tab
- **THEN** summary cards show: tokens today, tokens this week, tokens this month, total tokens

#### Scenario: View query log table
- **WHEN** a user views the Usage tab
- **THEN** a paginated table shows recent queries with: timestamp, user, tokens, model, response time

#### Scenario: Filter by date range
- **WHEN** a user selects a date range filter
- **THEN** all usage statistics and the query log update to reflect the selected period

### Requirement: Chunk Count Tracking

The dashboard SHALL display the number of vector chunks stored per knowledge base namespace.

#### Scenario: View chunk counts by namespace
- **WHEN** a user views the Overview or Ingested Content tab
- **THEN** chunk counts are displayed per namespace: competitors, research, internal, general

#### Scenario: Chunk count updates on ingestion
- **WHEN** new content is ingested into the knowledge base
- **THEN** the chunk count for the affected namespace updates in real-time

