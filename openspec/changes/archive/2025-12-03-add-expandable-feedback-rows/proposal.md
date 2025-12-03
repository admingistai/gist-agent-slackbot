# Change: Add Expandable Rows to Feedback Table

## Why

The Feedback tab now displays question and response data, but the text is truncated to 80 characters. Users cannot see the full question/response without relying on browser title tooltips, which have poor UX (slow to appear, disappear on mouse movement).

## What Changes

- **Frontend**: Add click-to-expand functionality to feedback table rows
- **UI Component**: Use shadcn Collapsible component to show/hide full text
- **Visual Indicator**: Add chevron icon to indicate rows are expandable

## Impact

- Affected specs: `feedback`
- Affected code:
  - `dashboard/src/components/tabs/FeedbackTab.tsx` — Add expandable row logic
  - `dashboard/src/components/ui/collapsible.tsx` — Add shadcn Collapsible component (if not installed)

## Notes

- Uses shadcn's native Collapsible component for accessibility and consistency
- Pattern based on: https://dev.to/mfts/build-an-expandable-data-table-with-2-shadcnui-components-4nge
- Expanded content will span full table width using `colSpan={6}`
