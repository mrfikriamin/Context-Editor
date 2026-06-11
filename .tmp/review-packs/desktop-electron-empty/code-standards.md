# Code Standards

Conventions every contributor and agent must follow.

## Agent Role
Senior desktop application engineer (Electron)

## Language & Framework
- Framework: Electron
- Language: TypeScript (main + preload + renderer)
- UI Toolkit: HTML/CSS with React, Vue, or plain DOM in the renderer
- Validation: _None selected_
- Testing: _None selected_

## Principles
- Keep Electron security defaults intact: contextIsolation true, nodeIntegration false, sandbox true. Expose only narrow, validated APIs through contextBridge — one method per IPC message, never raw ipcRenderer. Treat every IPC message from the renderer as untrusted input. Set a restrictive CSP and limit navigation. Keep main-process logic small and testable; put business logic in plain modules.

## Agent Token Discipline
- Do not load every context file blindly — follow the Context Usage Strategy in `project-overview.md`.
- Summarize the relevant section of a file before editing it; never paste whole files into working context.
- Reference only the context relevant to the current phase or task.
- If a required decision is missing from these files, ask before implementing — do not assume.

## Typing Rules
- Strict TypeScript everywhere (main, preload, renderer). Type IPC channels end-to-end with a shared contract module.
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
- camelCase functions/variables, PascalCase components and classes, kebab-case files, IPC channels namespaced like `feature:action`.
- Keep one logical unit (component, class, module) per file.

## Testing Rules
- Every feature ships with tests covering the happy path and at least one failure path.
- _Choose a test framework in the Stack step._
- Pure logic gets unit tests; user-critical flows get end-to-end coverage.

## Verification Commands
```bash
npm run lint
npm run typecheck
npm run test
npm run package
```

## Definition of Done
The app launches on all target OSes and delivers the MVP. Installers build successfully. Security defaults (context isolation, sandbox, CSP) are intact and IPC inputs are validated. Code passes linting, type checking, and tests.

## Build Discipline
- Update `progress-tracker.md` after every implementation change.
- Record significant decisions in the Decision Log of `progress-tracker.md`.
