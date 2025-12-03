## MODIFIED Requirements

### Requirement: Feedback Dashboard View

The dashboard SHALL display collected feedback with sentiment analysis and linked question/response context.

#### Scenario: View feedback summary
- **WHEN** a user opens the Feedback tab
- **THEN** a summary shows: total feedback count, positive percentage, negative percentage

#### Scenario: View feedback list with context
- **WHEN** a user views the Feedback tab
- **THEN** a table shows recent feedback with: timestamp, user, reaction, sentiment, question (truncated), response (truncated)

#### Scenario: View full question and response
- **WHEN** a user expands a feedback row or hovers over truncated text
- **THEN** the full question and response text is displayed

#### Scenario: Filter by sentiment
- **WHEN** a user selects a sentiment filter (positive, negative, all)
- **THEN** only feedback matching that sentiment is displayed

#### Scenario: Handle missing context gracefully
- **WHEN** feedback was recorded before question/response tracking was implemented
- **THEN** the question and response columns display "—" placeholder

## MODIFIED Requirements

### Requirement: Bot Message Tracking

The system SHALL track bot message content to enable feedback context display.

#### Scenario: Bot message timestamp stored
- **WHEN** the bot posts a response message to Slack
- **THEN** the message timestamp is stored with a reference to the query ID

#### Scenario: User question stored
- **WHEN** the bot processes a user message
- **THEN** the user's question text is stored in queryLogs.messageContent

#### Scenario: Bot response stored
- **WHEN** the bot generates a response
- **THEN** the bot's response text is stored in queryLogs.responseContent

#### Scenario: Feedback linked to query
- **WHEN** feedback is received for a tracked bot message
- **THEN** the feedback record includes the associated query ID
- **AND** the dashboard can display the original question and response alongside feedback
