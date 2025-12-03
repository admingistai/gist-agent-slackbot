# feedback Specification

## Purpose
TBD - created by archiving change add-dashboard-frontend. Update Purpose after archive.
## Requirements
### Requirement: Slack Reaction Feedback Collection

The system SHALL capture user feedback via Slack reactions on bot messages.

#### Scenario: Positive reaction captured
- **WHEN** a user adds a :+1: (thumbs up) reaction to a bot message
- **THEN** the system stores feedback with sentiment "positive"
- **AND** links the feedback to the original query if available

#### Scenario: Negative reaction captured
- **WHEN** a user adds a :-1: (thumbs down) reaction to a bot message
- **THEN** the system stores feedback with sentiment "negative"
- **AND** links the feedback to the original query if available

#### Scenario: Non-feedback reactions ignored
- **WHEN** a user adds a reaction that is not :+1: or :-1:
- **THEN** the system does not store it as feedback

#### Scenario: Reactions on non-bot messages ignored
- **WHEN** a user adds a reaction to a message not posted by the bot
- **THEN** the system does not process it as feedback

### Requirement: Feedback Dashboard View

The dashboard SHALL display collected feedback with sentiment analysis and linked question/response context, with expandable rows to view full content.

#### Scenario: View feedback summary
- **WHEN** a user opens the Feedback tab
- **THEN** a summary shows: total feedback count, positive percentage, negative percentage

#### Scenario: View feedback list with context
- **WHEN** a user views the Feedback tab
- **THEN** a table shows recent feedback with: timestamp, user, reaction, sentiment, question (truncated), response (truncated)
- **AND** each row displays a chevron indicator showing it is expandable

#### Scenario: Expand row to see full content
- **WHEN** a user clicks on a feedback row
- **THEN** the row expands to reveal the full question and response text
- **AND** the chevron icon rotates to indicate expanded state

#### Scenario: Collapse expanded row
- **WHEN** a user clicks on an expanded feedback row
- **THEN** the row collapses back to show only truncated text
- **AND** the chevron icon rotates back to collapsed state

#### Scenario: Handle missing context gracefully
- **WHEN** feedback was recorded before question/response tracking was implemented
- **THEN** the expanded row displays "No question recorded" and "No response recorded" placeholders

#### Scenario: Filter by sentiment
- **WHEN** a user selects a sentiment filter (positive, negative, all)
- **THEN** only feedback matching that sentiment is displayed

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

