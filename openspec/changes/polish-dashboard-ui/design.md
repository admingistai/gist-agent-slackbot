# Design: Polish Dashboard UI

## Architecture Overview

This change enhances the visual layer without modifying data flow or functionality. The core pattern is adding a theme context provider and systematically upgrading component styling.

```
┌─────────────────────────────────────────────────────────┐
│                      main.tsx                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │              ThemeProvider                       │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │           ConvexProvider                 │   │   │
│  │  │  ┌─────────────────────────────────┐   │   │   │
│  │  │  │              App                 │   │   │   │
│  │  │  │  ┌─────────┐  ┌─────────────┐  │   │   │   │
│  │  │  │  │ Header  │  │    Tabs     │  │   │   │   │
│  │  │  │  │(+toggle)│  │ (polished)  │  │   │   │   │
│  │  │  │  └─────────┘  └─────────────┘  │   │   │   │
│  │  │  └─────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Theme System Design

### Provider Architecture

Using `next-themes` which works with any React app (not just Next.js):

```tsx
// src/components/theme-provider.tsx
"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Theme Toggle Pattern

Following shadcn convention with dropdown for Light/Dark/System:

```tsx
// src/components/mode-toggle.tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  // Dropdown with Light, Dark, System options
}
```

### CSS Variable Strategy

Current `index.css` already has `:root` and `.dark` variables defined. Enhancements:

1. Add chart color variables for data visualization consistency
2. Add sidebar-specific variables for future sidebar support
3. Ensure all hardcoded colors are converted to CSS variables

```css
:root {
  /* Existing variables... */

  /* Chart colors */
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
}
```

## Component Enhancement Patterns

### Card Polish Pattern

Transform flat cards to professional elevation:

```tsx
// Before
<Card>

// After
<Card className="transition-all hover:shadow-md">
```

### Loading State Pattern

Replace "..." placeholders with skeletons:

```tsx
// Before
{data ?? "..."}

// After
{data ?? <Skeleton className="h-6 w-16" />}
```

### Table Upgrade Pattern

Replace raw HTML tables with shadcn Table:

```tsx
// Before
<table className="w-full">
  <thead>
    <tr className="border-b bg-muted/50">

// After
<Table>
  <TableHeader>
    <TableRow>
```

## File-by-File Changes

### New Files

| File | Purpose |
|------|---------|
| `src/components/theme-provider.tsx` | ThemeProvider wrapper |
| `src/components/mode-toggle.tsx` | Theme toggle dropdown |
| `src/components/ui/skeleton.tsx` | Loading placeholders |
| `src/components/ui/table.tsx` | shadcn Table component |
| `src/components/ui/dropdown-menu.tsx` | For theme toggle |

### Modified Files

| File | Changes |
|------|---------|
| `src/main.tsx` | Wrap app with ThemeProvider |
| `src/index.css` | Add chart vars, enhance transitions |
| `src/App.tsx` | Add ModeToggle to header, enhance layout |
| `src/components/tabs/OverviewTab.tsx` | Add skeletons, card hover states |
| `src/components/tabs/FeedbackTab.tsx` | Convert to shadcn Table |
| `src/components/tabs/IngestedTab.tsx` | Convert to shadcn Table |
| `src/components/tabs/UsageTab.tsx` | Add skeletons, polish |
| `src/components/tabs/TestBotTab.tsx` | Add loading states |
| `src/components/ui/badge.tsx` | Add success variant |

## Design Tokens

### Spacing Scale (8px grid)

- `space-1`: 4px (0.25rem) - tight
- `space-2`: 8px (0.5rem) - compact
- `space-3`: 12px (0.75rem) - snug
- `space-4`: 16px (1rem) - normal
- `space-6`: 24px (1.5rem) - relaxed
- `space-8`: 32px (2rem) - spacious

### Typography Scale

| Element | Class | Size |
|---------|-------|------|
| Page title | `text-2xl font-bold` | 24px |
| Section title | `text-xl font-semibold` | 20px |
| Card title | `text-base font-medium` | 16px |
| Body | `text-sm` | 14px |
| Caption | `text-xs text-muted-foreground` | 12px |

### Transition Timing

- Hover effects: `transition-all duration-200`
- Theme switch: `disableTransitionOnChange` to prevent flash
- Skeleton pulse: Built-in animation

## Trade-offs

### Why next-themes over custom implementation?

**Pros:**
- Battle-tested, handles SSR hydration edge cases
- System preference detection built-in
- Works with Vite despite the "next" name
- shadcn official recommendation

**Cons:**
- Another dependency (though small: ~2KB)

**Decision:** Use next-themes for reliability and shadcn alignment.

### Why not add a sidebar?

**Pros of current tabs:**
- Simpler layout for 5 views
- Familiar pattern for admin dashboards
- Less code to maintain

**Cons:**
- Less scalable if more views added

**Decision:** Keep tabs for now, design allows easy sidebar addition later.

## Accessibility Considerations

1. Theme toggle includes screen reader labels
2. Color contrast maintained in both themes (4.5:1 minimum)
3. Focus states visible in both themes
4. Skeleton animations respect `prefers-reduced-motion`
