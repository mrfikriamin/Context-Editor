# UI Rules

How the interface should look and behave.

Token values live in `ui-tokens.md` — reference tokens by name here, never duplicate their values.

## Design Philosophy
- calm
- precise
- useful
- restrained
- trustworthy

Use a clean, minimal layout influenced by Jony Ive and Dieter Rams. Generous spacing, soft cards, subtle borders, rounded corners, clear information hierarchy.

## Layout Rules
- Full-height shell; content column centered with a comfortable max width.
- Generous whitespace between sections; never crowd controls.
- One primary action per screen; keep secondary actions visually quiet.

## Core Rules

| Rule | Requirement |
| --- | --- |
| Spacing | Generous, consistent spacing using the scale in `ui-tokens.md` |
| Corners | Rounded cards and controls (see radius tokens) |
| Borders | Minimal, subtle borders only where needed |
| Shadows | Soft, low-contrast shadows |
| Hierarchy | Clear typographic and visual hierarchy |
| Color usage | Limited palette anchored on the primary color |
| Motion | Subtle, purposeful micro-interactions |
| Accessibility | Sufficient contrast, semantic HTML, keyboard support |

## Form Rules
- Labels are small, uppercase, muted, letter-spaced, and programmatically associated with their inputs.
- Inputs are large, rounded, with subtle borders; helper text is small and muted.
- Validate gently: guide rather than block; show errors inline next to the field.

## Button Rules
- Primary: solid primary color, white text, rounded.
- Secondary: white/transparent background with subtle border.
- Destructive: red accent, used sparingly, with confirmation where data loss is possible.
- Disabled: lowered opacity, no pointer events, still announced to assistive tech.

## Empty State Rules
- Every list or table has a designed empty state with a short explanation and a next action.
- Never render a blank panel.

## Error State Rules
- Errors are inline, plain-language, and recoverable.
- Never show raw stack traces or codes to end users.

## Responsive Behavior
- Layout collapses gracefully to a single column on small screens.
- Touch targets are at least 40px; nothing depends on hover alone.

## Desktop Behavior Rules
- Provide native menus and keyboard shortcuts for primary actions; follow each OS's conventions (Ctrl vs Cmd).
- Remember window size and position between sessions; handle multi-monitor setups sanely.
- Long operations run off the UI thread, show progress, and never freeze the window; support cancel where possible.
- Respect the OS theme (light/dark) and scale correctly with system DPI settings.

## Accessibility Rules
- All interactive elements are reachable and operable by keyboard.
- Icon-only buttons carry accessible names.
- Live status changes (validation, save state) are announced via polite live regions.
