# dashboard Specification Delta

## MODIFIED Requirements

### Requirement: Dashboard Web Application

The system SHALL provide a web-based dashboard for monitoring and testing the Gist-Agent Slackbot **with professional visual design and theme support**.

#### Scenario: Theme toggle functionality
- **WHEN** a user clicks the theme toggle button in the header
- **THEN** a dropdown appears with Light, Dark, and System options
- **AND** selecting an option immediately applies the theme without page refresh
- **AND** the preference persists across browser sessions

#### Scenario: Dark mode display
- **WHEN** dark mode is active
- **THEN** all UI elements use dark color palette (dark backgrounds, light text)
- **AND** color contrast meets WCAG AA standards (4.5:1 minimum)
- **AND** charts and badges remain visually distinct

#### Scenario: Loading states
- **WHEN** data is being fetched from Convex
- **THEN** skeleton placeholders appear in place of content
- **AND** skeletons animate to indicate loading
- **AND** content replaces skeletons smoothly when data arrives

#### Scenario: Card interactions
- **WHEN** a user hovers over a stat card
- **THEN** the card displays a subtle shadow elevation effect
- **AND** the transition is smooth (200ms)

### Requirement: Dashboard Tech Stack

The dashboard SHALL be built with React 19, Bun, Vite, **next-themes**, and shadcn/ui components.

#### Scenario: Theme provider initialization
- **WHEN** the application starts
- **THEN** ThemeProvider wraps the application
- **AND** system theme preference is detected automatically
- **AND** no theme flash occurs during hydration

## ADDED Requirements

### Requirement: Professional Visual Design

The dashboard SHALL follow shadcn/ui design patterns with consistent spacing, typography, and visual hierarchy.

#### Scenario: Consistent spacing
- **WHEN** viewing any dashboard tab
- **THEN** spacing follows an 8px grid system
- **AND** padding and margins are consistent across similar components

#### Scenario: Typography hierarchy
- **WHEN** viewing page content
- **THEN** page titles use text-2xl font-bold
- **AND** section titles use text-xl font-semibold
- **AND** card titles use text-base font-medium
- **AND** body text uses text-sm
- **AND** captions use text-xs text-muted-foreground

#### Scenario: Table styling
- **WHEN** viewing tabular data (Feedback, Ingested Content)
- **THEN** tables use shadcn Table component styling
- **AND** table rows have hover states
- **AND** headers are visually distinct from body rows
