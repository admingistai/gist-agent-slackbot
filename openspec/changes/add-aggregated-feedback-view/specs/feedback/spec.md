## MODIFIED Requirements

### Requirement: Feedback Dashboard View

The dashboard SHALL display collected feedback with sentiment analysis and linked question/response context, with expandable rows to view full content. Users can toggle between per-user view and aggregated per-response view.

#### Scenario: View feedback summary
- **WHEN** a user opens the Feedback tab
- **THEN** a summary shows: total feedback count, positive percentage, negative percentage

#### Scenario: View feedback list with context (By User view)
- **WHEN** a user views the Feedback tab in "By User" mode
- **THEN** a table shows recent feedback with: timestamp, user, reaction, sentiment, question (truncated), response (truncated)
- **AND** each row displays a chevron indicator showing it is expandable

#### Scenario: View aggregated feedback (By Response view)
- **WHEN** a user views the Feedback tab in "By Response" mode
- **THEN** a table shows feedback grouped by bot response with: timestamp, reaction totals "(+N)(−M)", net sentiment, question (truncated), response (truncated)
- **AND** each row displays a chevron indicator showing it is expandable

#### Scenario: Toggle between views
- **WHEN** a user clicks the view toggle
- **THEN** the display switches between "By User" and "By Response" modes
- **AND** the selected view is visually indicated

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
