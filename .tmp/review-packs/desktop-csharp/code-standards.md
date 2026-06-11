# Code Standards

Conventions every contributor and agent must follow.

## Agent Role
Senior .NET desktop engineer (Visual Studio)

## Language & Framework
- Framework: C# / .NET (Visual Studio)
- Language: C# on .NET 8+
- UI Toolkit: WinUI 3 (new Windows-only apps), WPF (mature ecosystem), MAUI (cross-platform/mobile), WinForms (legacy)
- Validation: _None selected_
- Testing: _None selected_

## Principles
- Follow MVVM: views bind to view models, no business logic in code-behind. Enable nullable reference types and treat warnings as errors. Use async/await for all I/O so the UI thread never blocks. Use dependency injection for services. Keep models and services in a UI-free project so they are unit-testable.

## Agent Token Discipline
- Do not load every context file blindly — follow the Context Usage Strategy in `project-overview.md`.
- Summarize the relevant section of a file before editing it; never paste whole files into working context.
- Reference only the context relevant to the current phase or task.
- If a required decision is missing from these files, ask before implementing — do not assume.

## Typing Rules
- Enable nullable reference types solution-wide and treat warnings as errors. Use records for immutable models.
- Prefer pure, testable functions for business logic; isolate UI and OS integration at the edges.

## Component Rules
- Keep components small, single-purpose, and composable.
- Separate presentational components from data/state logic.
- Reuse the framework's standard controls and existing project components before creating new ones.
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
- PascalCase types/methods/properties, camelCase locals/parameters, _camelCase private fields, one class per file.
- Keep one logical unit (component, class, module) per file.

## Testing Rules
- Every feature ships with tests covering the happy path and at least one failure path.
- _Choose a test framework in the Stack step._
- Pure logic gets unit tests; user-critical flows get end-to-end coverage.

## Verification Commands
```bash
dotnet format --verify-no-changes
dotnet build -warnaserror
dotnet test
```

## Definition of Done
The solution builds clean in Visual Studio and delivers the MVP. View models and services pass unit tests. The UI stays responsive. An installer/package (MSIX or equivalent) is produced.

## Build Discipline
- Update `progress-tracker.md` after every implementation change.
- Record significant decisions in the Decision Log of `progress-tracker.md`.
