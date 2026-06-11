# Project Overview

Read this first. It explains what the project is, who it serves, and how to know whether the MVP is working.

## Context Usage Strategy
Read in this order; stop as soon as you have what the current task needs:

1. `project-overview.md` — scope, users, success criteria (this file)
2. `architecture.md` — stack, data flow, structure, security, operations
3. `data-model.md` — data shape contracts and schema rules
4. `code-standards.md` — conventions and verification commands
5. `build-plan.md` — the current phase only
6. `library-docs.md` — when adding or using a dependency
7. `ui-rules.md` — before writing user-facing output, logs, or errors

Essential context for this project: execution commands, arguments, dependencies, file paths, data contracts, configuration, validation, security, and rollback behavior.

Read only when relevant:
- `ui-tokens.md` and `ui-registry.md` — not applicable to this project type; skip them.
- `progress-tracker.md` history tables — read only the current status and open items.

Build only what is listed under MVP Scope. Anything under Out of Scope must not be implemented. Update `progress-tracker.md` after every change.

## Project Type
Python Script

## Project Name
Notesmith

## One-Line Pitch
Local-first note manager with fast search.

## Problem Statement
Notes are scattered across tools.

## Target Users
Individual knowledge workers.

## Success Criteria
- Search under 100ms on 10k notes.

## Constraints
- Offline-first
- No telemetry

## Open Decisions Before Coding
- Choose Validation for this Python Script.
- Choose Testing for this Python Script.
- Choose Automation / Scripts for this Python Script.

## Python Script Configuration

| Property | Value |
| --- | --- |
| Runtime | Python 3.12 |
| OS Target | Linux |
| Arguments | --input notes.csv |
| Config File | _TBD_ |
| Input Format | CSV |
| Output Format | JSON |
| Secrets Handling | env |
| Retry Behavior | _TBD_ |
| Logging | stdout |
| Error Handling | exit codes |
| Monitoring | _TBD_ |
| Packaging | pip |
| Scheduling | manual |

### Dependencies
- click

### Environment Variables
_None specified._

### Production Readiness
_Not specified yet._

## MVP Scope

| Feature | Description | Status |
| --- | --- | --- |
| Create and edit notes | Markdown editor with autosave | Planned |
| Full-text search | Indexed, under 100ms | Planned |
| Tagging | _To be detailed during implementation._ | Planned |

## Out of Scope (For Now)
- Sync between devices
- Collaboration

## Risks Summary
- Search index growth - cap and compact periodically

See `build-plan.md` for mitigations and `progress-tracker.md` for live status.
