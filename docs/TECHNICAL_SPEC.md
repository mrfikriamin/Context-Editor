# Context Editor — Technical Specification

Generated from a full codebase review (2026-06-11). This document is the authoritative map of the architecture, domain model, generation pipeline, invariants, and extension points. Agents extending or modifying this codebase should read this before touching code.

## 1. What This Application Is

Context Editor is a **client-only Next.js wizard** that turns a structured project brief into a deterministic pack of 10 AI-ready context `.md` files (plus a root `AGENTS.md` manifest). There are **no AI calls, no backend, no database** — every byte of output is derived from form state by pure functions. State persists in `localStorage` and can be exported/imported as a versioned JSON draft.

Core value chain:

```text
User fills wizard steps → ContextState (localStorage)
  → generateFiles(state)  [pure, deterministic]
  → 10 markdown files + AGENTS.md
  → preview / edit overrides / download (.md, .zip incl. draft.json)
```

## 2. Stack & Runtime Constraints

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript 5.7 | Single static route `/`; every component is `"use client"` |
| Styling | Tailwind CSS 4, shadcn-style primitives in `components/ui/` | `cn()` from `lib/utils.ts` everywhere |
| Diagrams | mermaid (client render), starter diagrams generated as text | |
| Packaging | jszip (dynamic import, export step only) | |
| Network | `@vercel/analytics` only, production only | App works fully offline |
| Build | `next build` prerenders everything static | One config flag (`output: 'export'`) from a pure static bundle |

## 3. Module Map

