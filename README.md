# Context Editor

A client-only Next.js wizard that turns a structured project brief into a deterministic pack of AI-ready context markdown files. No AI calls, no backend, no database — everything is generated locally from form state by pure functions.

## How It Works

```
User fills wizard steps → ContextState (localStorage)
  → generateFiles(state)  [pure, deterministic]
  → 10 markdown files + AGENTS.md
  → preview / edit overrides / download (.md, .zip incl. draft.json)
```

## Wizard Steps

| Step | Purpose |
| --- | --- |
| Idea | Project name, pitch, problem, users, constraints, project type |
| Mermaid | Architecture diagram editor with live preview |
| Features | MVP scope, out-of-scope items, risks |
| Data Model | Entities, fields, relationships |
| Stack | Framework, libraries, tooling choices |
| Look | Design tokens, colors, fonts, UI rules (UI projects only) |
| Context Tools | Optional local tooling toggles |
| Agent | Role, principles, verification commands, definition of done |
| Export | Inspect, edit, copy, and download generated files |

## Generated Files

1. `project-overview.md` — Capture
2. `architecture.md` — Architecture
3. `data-model.md` — Architecture
4. `code-standards.md` — Standards
5. `ui-tokens.md` — Design
6. `ui-rules.md` — Design
7. `ui-registry.md` — Design
8. `library-docs.md` — Library
9. `build-plan.md` — Plan
10. `progress-tracker.md` — Journal

Plus a root `AGENTS.md` reading guide manifest.

## Supported Project Types

- Full Application
- Desktop Application (Electron, Tauri, Qt, C#/.NET)
- Python Script
- Bash Script
- PowerShell Script
- Terraform
- CLI Tool
- Automation/Cron
- API Service

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5.7
- **Styling:** Tailwind CSS 4, shadcn-style primitives
- **Diagrams:** Mermaid.js (client render)
- **Packaging:** JSZip (export only)
- **Persistence:** localStorage (offline-capable, no backend)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run project lint |
| `npm run validate` | Validate generated packs across all project types |
| `npm run test:generated` | Smoke test generation pipeline |

## Architecture

- **Dependency direction:** `app → components → lib` (no cycles)
- **Generation is pure and deterministic** — same state always produces byte-identical output
- **State persists in localStorage** and can be exported/imported as a versioned JSON draft
- **All user text is escaped** through markdown safety helpers before rendering
- **Empty/default state produces a complete, valid pack** with `_TBD_` placeholders

## License

Private
