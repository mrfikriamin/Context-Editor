# Better Improvement Plan For `improve_plan.md`

## Summary

Revise the generated-markdown improvement work into a safer, sharper implementation blueprint. The goal is to improve context-pack quality without breaking the existing application, persisted drafts, or local-only export flow.

The core product change remains: exported packs move from 9 files to 10 files by adding `data-model.md`. This is a backward-compatible change set with migrations, not a purely additive change, because several data shapes and UI assumptions change.

The improved generator should produce markdown files that give an implementation agent enough context to build reliable web apps, API services, scripts, Terraform projects, CLI tools, and automations without inventing missing contracts.

## Compatibility Guarantees

- Existing localStorage drafts must hydrate without data loss.
- All new state keys must have defaults in `DEFAULT_STATE`.
- Any changed data shape must include a migration in `normalizeState`.
- `generateFiles()` must remain a pure function and keep the same call signature.
- User-provided text must continue to pass through `cell()`, `mdList()`, or `val()` before appearing in generated markdown.
- The application remains frontend-only: no backend, database, AI call, server migration, or external generation step is introduced.

## Breaking-Shape Changes To Handle Safely

- Generated pack count changes from 9 files to 10 files.
- A new Data Model wizard step is inserted after Features and before Stack.
- `ApiServiceTypeDetails.endpoints` changes from a free-text string to structured endpoint rows.
- Full-app/API configuration capture moves into Stack-level structured config rows.
- Existing generated sections should preserve intent except where explicitly updated for data contracts, configuration, open decisions, project-type wording, and file-count changes.

## Improved Data Contracts

Add these types in `lib/types.ts`:

```ts
export interface DataField {
  name: string
  type: string
  required: boolean
  notes: string
}

export interface DataEntity {
  name: string
  description: string
  fields: DataField[]
}

export interface DataModelData {
  entities: DataEntity[]
  relationships: string
  notes: string
}

export interface ConfigVariable {
  name: string
  required: boolean
  source: string
  defaultValue: string
  visibility: "public" | "secret" | "internal"
  usedBy: string
  notes: string
}

export interface ApiEndpoint {
  method: string
  path: string
  request: string
  response: string
  auth: string
}
```

State changes:

- `ContextState` gains `dataModel: DataModelData`.
- `StackData` gains `configVariables: ConfigVariable[]` and `configNotes: string`.
- `ApiServiceTypeDetails.endpoints` becomes `ApiEndpoint[]`.
- `DEFAULT_STATE.dataModel = { entities: [], relationships: "", notes: "" }`.
- `DEFAULT_STATE.stack.configVariables = []` and `DEFAULT_STATE.stack.configNotes = ""`.
- `SectionId` and `SECTIONS` gain `{ id: "data", label: "Data Model" }` after `features`.

## Migration Plan

Update `normalizeState` in `lib/use-persisted-state.ts`:

- Ensure `dataModel.entities` is always an array.
- Ensure each `DataEntity.fields` value is an array.
- Ensure `stack.configVariables` is always an array.
- Convert legacy `ApiServiceTypeDetails.endpoints: string` into `ApiEndpoint[]`.
- Parse legacy endpoint lines best-effort:
  - `GET /users` becomes `{ method: "GET", path: "/users", request: "", response: "", auth: "" }`.
  - Unparseable lines preserve the original text in `path`.
  - No user text is dropped.

## Generator Changes

### 1. Add `dataModelProfile(projectType)`

Create a project-type-aware helper in `lib/generate.ts`:

- Full Application: `Entities`
- API Service: `Resources & Payloads`
- Python/Bash/PowerShell Script: `Data Shapes (Input / Output)`
- Automation / Cron: `Data Shapes & State`
- Terraform / IaC: `Module Inputs & Outputs`
- CLI Tool: `Config & Output Schemas`

The helper should return:

- `fileIntro`
- `entityNoun`
- `entityHeading`
- `fieldsLabel`
- `emptyDirective`
- `showErDiagram`

This prevents web-app language, entity wording, or ER diagram wording from leaking into scripts, Terraform, CLI tools, and automations.

### 2. Generate `data-model.md`

Insert `data-model.md` after `architecture.md` in `generateFiles()`.

The file must include:

