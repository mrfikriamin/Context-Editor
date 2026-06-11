# Code Standards

Conventions every contributor and agent must follow.

## Agent Role
Senior Python automation engineer

## Language & Framework
- Runtime: Python 3.12
- Validation: _None selected_
- Testing: _None selected_

## Principles
- Write clean, typed Python with docstrings. Handle errors explicitly with proper exit codes. Use virtual environments and pin dependencies. Log all operations with structured output. Keep scripts focused and composable.

## Agent Token Discipline
- Do not load every context file blindly — follow the Context Usage Strategy in `project-overview.md`.
- Summarize the relevant section of a file before editing it; never paste whole files into working context.
- Reference only the context relevant to the current phase or task.
- If a required decision is missing from these files, ask before implementing — do not assume.

## Typing Rules
- Use type hints on all public functions; keep mypy (or pyright) clean.
- Model structured data with dataclasses or Pydantic models, not bare dicts.
- Prefer pure, testable functions; isolate side effects (I/O, network) at the edges.

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
- snake_case for modules, functions, and variables; PascalCase for classes.
- Keep the entry point thin: argument parsing and wiring only.
- One module per responsibility.

## Testing Rules
- Every feature ships with tests covering the happy path and at least one failure path.
- _Choose a test framework in the Stack step._
- Pure logic gets unit tests; user-critical flows get end-to-end coverage.
- Minimum static checks for this project type: `ruff check .`, `mypy .`, `pytest`.

## Verification Commands
```bash
python -m py_compile main.py
ruff check .
pytest
mypy .
```

## Definition of Done
Script runs without errors on the target OS. All edge cases are handled with proper error messages. Dependencies are documented. Script passes linting and type checking.

## Build Discipline
- Update `progress-tracker.md` after every implementation change.
- Record significant decisions in the Decision Log of `progress-tracker.md`.
