# Code Standards

Conventions every contributor and agent must follow.

## Agent Role
Senior C++/Qt desktop engineer

## Language & Framework
- Framework: Qt 6
- Language: C++17/20 (or Python with PySide6)
- UI Toolkit: Qt Widgets (dense desktop UIs) or Qt Quick/QML (fluid, animated UIs)
- Validation: _None selected_
- Testing: _None selected_

## Principles
- Use modern C++ (C++17 or later) with RAII and smart pointers — no naked new/delete. Separate UI (Widgets/QML) from core logic so the core is unit-testable without a display. Use signals/slots for decoupling; avoid blocking the UI thread. Keep CMake the single source of build truth. Follow clang-format and fix clang-tidy findings.

## Agent Token Discipline
- Do not load every context file blindly — follow the Context Usage Strategy in `project-overview.md`.
- Summarize the relevant section of a file before editing it; never paste whole files into working context.
- Reference only the context relevant to the current phase or task.
- If a required decision is missing from these files, ask before implementing — do not assume.

## Typing Rules
- Modern C++ with RAII and smart pointers — no naked new/delete. Prefer Qt's ownership (parent/child) consistently; document any exceptions.
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
- PascalCase classes, camelCase methods/variables, m_ prefix for members (Qt convention), snake_case file names matching class names.
- Keep one logical unit (component, class, module) per file.

## Testing Rules
- Every feature ships with tests covering the happy path and at least one failure path.
- _Choose a test framework in the Stack step._
- Pure logic gets unit tests; user-critical flows get end-to-end coverage.

## Verification Commands
```bash
cmake --build build
ctest --test-dir build
clang-format --dry-run --Werror src/*.cpp
clang-tidy -p build src/*.cpp
```

## Definition of Done
The app builds with CMake and runs on all target OSes, delivering the MVP. Core logic is covered by ctest units. UI stays responsive under load. Deployment bundles are produced with windeployqt/macdeployqt.

## Build Discipline
- Update `progress-tracker.md` after every implementation change.
- Record significant decisions in the Decision Log of `progress-tracker.md`.
