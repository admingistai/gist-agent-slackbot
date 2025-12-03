# Tasks: Update Feedback Display

## 1. Schema & Backend Updates

- [x] 1.1 Add `responseContent` field to `queryLogs` table in `convex/schema.ts`
- [x] 1.2 Update `logQuery` mutation in `convex/dashboard.ts` to accept `responseContent`
- [x] 1.3 Update `getFeedbackList` query to join `queryLogs` and return `messageContent` + `responseContent`

## 2. Event Handler Updates

- [x] 2.1 Update `handle-app-mention.ts` to pass `messageContent` (user question) to `logQuery`
- [x] 2.2 Update `handle-app-mention.ts` to pass `responseContent` (bot response) to `logQuery`
- [x] 2.3 Update `handle-messages.ts` to pass `messageContent` to `logQuery`
- [x] 2.4 Update `handle-messages.ts` to pass `responseContent` to `logQuery`

## 3. Frontend Updates

- [x] 3.1 Update `FeedbackTab.tsx` table to add "Question" and "Response" columns
- [x] 3.2 Add expandable row or tooltip for long question/response text
- [x] 3.3 Handle missing question/response gracefully (older feedback entries)

## 4. Validation

- [x] 4.1 Test feedback display with new data
- [x] 4.2 Verify existing feedback entries display correctly (with "—" for missing data)
- [x] 4.3 Run Convex type generation and fix any type errors
