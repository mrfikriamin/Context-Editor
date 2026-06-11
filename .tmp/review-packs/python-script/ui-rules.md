# UI Rules

This project has no graphical interface. These rules govern its command-line, log, and output behavior instead — the "UI" an operator actually sees.

## Output Conventions
- Results go to stdout; diagnostics and errors go to stderr.
- Output format: JSON
- Exit code 0 on success; non-zero, documented exit codes per failure class.
- Default output is quiet and machine-friendly; put detail behind a verbose flag.

## Help & Usage
- Provide help output (`--help` or comment-based help) documenting every argument and flag.
- Invalid arguments fail with a one-line usage hint, never a stack trace.

## Logging Rules
- Logging destination: stdout
- Log with timestamps and severity levels; never log secrets or credentials.
- Make failures actionable: what failed, why, and what to do next.

## Error Surface Rules
- Human-readable one-line error first; technical detail afterwards or in logs.
- Distinguish user errors (bad input, missing config) from system errors (network, permissions).