- A project-type-specific heading.
- Per-item tables using `| Field/Variable | Type | Required | Notes |`.
- A type-aware empty-state directive when no model is defined.
- Relationships from `dataModel.relationships`, omitted for Terraform.
- ER diagram only for full-app/API projects when both model rows and relationships exist.
- Data rules:
  - Validate all external input at the boundary.
  - Do not invent schemas during implementation.
  - Any schema change must update `data-model.md`.
  - Schema decisions must be recorded in `progress-tracker.md`.

### 3. Add Explicit Open-Decision Logic

Create generator helpers that detect:

- Relevant stack categories with `_None selected - open decision_`.
- Empty data model.
- Empty configuration for project types that need configuration.
- API services with no endpoint contracts.
- Empty success criteria.
- Empty MVP scope.

Surface open decisions in:

- `project-overview.md` under `## Open Decisions Before Coding`.
- `build-plan.md` under Phase 0 checklist.
- `progress-tracker.md` under Context Quality Checks or a dedicated Open Decisions table.

Open decisions must be actionable work items, not hidden placeholders.

### 4. Add Single Configuration Section

Add exactly one `## Configuration` section per generated pack, inside `architecture.md`.

Use a structured table:

| Name | Required | Source | Default | Visibility | Used By | Notes |
| --- | --- | --- | --- | --- | --- | --- |

Rules:

- Full Application and API Service use `stack.configVariables`.
- Scripts use type details such as env vars, config file, secrets handling, logging, retry behavior, and packaging.
- Terraform uses backend/state, environments, secrets handling, policy checks, and module variables.
- CLI tools use config file, arguments/flags, output format, package manager, and platform compatibility.
- Automation jobs use schedule, trigger, secrets, alerting, retry, logging, and manual re-run behavior.

`code-standards.md` must add: configuration may only be read from variables and sources listed in `architecture.md -> Configuration`.

### 5. Improve API Contracts

Update API service generation:

- `apiDetailsSection` emits `## API Contracts`.
- Table columns: Method, Path, Request, Response, Auth.
- Request flow references the API contract table.
- Build-plan testing checklist adds one endpoint-specific test row per endpoint.
- API services with no endpoints add an open decision before feature work.

### 6. Improve Project-Type Output

API services:

- Endpoint contracts, auth, rate limiting, structured errors, health checks, deployment checks.

Scripts:

- Input/output shape, arguments, config, logging, exit codes, retry behavior, dry-run guidance, safe temp files, least privilege.

Terraform:

- Module inputs/outputs, state backend, plan readability, policy checks, drift detection, no secrets in outputs, rollback/recovery notes.

CLI tools:

- Commands, flags, config precedence, output format, exit codes, platform compatibility, version/help behavior.

Automation jobs:

- Trigger, schedule, idempotency, locking/concurrency, retry/backoff, alerting, logs, manual re-run and recovery steps.

### 7. Improve Risks And Mitigations

Keep `FeaturesData.knownRisks` text-based for now.

Parse each line as:

```text
risk - mitigation
```

Also support pasted en dash or em dash variants:

```text
risk - mitigation
risk -- mitigation
risk — mitigation
```

Generation rules:

- Left side becomes the Risk.
- Right side becomes the Mitigation.
- Missing right side falls back to `_To be confirmed during implementation._`.
- `project-overview.md`, `build-plan.md`, and `progress-tracker.md` must render consistent risk wording.

### 8. Improve `ui-registry.md`

Update generated UI registry rows so the file reflects the actual app vocabulary and expected implementation components:

- `AppShell`
- `SidebarNav`
- `StepIndicator`
- `WizardFooter`
- `FormField`
- `TextAreaField`
- `ColorInput`
- `ChipSelector`
- `MermaidEditor`
- `MermaidPreview`
- `DataModelSection`
- `DataEntityCard`
- `DataFieldRow`
- `FileExportList`
- `MarkdownPreview`
- `DownloadButton`

For non-UI project types, keep `ui-registry.md` as a short not-applicable file.

## UI Changes

