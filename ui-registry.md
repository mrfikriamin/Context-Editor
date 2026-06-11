# UI Registry

## DataModelSection

File: `components/sections/data-section.tsx`
Last updated: 2026-06-11

| Property | Class |
| --- | --- |
| Background | `bg-card`, `bg-background/80` |
| Border | `border border-border` |
| Border radius | `rounded-xl`, `rounded-lg` |
| Text - primary | `text-foreground` |
| Text - secondary | `text-muted-foreground` |
| Spacing | `gap-7`, `gap-4`, `px-4 py-4` |
| Hover state | `hover:border-primary/20 hover:text-foreground` |
| Shadow | none |
| Accent usage | `border-primary/40 bg-primary/5 text-primary-foreground` |

**Pattern notes:**
Data-model cards follow the same soft card pattern as stack and library editors: rounded-xl containers, subtle borders, card/background token colors, compact row controls, and primary-tinted selected states for boolean toggles.

## ApiEndpointEditor

File: `components/type-details-panel.tsx`
Last updated: 2026-06-11

| Property | Class |
| --- | --- |
| Background | `bg-card`, `bg-background/80` |
| Border | `border border-border`, `border-border/60` |
| Border radius | `rounded-xl`, `rounded-lg` |
| Text - primary | `text-sm` inherited foreground |
| Text - secondary | `text-xs text-muted-foreground` |
| Spacing | `gap-5`, `gap-3`, `px-4 py-3` |
| Hover state | `hover:text-destructive` for remove actions |
| Shadow | none |
| Accent usage | primary only through shared button/select focus states |

**Pattern notes:**
Endpoint rows use dense nested controls without nested visual cards beyond a single rounded row container. Keep method/path as the first row and secondary contract fields at text-xs size.

## ConfigVariables

File: `components/sections/stack-section.tsx`
Last updated: 2026-06-11

| Property | Class |
| --- | --- |
| Background | `bg-card`, `bg-background/80` |
| Border | `border border-border`, `border-border/60` |
| Border radius | `rounded-xl`, `rounded-lg` |
| Text - primary | `text-xs font-medium` for compact toggles |
| Text - secondary | `text-muted-foreground` |
| Spacing | `gap-3`, `px-4 py-3` |
| Hover state | `hover:border-primary/20 hover:text-foreground` |
| Shadow | none |
| Accent usage | shared focus ring `focus-visible:ring-3 focus-visible:ring-ring/50` |

**Pattern notes:**
Configuration rows should remain compact and scannable inside the Stack step. Visibility and required state are controls, while source/default/used-by/notes stay in smaller secondary inputs.
