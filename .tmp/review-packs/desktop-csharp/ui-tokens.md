# UI Tokens

Design tokens only — usage rules live in `ui-rules.md`.

> Native-UI note: these tokens express design intent, not CSS. Map them to C# / .NET (Visual Studio)'s styling system (XAML resources and styles) and keep the mapping consistent.

## Brand Adjectives
calm, precise, useful, restrained, trustworthy

## Color Mode
Light

## Colors

| Token | Value |
| --- | --- |
| primary | `#2563eb` |
| background | `#ffffff` |
| surface | `#f5f5f7` |
| text | `#111111` |
| success | `#22c55e` |
| error | `#ef4444` |

## Typography

| Role | Font |
| --- | --- |
| Display | SF Pro Display |
| Body | SF Pro Text |
| Mono | SF Mono |

## Radius

| Token | Value | Usage |
| --- | --- | --- |
| radius-sm | 8px | Inputs, chips, small controls |
| radius-md | 12px | Buttons, list items |
| radius-lg | 16px | Cards, panels, modals |

## Spacing

| Token | Value |
| --- | --- |
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-6 | 24px |
| space-8 | 32px |
| space-12 | 48px |

## Borders

| Token | Value |
| --- | --- |
| border-default | 1px solid, low-contrast neutral derived from text at ~10% opacity |
| border-focus | 1.5px solid primary |

## Shadows

| Token | Value | Usage |
| --- | --- | --- |
| shadow-soft | 0 1px 3px rgba(0,0,0,0.06) | Cards at rest |
| shadow-raised | 0 4px 12px rgba(0,0,0,0.08) | Popovers, dropdowns |

## Motion

| Token | Value |
| --- | --- |
| duration-fast | 150ms |
| duration-base | 250ms |
| easing | ease-out |

## Accessibility Notes
- Body text contrast must be at least 4.5:1 against its background.
- Focus states must be visible (focus ring in primary color); never remove outlines without replacement.
- Never communicate state with color alone — pair with icon or text.
- Honor reduced-motion preferences by disabling non-essential transitions.

## Design Notes
Use a clean, minimal layout influenced by Jony Ive and Dieter Rams. Generous spacing, soft cards, subtle borders, rounded corners, clear information hierarchy.
