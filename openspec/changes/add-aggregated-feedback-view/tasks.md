# Tasks: Add Aggregated Feedback View

## 1. Backend

- [x] 1.1 Add `getFeedbackByResponse` query to `convex/dashboard.ts`
- [x] 1.2 Group feedback by `queryId` and count positive/negative/neutral
- [x] 1.3 Include question/response text from linked `queryLogs`
- [x] 1.4 Return aggregated results sorted by most recent feedback timestamp

## 2. Frontend

- [x] 2.1 Add view toggle ("By User" / "By Response") to FeedbackTab header
- [x] 2.2 Create `AggregatedFeedbackRow` component for grouped display
- [x] 2.3 Display reaction totals as "(+N)(−M)" with color coding
- [x] 2.4 Show net sentiment indicator (positive/negative/neutral badge)
- [x] 2.5 Keep expandable row behavior for full question/response text

## 3. Validation

- [x] 3.1 Test aggregation with multiple reactions on same response
- [x] 3.2 Verify toggle switches between views correctly
- [x] 3.3 Ensure responses with no `queryId` are handled gracefully
- [x] 3.4 Run TypeScript type check
