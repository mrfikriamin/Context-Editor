---
name: extend
description: Add a new project type, desktop framework, stack option, or generated file to the Context Editor generator without breaking its contracts. Works the canonical branch-point checklist, preserves every invariant, and proves the change with the validation matrix before reporting.
---

You are extending a deterministic markdown generator. The Context Editor has one strict shape: a domain model in `lib/types.ts`, per-renderer generation in `lib/generate.ts` that branches on project type at ~13 known points, and a validation matrix that asserts the output contract byte-for-byte. Extensions that follow the shape are routine; extensions that improvise around it rot the pack for every project type at once.

This skill exists so an agent can execute an extension end-to-end, autonomously, and prove it did so correctly.

**Required reading before any edit:** `docs/TECHNICAL_SPEC.md` — especially §5.2 (branch points), §8 (invariants and verification), and §9 (extension points). If the spec and the code disagree, trust the code and flag the drift in your report.

---

## Input Schema

The request must resolve to this structure. If a field is missing and not inferable, ask before editing — never guess domain content.

```yaml
extension:
  kind: project-type | desktop-framework | stack-option | context-tool | generated-file   # required
  id: kebab-case identifier                                                              # required, unique
  label: human-readable name                                                             # required
  description: one line shown in the UI or docs                                          # required

  # kind: project-type only
  detail_fields:        # the per-type form fields and their meaning
    - name: camelCase field name
      input: text | textarea | select
      placeholder: example value
  is_ui_project: true | false        # does the Look step / ui-*.md apply?
  domain_knowledge:                  # what the generated guidance must say
    security: [bullets]
    operations: [bullets]
    folder_structure: flat `path/  # comment` lines
    verification_commands: [commands for the agent preset]

  # kind: desktop-framework only
  profile:              # every field of DesktopFrameworkProfile (see lib/desktop-frameworks.ts)
  agent_preset:         # role, principles, verificationCommands, definitionOfDone

  # kind: stack-option only
  category: frontend | backend | database | orm | auth | validation | testing | deployment | automation

  # kind: generated-file only
  file_name: kebab-case.md
  group: Capture | Architecture | Standards | Design | Library | Plan | Journal
  purpose: what the file tells the implementation agent
```

## Output Schema

The skill is done only when it can emit this report truthfully:

```markdown
## Extension Report — [label] ([kind])

### Files changed
- [path] — [one line what/why]

### Branch-point coverage          # project-type kind only
| # | Branch point | Status |
| --- | --- | --- |
| 1–13 | (each point from TECHNICAL_SPEC §5.2) | added / inherited default / n/a + why |

### Verification
- npx tsc --noEmit: PASS/FAIL
- npm run lint: PASS/FAIL
- npm run validate: PASS/FAIL ([N] checks)
- npm run test:generated: PASS/FAIL
- npm run build: PASS/FAIL

### Output evidence
[2–3 representative excerpts from a dumped pack proving the new guidance renders correctly]

### Open decisions / spec drift
[anything deferred, assumed, or found inconsistent with docs/TECHNICAL_SPEC.md]
```

A FAIL anywhere means the work is not done. Fix it or report why it cannot be fixed — never report green that isn't.

---

## Operational Workflow

### Step 1 — Classify and align

Map the request onto the Input Schema. Confirm the 2–3 terms that could mean different things (e.g. does "framework" mean a new `DesktopFramework` or a new `ProjectType`?). State what you will build in two sentences and which `kind` path you are taking. Smaller kinds are cheaper: prefer `desktop-framework` (profile-table only) over `project-type` (13 branch points) when the request allows it.

### Step 2 — Establish the baseline

Run `npm run validate && npm run test:generated && npx tsc --noEmit`. If the baseline is red, stop and report — you cannot prove your change is safe against a broken baseline.

### Step 3 — Implement in dependency order

Work strictly bottom-up so the type system pulls you forward:

1. **Domain** — `lib/types.ts`: unions, interfaces, `PROJECT_TYPES`, `isUIProject`, `getAgentPreset`. The `Record<ProjectType, …>` tables will now fail typecheck everywhere a case is missing — that is the safety net working.
2. **Knowledge tables** — `lib/desktop-frameworks.ts` profile, `lib/stack-options.ts`, or `lib/context-tools.ts` as applicable. All domain prose lives in tables, not inline in renderers.
3. **Form** — `components/type-details-panel.tsx`: `EMPTY_*` default, `defaultTypeDetails` case, `XxxFields` component. Placeholders come from the knowledge table.
4. **Generator** — `lib/generate.ts`: add a case at every §5.2 branch point. For each, either write a real case or consciously inherit the default — record which, for the report. Use the §5.3 helpers (`cell`, `val`, `mdList`, `plainText`) for every interpolated value; folder trees use flat `path/  # comment` style.
5. **App wiring** — `app/page.tsx` only if preset-follow or step-gating behavior changes.
6. **Harnesses** — extend `scripts/validate-pack.ts` (`TYPES` / `DESKTOP_FRAMEWORKS` / `tdFor` / `EXPECTED_NAMES`) and `scripts/smoke-generate.mjs` so the matrix actually covers the new surface. An extension the matrix doesn't exercise is not protected.

### Step 4 — Verify

Run the full ladder: `npx tsc --noEmit` → `npm run lint` → `npm run validate` → `npm run test:generated` → `npm run build`. Then run `npx tsx scripts/dump-packs.ts` (add a variant for the new surface if needed) and **read the generated markdown** for the new case — empty state and filled state both. Structural validators cannot judge whether the prose is correct for the domain; you must.

### Step 5 — Self-review against the invariants

Walk TECHNICAL_SPEC §8 explicitly: determinism, fixed file set, markdown safety, valid empty state, persistence compatibility (`normalizeState` extended — never broken — if state shape changed), no new network calls.

### Step 6 — Report

Emit the Output Schema report. Update `docs/TECHNICAL_SPEC.md` if the extension changed any fact it states (new branch point, new file, new invariant).

---

## Failure Handling

- **Typecheck fails after Step 3.1** — expected; it is your to-do list. Resolve every error by implementing, not by widening types or adding `any`.
- **`npm run validate` fails** — read the failing assertion; it names the file, context, and rule. Fix the renderer, never the validator, unless the contract itself was intentionally changed (then update validator + spec together and say so in the report).
- **A branch point has no sensible content** — inheriting the default is allowed but must be a recorded decision in the report, not an omission.
- **The request needs domain facts you don't have** (e.g. security guidance for an unfamiliar framework) — research first or ask; never invent authoritative-sounding guidance into generated packs.

## What This Skill Is Not

It is not a refactoring license — you extend the pattern, you do not redesign it mid-extension. If the pattern itself needs changing (e.g. splitting `generate.ts`), report that as a follow-up, finish the extension within the current shape, and leave the codebase green.

It is not a content brainstorm. The generated guidance you write becomes instructions for other agents building real projects — every bullet must be defensible, current, and sourced from the knowledge tables or the request, not improvised.
