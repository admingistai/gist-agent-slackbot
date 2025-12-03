# Tasks: Polish Dashboard UI

## Phase 1: Theme Foundation

- [ ] Install dependencies (`next-themes`, `@radix-ui/react-dropdown-menu`, `sonner`)
- [ ] Create `src/components/theme-provider.tsx` with ThemeProvider wrapper
- [ ] Update `src/main.tsx` to wrap app with ThemeProvider
- [ ] Enhance `src/index.css` with chart color variables and transition utilities
- [ ] Create `src/components/mode-toggle.tsx` with Light/Dark/System dropdown
- [ ] Add `src/components/ui/dropdown-menu.tsx` (shadcn component)
- [ ] Update `src/App.tsx` header to include ModeToggle
- [ ] Verify theme switching works without flash

## Phase 2: Core UI Components

- [ ] Add `src/components/ui/skeleton.tsx` (shadcn component)
- [ ] Add `src/components/ui/table.tsx` (shadcn component)
- [ ] Update `src/components/ui/badge.tsx` to include success variant
- [ ] Add `src/components/ui/toaster.tsx` and integrate sonner
- [ ] Update card.tsx with enhanced shadow and hover transition classes

## Phase 3: Overview Tab Polish

- [ ] Replace "..." loading text with Skeleton components
- [ ] Add hover elevation effect to stat cards
- [ ] Improve Knowledge Base category badges layout
- [ ] Add subtle fade-in animation for data arrival
- [ ] Ensure all hardcoded colors use CSS variables

## Phase 4: Table-based Tabs Polish

- [ ] Convert FeedbackTab raw table to shadcn Table component
- [ ] Convert IngestedTab table to shadcn Table component
- [ ] Add proper hover states to table rows
- [ ] Implement skeleton rows for loading states
- [ ] Improve empty state messaging with icon

## Phase 5: Remaining Tabs Polish

- [ ] Polish UsageTab with consistent card styling
- [ ] Enhance TestBotTab with loading indicators for bot responses
- [ ] Add toast notifications for test message success/failure
- [ ] Ensure consistent spacing across all tabs (8px grid)

## Phase 6: Final Polish & Validation

- [ ] Test dark mode in all tabs thoroughly
- [ ] Verify responsive behavior at common breakpoints
- [ ] Check color contrast meets WCAG AA (4.5:1)
- [ ] Remove any remaining hardcoded color values
- [ ] Run `bun run build` to verify production build succeeds
- [ ] Visual comparison with shadcn dashboard example for quality check

## Dependencies

```
Phase 1 → Phase 2 → Phase 3 ─┐
                             ├→ Phase 6
Phase 4 ─────────────────────┤
Phase 5 ─────────────────────┘
```

Phases 3, 4, 5 can be parallelized after Phase 2 completes.

## Validation Criteria

Each task is complete when:
1. The change is visible in both light and dark modes
2. No TypeScript errors (`bun run build` passes)
3. The enhancement follows shadcn/ui patterns
