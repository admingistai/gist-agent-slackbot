# Change: Display Question and Response in Feedback Tab

## Why

The Feedback tab currently only shows timestamp, user, reaction, sentiment, and an optional comment. This makes it difficult to understand the context of feedback—what question was asked and what response the bot gave. Without this context, feedback is less actionable for improving the bot.

## What Changes

- **Backend**: Store user question (`messageContent`) and bot response (`responseContent`) when logging queries
- **Backend**: Update `getFeedbackList` query to include linked question/response data
- **Frontend**: Update `FeedbackTab.tsx` to display question and response for each feedback entry

## Impact

- Affected specs: `feedback`
- Affected code:
  - `convex/schema.ts` — add `responseContent` field to `queryLogs`
  - `convex/dashboard.ts` — update `logQuery` mutation and `getFeedbackList` query
  - `lib/handle-app-mention.ts` — pass question and response to `logQuery`
  - `lib/handle-messages.ts` — pass question and response to `logQuery`
  - `dashboard/src/components/tabs/FeedbackTab.tsx` — display question/response

## Notes

- No additional Slack API permissions required—message content is already available at response time
- Uses existing `queryId` linking between `feedback` → `queryLogs` tables
