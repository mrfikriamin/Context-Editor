# Project Overview

Read this first. It explains what the project is, who it serves, and how to know whether the MVP is working.

## Context Usage Strategy
Read in this order; stop as soon as you have what the current task needs:

1. `project-overview.md` — scope, users, success criteria (this file)
2. `architecture.md` — stack, data flow, structure, security, operations
3. `data-model.md` — entity or local record contracts and schema rules
4. `code-standards.md` — conventions and verification commands
5. `build-plan.md` — the current phase only
6. `library-docs.md` — when adding or using a dependency
7. `ui-tokens.md`, `ui-rules.md`, `ui-registry.md` — before any interface work

Essential context for this project: MVP scope, constraints, data contracts, stack choices, design tokens, build phases.

Read only when relevant:
- `ui-tokens.md`, `ui-rules.md`, `ui-registry.md` — read only when building interface components.
- `progress-tracker.md` history tables — read only the current status and open items.

Build only what is listed under MVP Scope. Anything under Out of Scope must not be implemented. Update `progress-tracker.md` after every change.

## Project Type
Desktop Application

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
- Choose Frontend for this Desktop Application.
- Choose Database for this Desktop Application.
- Choose ORM / DB Access for this Desktop Application.
- Choose Validation for this Desktop Application.
- Choose Testing for this Desktop Application.
- Choose Deployment for this Desktop Application.

## Desktop Application Configuration

| Property | Value |
| --- | --- |
| Framework | Electron |
| Language | TypeScript (main + preload + renderer) |
| UI Toolkit | HTML/CSS with React, Vue, or plain DOM in the renderer |
| Target OS | Windows, macOS |
| Build Tool | Electron Forge (official) or electron-builder |
| Packaging | electron-builder / Forge makers — NSIS or MSI (Windows), dmg (macOS), AppImage/deb (Linux) |
| Code Signing | EV cert (Windows), Developer ID (macOS) |
| Auto-update | electron-updater or Squirrel via update server / GitHub releases |
| Data Storage | SQLite in app data |
| Distribution | Website download, GitHub releases, Microsoft Store, winget |

### Native Integrations
- tray icon
- file associations (.ctx)

### Framework Conventions (Electron)
- Business logic lives in plain modules imported by the main process — keep `main/` thin and testable.
- Renderer state management follows normal web-app practice; only cross-process concerns go through IPC.
- Use Forge/electron-builder for packaging; CI builds installers per OS.

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