| Module | Responsibility |
| --- | --- |
| `app/page.tsx` | Owns all state. Renders sidebar + active section. `patch(key)` produces slice updaters; `patchIdea` adds preset-follow logic (see §6). Draft save/import handlers. |
| `app/layout.tsx` | Shell, fonts, analytics. |
| `components/sidebar.tsx` | Wizard navigation, completion ticks, Save/Import draft buttons (hidden file input). |
| `components/sections/*.tsx` | One component per wizard step (idea, mermaid, features, data, stack, look, context-tools, agent, export). Receive a state slice + `onChange(patch)`. |
| `components/type-details-panel.tsx` | Per-project-type detail forms (`XxxFields` components), `EMPTY_*` defaults, and `defaultTypeDetails(kind)` factory. |
| `components/project-type-selector.tsx` | Renders `PROJECT_TYPES` as a button grid. |
| `components/ui/*` | Design-system primitives (button, input, select, …). |
| `lib/types.ts` | **Domain model.** `ContextState`, `ProjectType`, `TypeDetails` union, `DEFAULT_STATE`, `SECTIONS`, `isUIProject()`, `getAgentPreset(type, framework?)`. |
| `lib/generate.ts` | **Generation pipeline.** All markdown renderers, `generateFiles`, `packManifest`, `starterDiagram`, `dataModelProfile`. ~2,200 lines. |
| `lib/desktop-frameworks.ts` | `DESKTOP_FRAMEWORKS` profile table (Electron, Tauri v2, Qt, C#/.NET) driving all desktop-specific generator output and form placeholders. |
| `lib/stack-options.ts` | `STACK_CATEGORIES` + `TECH_OPTIONS` catalog; `getCategoryForTech()`. |
| `lib/context-tools.ts` | Catalog of optional local tools (doc ingestion, graph, lint) embedded into generated guidance. Never executed by the app. |
| `lib/use-persisted-state.ts` | `usePersistedState(key, fallback)`: hydrate-validate-migrate from localStorage, write-back on change. Exports `isValidState`, `normalizeState`. |
| `lib/draft-io.ts` | Versioned draft envelope: `buildDraft`, `downloadDraft`, `parseDraft` (validates via `isValidState` + `normalizeState`). |
| `scripts/` | Verification harnesses (§8) — `lint.mjs`, `smoke-generate.mjs`, `validate-pack.ts`, `smoke-draft-io.ts`, `dump-packs.ts`. |

Dependency direction is strictly `app → components → lib → (nothing)`. No import cycles (verified by graph analysis).

## 4. Domain Model

### 4.1 ContextState (the single source of truth)

| Slice | Holds | Edited in step |
| --- | --- | --- |
| `idea` | name, pitch, problem, users, success criteria, constraints, `projectType`, `typeDetails` | Idea |
| `mermaid` | diagram source | Mermaid Editor |
| `features` | `mvpFeatures[{name, description}]`, out of scope, risks | Features |
| `dataModel` | `entities[{name, description, fields[]}]`, relationships, notes | Data Model |
| `stack` | `selected[SelectedTech]`, otherLibraries, rejectedLibraries, configVariables, configNotes | Stack |
| `look` | brand adjectives, color tokens, fonts, color mode, design notes | Look (UI projects only) |
| `contextTools` | toggles + tool ids for optional local tooling | Context Tools |
| `agent` | role, principles, verificationCommands, definitionOfDone | Agent |

### 4.2 Project types

`ProjectType` = `full-application | desktop-application | python-script | bash-script | powershell-script | terraform | cli-tool | automation-cron | api-service`.

`TypeDetails` is a discriminated union on `kind`; every non-`full-application` kind carries a `details` interface (`ScriptTypeDetails`, `DesktopTypeDetails`, `TerraformTypeDetails`, `ApiServiceTypeDetails`, `CliTypeDetails`, `AutomationTypeDetails`). `isUIProject()` returns true for `full-application` and `desktop-application` — it gates the Look step and the three `ui-*.md` files.

### 4.3 Desktop framework profiles

`desktop-application` carries `framework: "electron" | "tauri" | "qt" | "csharp"`. **All framework knowledge lives in one table** — `DESKTOP_FRAMEWORKS` in `lib/desktop-frameworks.ts`: label, language, UI toolkit, build tool, packaging, updater, distribution, data storage, `usesWebTech` flag, core boundary, graph tool, typing/naming rules, folder structure, security bullets, conventions. Generator branches and form placeholders read this table; nothing framework-specific is duplicated elsewhere except `DESKTOP_AGENT_PRESETS` in `types.ts`.

## 5. Generation Pipeline (`lib/generate.ts`)

### 5.1 Output contract

`generateFiles(state)` returns exactly **10 files, fixed names and order**:

`project-overview.md` (Capture) · `architecture.md`, `data-model.md` (Architecture) · `code-standards.md` (Standards) · `ui-tokens.md`, `ui-rules.md`, `ui-registry.md` (Design) · `library-docs.md` (Library) · `build-plan.md` (Plan) · `progress-tracker.md` (Journal).

`packManifest(state)` renders the root `AGENTS.md` reading guide. `starterDiagram(state)` produces a per-type mermaid flowchart offered (never auto-applied) in the Mermaid step.

### 5.2 The per-renderer pattern and its branch points

Each file has one renderer function. Project-type behavior is implemented as **switches on `projectType` / `typeDetails.kind`** at these points — this list is the canonical checklist when adding a type:

1. `projectTypeLabel` / `typeNounPhrase` — display strings
2. `RELEVANT_CATEGORIES` — which stack categories the type shows as open decisions
3. `graphToolForType` — dependency-graph tooling suggestion
4. `langProfile` — typing rules, naming rules, minimum static checks
5. `dataModelProfile` (exported; also used by the Data step UI) — entity nouns, headings, ER-diagram visibility
6. `configurationRows` — the Configuration table rows
7. `securitySection` — type-specific security bullets
8. `operationsSection` — deployment/packaging/operations guidance
9. `typeDetailsSection` → one `xxxDetailsSection(details)` renderer per kind
10. `dataFlowForType` — the numbered execution/data-flow narrative
11. `folderStructureForType` — folder tree (flat `path/ # comment` style, no box-drawing)
12. `starterDiagram` — per-type mermaid starter
13. UI gating: `uiTokens`/`uiRules`/`uiRegistry` honor `isUIProject`; native-UI desktop (Qt, C#) additionally gets a registry "not applicable" variant and a token-mapping note; reading order/skip list in `projectOverview` must match.

Plus `getAgentPreset` in `lib/types.ts` (role/principles/verification/DoD per type, per desktop framework).

### 5.3 Markdown safety helpers

All user text flows through helpers — never interpolate raw input:

- `cell(v, fallback)` — escapes `|`, converts newlines to `<br>`; **mandatory for table cells**
- `val(v, fallback)` — trimmed value or fallback (`_TBD_` convention)
- `mdList(items, fallback)` / `listFromText(text)` — newline-list to bullets
- `plainText(t)` — strips parentheticals when embedding profile prose inside parenthesized sentences
- `mermaidBlock(code)` — fenced block or placeholder
- `intro(s, text)` — framing prose, suppressed when `compactInstructions` is on

Fallback style: open decisions render as `_TBD_` / `_None selected - open decision_` — generators must degrade gracefully on empty state (the default first-run state is part of the validation matrix).

## 6. Behavioral Couplings (easy to miss)

- **Preset follow on type/framework change** (`patchIdea` in `app/page.tsx`): if the agent slice still exactly equals the previous type's preset, it follows to the new preset; if the stack is still the untouched default web preset and the user leaves `full-application`, `stack.selected` is cleared (restored on return). Both are skipped the moment the user has customized.
- **Type-details cache** (`idea-section.tsx`): switching project type stashes the previous `typeDetails` in a ref and restores it if the user switches back within the session.
- **Export overrides**: hand-edits in the Export preview are stored per-filename in localStorage key `context-editor-overrides` (owned by `page.tsx`, passed down) and layered over generated content; included in drafts and zips.
- **Disabled steps**: non-UI types disable the Look step (`getDisabledSteps`); the sidebar renumbers visible steps.

## 7. Persistence & Draft Format

- localStorage keys: `context-editor-state` (ContextState), `context-editor-step` (SectionId), `context-editor-overrides` (Record<filename, markdown>).
- Hydration: `usePersistedState` parses, validates (`isValidState`), then **migrates** via `normalizeState` (deep-merge onto `DEFAULT_STATE`, plus explicit migrations: legacy string `mvpFeatures`, missing `rejectedLibraries`/`configVariables`, endpoint text → structured rows).
- Draft file envelope (v1): `{ app: "context-editor", version: 1, exportedAt, state, overrides }`. `parseDraft` rejects non-drafts with readable errors and runs `normalizeState`. The full zip embeds `draft.json` so every exported pack is re-importable.

## 8. Verification Toolchain & Invariants

| Command | What it proves |
| --- | --- |
| `npx tsc --noEmit` | Types, including exhaustiveness via `Record<ProjectType, …>` tables |
| `npm run lint` | Project lint (`scripts/lint.mjs`) |
| `npm run build` | Static production build |
| `npm run validate` | **The contract.** `scripts/validate-pack.ts` runs a matrix (9 types × 4 desktop frameworks × 3 tool modes, adversarial input with pipes/quotes) asserting: fixed file set/order; H1 first line; no triple blank lines; no `undefined`/`NaN`/`[object Object]`; balanced fences; valid mermaid heads; table column integrity; byte-determinism; preview/export parity; manifest references. |
| `npm run test:generated` | `scripts/smoke-generate.mjs` content smoke across the same matrix |
| `npx tsx scripts/smoke-draft-io.ts` | Draft round-trip, migration, rejection of invalid files |
| `npx tsx scripts/dump-packs.ts` | Writes full packs to `.tmp/review-packs/` for human review (mirrors app preset behavior) |

Invariants every change must preserve:

1. Generation is **pure and deterministic** — same state, byte-identical output.
2. The 10-file set, names, and order never drift (export UI and manifest depend on it).
3. User input never breaks markdown structure (use the §5.3 helpers).
4. Empty/default state produces a complete, valid pack.
5. Old localStorage state and old drafts must keep importing (extend `normalizeState`, never break it).
6. No new network calls; everything stays local and offline-capable.

## 9. Extension Points (how to add things)

- **New project type**: extend `ProjectType` + `PROJECT_TYPES` + `TypeDetails` (+ details interface) in `types.ts`; add `EMPTY_*`, `defaultTypeDetails` case, and a `XxxFields` form in `type-details-panel.tsx`; add a case at **every branch point in §5.2** (the `Record<ProjectType, …>` tables make misses a type error; the switches do not — work the checklist); add `getAgentPreset` case; extend `scripts/validate-pack.ts` (`TYPES`, `tdFor`) and `scripts/smoke-generate.mjs`.
- **New desktop framework**: add a `DESKTOP_FRAMEWORKS` profile + `DESKTOP_AGENT_PRESETS` entry + the `DesktopFramework` union member; add it to `DESKTOP_FRAMEWORKS` list in `validate-pack.ts`. No generator changes needed — that is the point of the profile table.
- **New stack option**: append to the right category in `TECH_OPTIONS` (id must be globally unique — `getCategoryForTech` scans all categories).
- **New context tool**: append to the catalog in `context-tools.ts`; it is descriptive only.
- **New generated file**: renderer in `generate.ts`, entry in `generateFiles`, `EXPECTED_NAMES` in `validate-pack.ts`, reading order in `projectOverview` + `packManifest`.
