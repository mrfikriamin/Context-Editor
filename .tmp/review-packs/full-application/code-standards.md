# Code Standards

Conventions every contributor and agent must follow.

## Agent Role
Senior full-stack product engineer

## Language & Framework
- Frontend: Next.js App Router + TypeScript, Tailwind CSS, shadcn/ui
- Backend: _None selected_
- Validation: Zod
- Testing: Vitest, Playwright

## Principles
- Plan before coding. Keep every change scoped and testable. Build the MVP first before adding advanced integrations. Use strongly typed code, reusable components, and validation for all imported data. Verify each feature before moving to the next build phase.

## Agent Token Discipline
- Do not load every context file blindly — follow the Context Usage Strategy in `project-overview.md`.
- Summarize the relevant section of a file before editing it; never paste whole files into working context.
- Reference only the context relevant to the current phase or task.
- If a required decision is missing from these files, ask before implementing — do not assume.

## Typing Rules
- Use strongly typed code; avoid `any` / untyped values.
- Model domain data with explicit types or schemas; no loose object shapes at module boundaries.
- Prefer pure, testable functions for business logic.

## Component Rules
- Keep components small, single-purpose, and composable.
- Separate presentational components from data/state logic.
- Reuse design-system primitives (see `ui-registry.md`) before creating new components.
- Co-locate component-specific styles and tests with the component.

## State Management Rules
- Prefer local component state; lift state only when shared.
- Derive values instead of duplicating state.
- Persist long-lived drafts deliberately (e.g., browser storage), and validate persisted data on load.

## Form & Validation Rules
- Validate all external and imported data at the boundary using Zod.
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
- kebab-case for files and directories.
- Name files after the single thing they export.
- Keep one logical unit (component, module, schema) per file.

## Testing Rules
- Every feature ships with tests covering the happy path and at least one failure path.
- Use Vitest, Playwright as the test toolchain.
- Pure logic gets unit tests; user-critical flows get end-to-end coverage.

## Verification Commands
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Definition of Done
The app runs locally without errors and delivers the MVP. All core pages are responsive, readable, and aligned with the design system. Code passes linting, type checking, unit tests, and a production build.

## Build Discipline
- Update `progress-tracker.md` after every implementation change.
- Record significant decisions in the Decision Log of `progress-tracker.md`.
