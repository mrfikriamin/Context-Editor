# Code Standards

Conventions every contributor and agent must follow.

## Agent Role
Senior desktop application engineer (Tauri v2 + Rust)

## Language & Framework
- Framework: Tauri v2
- Language: Rust (core) + TypeScript (frontend)
- UI Toolkit: Any static web frontend — React/Vite, Next.js with output: 'export', Svelte
- Validation: _None selected_
- Testing: _None selected_

## Principles
- Keep the frontend a static bundle (no SSR). Grant the minimum capability/permission set in the Tauri config — never a blanket allowlist. Implement typed Tauri commands in Rust and validate every command input at the Rust boundary. Keep heavy work in Rust; keep the WebView UI thin. Handle errors with Result types, never unwrap in command handlers.

## Agent Token Discipline
- Do not load every context file blindly — follow the Context Usage Strategy in `project-overview.md`.
- Summarize the relevant section of a file before editing it; never paste whole files into working context.
- Reference only the context relevant to the current phase or task.
- If a required decision is missing from these files, ask before implementing — do not assume.

## Typing Rules
- Strict TypeScript in the frontend; typed command payloads with serde structs in Rust. Share command contracts via generated types where possible.
- Prefer pure, testable functions for business logic; isolate UI and OS integration at the edges.

## Component Rules
- Keep components small, single-purpose, and composable.
- Separate presentational components from data/state logic.
- Reuse design-system primitives (see `ui-registry.md`) before creating new components.
- Co-locate component-specific styles and tests with the component.

## State Management Rules
- Prefer local component state; lift state only when shared.
- Derive values instead of duplicating state.
- Persist long-lived state deliberately in the OS app-data location, and validate persisted data on load.

## Form & Validation Rules
- Validate all external and imported data at the boundary.
- Fail with clear, actionable error messages; never silently coerce bad input.

## Configuration Rules
- Read configuration only from variables and sources listed in `architecture.md` -> `Configuration`.
- Do not add environment variables, config keys, CLI flags, tfvars, scheduler settings, or secrets without updating `architecture.md`.
- Never log or expose values marked secret.

## Error Handling Rules
- Handle expected failures explicitly; never swallow errors without logging.
- Surface user-facing errors in plain language; keep technical detail in logs.
- Use appropriate exit codes / status codes for failures.

## File Naming Rules
- Rust snake_case for commands/modules, camelCase TypeScript, PascalCase components, kebab-case files.
- Keep one logical unit (component, class, module) per file.

## Testing Rules
- Every feature ships with tests covering the happy path and at least one failure path.
- _Choose a test framework in the Stack step._
- Pure logic gets unit tests; user-critical flows get end-to-end coverage.

## Verification Commands
```bash
npm run lint
npm run typecheck
cargo clippy --all-targets
cargo test
cargo tauri build
```

## Definition of Done
The app builds and runs on all target OSes and delivers the MVP. Capabilities are minimal and documented. Rust passes clippy and tests; the frontend passes linting and type checking. Bundles are produced for each target.

## Build Discipline
- Update `progress-tracker.md` after every implementation change.
- Record significant decisions in the Decision Log of `progress-tracker.md`.
