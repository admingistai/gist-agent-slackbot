# Change: Add Aggregated Feedback View

## Why

The Recent Feedback tab currently displays one row per user reaction. When multiple users react to the same bot response, there's no way to see the aggregate sentiment at a glance. Users want to see totals like "(+3)(-2) → net +1" to quickly understand how well a response was received.

## What Changes

- **Backend**: Add new query `getFeedbackByResponse` that groups feedback by `queryId` and counts positive/negative reactions
- **Frontend**: Add a new "By Response" view toggle in FeedbackTab that shows aggregated reaction counts per bot response
- **Display**: Show reaction totals as "(+N)(−M)" with net sentiment indicator

## Impact

- Affected specs: `feedback`
- Affected code:
  - `convex/dashboard.ts` — Add aggregation query
  - `dashboard/src/components/tabs/FeedbackTab.tsx` — Add view toggle and aggregated display

## Notes

- Existing per-user view remains available (toggle between views)
- Aggregation groups by `queryId` to link all reactions to the same bot response
- Net sentiment calculated as: positive count − negative count