- Add `components/sections/data-section.tsx`.
- Use repeatable entity cards with name, description, and field rows.
- Field rows include name, type, required toggle, notes, add, and remove controls.
- Use the existing keyboard-accessible checkbox pattern for the required toggle.
- Add relationships and notes textareas.
- Labels, placeholders, and empty-state language come from `dataModelProfile(projectType)`.
- The Data Model step is optional and must not block navigation.
- `completed.data` is true when any entity/resource/shape has a name.
- Update `type-details-panel.tsx` with structured API endpoint row editing.
- Update `stack-section.tsx` with config variable editing for full-app/API projects only.
- Update `features-section.tsx` hint: `Optionally write: risk - mitigation`.
- Update sidebar, export, context-tool, metadata, manifest, and not-applicable copy to derive file count from `generateFiles(state).length` where practical.

## Generated File Responsibilities After The Change

1. `project-overview.md`
   - Intent, users, success criteria, constraints, MVP scope, out of scope, risks summary, reading order, and open decisions.

2. `architecture.md`
   - Architecture overview, data-model pointer, stack, diagrams, flow, folder structure, configuration, security, operations, deployment, rollback or re-run notes.

3. `data-model.md`
   - Data contracts, payloads, input/output shapes, config/output schemas, Terraform variables/outputs, relationships, and schema rules.

4. `code-standards.md`
   - Agent role, project-type coding rules, validation, config-source rule, error handling, testing, verification commands, definition of done.

5. `ui-tokens.md`
   - UI token source of truth for UI apps; short not-applicable marker for non-UI project types.

6. `ui-rules.md`
   - UI behavior for UI apps; operator-facing output/log/error rules for non-UI projects; Terraform-specific plan/output rules for Terraform.

7. `ui-registry.md`
   - Actual component inventory for UI apps; not-applicable marker for non-UI projects.

8. `library-docs.md`
   - Approved/rejected dependencies, install notes, usage boundaries, and docs-read-before-use guidance.

9. `build-plan.md`
   - Phase 0 decisions and setup, MVP feature phases, endpoint/config/data-model gates, acceptance criteria, test checklist, risks and mitigations.

10. `progress-tracker.md`
    - Project status, context quality checks, open decisions, feature progress, build phases, known issues, risks, decision log, change log.

## Verification Plan

Add or extend generator smoke tests to cover 8 project types x 3 context-tool modes:

- Off
- All enabled
- Compact instructions

Assertions:

- Every project type generates exactly 10 files.
- Every generated file starts with `#`.
- No generated file contains triple blank lines.
- No required markdown table is blank.
- No stale `9 files` copy remains in generated markdown or UI copy.
- `data-model.md` heading matches the project-type profile.
- Script, CLI, automation, and Terraform packs do not contain ER-diagram instructions.
- Terraform packs do not contain CLI `--help` guidance.
- API packs include Method, Path, Request, Response, and Auth contract columns.
- Endpoint-specific test checklist rows appear for API endpoints.
- Risk lines with `risk - mitigation` populate mitigation columns.
- Exactly one `## Configuration` section appears per pack.
- Compact mode removes framing prose but keeps required instructions.
- Legacy drafts with no `dataModel`, old string endpoints, and missing config arrays hydrate and export without data loss.
- Build-plan phase numbering matches progress-tracker phase numbering.
- Pipe escaping works for all new table cells, including paths and config values containing `|`.

Final gate:

```bash
npx tsc --noEmit
npm run build
```

Run any existing smoke/test command if present in the repository before the final build.

## Implementation Order

1. Update types and defaults.
2. Add migrations.
3. Add generator helpers for profiles, risk parsing, open decisions, config tables, and data-model rendering.
4. Insert `data-model.md` into `generateFiles()` and manifest reading order.
5. Update existing generated files for configuration, open decisions, API contracts, project-type wording, and UI registry.
6. Add Data Model UI and API endpoint row UI.
7. Sweep file-count copy from 9 to derived/10-file wording.
8. Add smoke tests and legacy hydration checks.
9. Run typecheck, smoke matrix, and production build.

## Assumptions

- The highest-impact improvement is adding `data-model.md` as the contract source of truth.
- Backward compatibility means existing user drafts still load and export correctly; generated markdown may change where the plan explicitly improves contracts, configuration, open decisions, project-type wording, and file count.
- The app remains deterministic and local-only.
- The implementation should prioritize generated markdown quality while preserving the current user flow, export behavior, and no-AI guarantee.
