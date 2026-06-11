# Desktop Application project type — generate context .md packs for Qt, C#/Visual Studio, Tauri v2, Electron

## Context

The Context Editor wizard generates AI-ready context `.md` packs, but its `ProjectType` list (`lib/types.ts:3`) only covers web apps, scripts, terraform, CLI, cron, and API services. Users describing a **desktop application** have no fitting option, so the generated files (stack, architecture, code standards, build plan) come out web-flavored. This change adds a **"Desktop Application"** project type with a **framework selector** — Electron, Tauri v2, Qt, C#/.NET (Visual Studio) — so every generated file renders desktop- and framework-correct guidance (build tools, packaging/signing, IPC security, folder structure, verification commands).

## Research summary

**Codebase (verified):** the generator follows a strict per-renderer pattern — ~12 branch points switch on `projectType`/`typeDetails.kind` in `lib/generate.ts` (`projectTypeLabel`:48, `typeNounPhrase`:62, `RELEVANT_CATEGORIES`:86, `graphToolForType`:103, `langProfile`:139, `dataModelProfile`:234, `configurationRows`:438, `securitySection`:493, `operationsSection`:555, `typeDetailsSection`:603, `dataFlowForType`:822, `folderStructureForType`:883, `starterDiagram`:1852). Per-type form fields live in `components/type-details-panel.tsx` (one `XxxFields` component + `EMPTY_XXX` default + `defaultTypeDetails` case). `isUIProject` (`lib/types.ts:107`) gates the Look step and the three `ui-*.md` files. Agent presets per type: `getAgentPreset` (`lib/types.ts:241`). Adding a type = adding one case to each location; no architectural change needed.

**Framework facts baked into generated content (2026):**
- **Electron:** harden with `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` (defaults since Electron 20); expose narrow per-message APIs via `contextBridge`; CSP + navigation restrictions. Forge is the official packager; electron-builder for cross-platform + auto-update.
- **Tauri v2:** Rust core + system WebView; static frontend (`output: 'export'` for Next); capability/permission allowlist; `cargo tauri build`; tiny binaries.
- **Qt 6:** C++ (CMake) or Python (PySide6); Widgets vs QML choice; `windeployqt`/`macdeployqt` + Qt Installer Framework; clang-format/clang-tidy/ctest.
- **C#/.NET:** WinUI 3 recommended for new Windows-only apps, WPF for mature ecosystem, MAUI only when mobile/macOS needed, WinForms legacy; `dotnet build/test/format`; MSIX/ClickOnce packaging.

## Design decisions

1. **One project type + framework select** (not 4 new tiles) — `{ kind: "desktop-application", details: { framework: "electron" | "tauri" | "qt" | "csharp", ... } }`. Mirrors how api-service holds a framework field; keeps the type grid clean.
2. **A single framework-profile table drives everything.** New `lib/desktop-frameworks.ts` holds per-framework: label, languages, UI toolkit options, build tool, packaging, updater, verification commands, security bullets, folder structure, `usesWebTech` flag. Generator cases and form placeholders read from it — no knowledge duplicated across the 12 switches.
3. **Desktop is a UI project**: `isUIProject` returns true for it (Look step + ui-tokens apply). `ui-registry.md` applies only when `usesWebTech` (Electron/Tauri); Qt/C# get the existing `notApplicable()` rendering.

## Implementation

### 1. `lib/types.ts`
- Add `"desktop-application"` to `ProjectType` and to `PROJECT_TYPES` (label "Desktop Application", description "Native desktop app — Electron, Tauri, Qt, or C#/.NET").
- New `DesktopTypeDetails`: `framework: DesktopFramework`, plus string fields `language`, `uiToolkit`, `targetOS`, `buildTool`, `packaging`, `codeSigning`, `autoUpdate`, `dataStorage`, `nativeIntegrations`, `distribution`.
- Add variant to `TypeDetails` union; `isUIProject` → `type === "full-application" || type === "desktop-application"`.
- `getAgentPreset(type, framework?)`: desktop case returns framework-specific role/principles/verification (e.g. Electron: lint/typecheck/test/package; Tauri: `cargo clippy && cargo test && cargo tauri build`; Qt: `cmake --build && ctest && clang-tidy`; C#: `dotnet format --verify-no-changes && dotnet build && dotnet test`). Update the two call sites (`app/page.tsx` patchIdea, and the reset usage in `components/sections/agent-section.tsx` — pass framework when kind is desktop).

### 2. New `lib/desktop-frameworks.ts`
`DESKTOP_FRAMEWORKS: Record<DesktopFramework, DesktopFrameworkProfile>` with the fields from Design #2, content per the research summary above. Export `desktopProfile(details)` helper.

### 3. `components/type-details-panel.tsx`
- `EMPTY_DESKTOP` (framework defaults to `"electron"`), `defaultTypeDetails` case, `DesktopFields` component: framework `Select` (4 options) first, then the detail fields — placeholders pulled from the selected framework's profile (e.g. uiToolkit placeholder for csharp: "WinUI 3, WPF, MAUI, WinForms"). Register in `TypeDetailsPanel` switch.

### 4. `lib/generate.ts` — one new case per branch point (read profile via `s.idea.typeDetails`)
- `projectTypeLabel` / `typeNounPhrase`: "Desktop Application" / "a desktop application".
- `RELEVANT_CATEGORIES`: `["frontend", "database", "orm", "validation", "testing", "deployment", "other"]` (frontend relevant for web-tech frameworks; harmless otherwise).
- `graphToolForType`: madge/dependency-cruiser for web-tech; Doxygen/clang-based or `dotnet` analyzers otherwise (keyed off profile when available, generic fallback).
- `langProfile`: per-framework typing/naming/minimum-checks from the profile.
- `dataModelProfile`: entities as "local data structures / storage tables", ER diagram shown.
- `configurationRows`: settings location, packaging targets, update channel, signing — from `DesktopTypeDetails`.
- `securitySection`: profile security bullets (Electron isolation/contextBridge/CSP; Tauri capabilities; code signing + update integrity + OS keychain/DPAPI for all).
- `operationsSection`: build → package → sign → distribute → auto-update → crash reporting.
- `typeDetailsSection`: new `desktopDetailsSection(d)` rendering the fields + a "Framework conventions" block from the profile.
- `dataFlowForType`: UI event → state → core logic (IPC main/renderer for Electron, Tauri commands, Qt signals/slots, MVVM bindings) → local storage → UI update, per framework.
- `folderStructureForType`: per-framework tree from the profile (needs the framework, so thread `state` or framework into this call like `configurationRows` does).
- `starterDiagram`: desktop branch (launch → main window → UI event → feature chain → local persistence → UI update).
- `uiRegistry`/`uiRules`/`uiTokens`: included because `isUIProject` is now true; gate `uiRegistry` on `usesWebTech`, add desktop notes to `uiRules` (native menus, keyboard shortcuts, window states).

### 5. `lib/stack-options.ts`
Add desktop entries: testing → "Qt Test", "xUnit / NUnit (.NET)", "WebdriverIO (Electron)"; deployment → "electron-builder / Forge", "Tauri bundler", "MSIX / Inno Setup", "Qt Installer Framework".

### 6. `app/page.tsx`
In `patchIdea`, also follow the agent preset when the **framework** changes within desktop-application and the preset is untouched (same pattern as the existing projectType-change logic at `app/page.tsx:56`).

### 7. Persistence — no migration needed
`normalizeState` deep-merges and existing drafts can't contain the new kind; draft import (`lib/draft-io.ts`) flows through the same path. Extend `scripts/smoke-generate.mjs` (and `scripts/validate-pack.ts` if it enumerates types) with a desktop-application case per framework.

## Verification

1. `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run test:generated`, `npx tsx scripts/smoke-draft-io.ts` all pass.
2. In the app (preview or user's dev server): select "Desktop Application" on the Idea step → framework select appears; switch between the 4 frameworks → placeholders/preset follow; Look step stays enabled.
3. Export step: for each framework, inspect `architecture.md` (folder structure + config rows match framework), `code-standards.md` (correct verification commands), `ui-registry.md` (real content for Electron/Tauri, "not applicable" for Qt/C#), `build-plan.md`, and the starter Mermaid diagram.
4. Save draft → reimport → desktop typeDetails round-trip intact.
5. Switch desktop → another type → back: details cached by `idea-section.tsx` detailsCache still restore.

## Sources
- [Electron security tutorial](https://www.electronjs.org/docs/latest/tutorial/security), [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation), [Why Electron Forge](https://www.electronforge.io/core-concepts/why-electron-forge)
- [Tauri v2 — Next.js frontend guide](https://v2.tauri.app/start/frontend/nextjs/)
- [Microsoft — Windows developer platform overview](https://learn.microsoft.com/en-us/windows/apps/get-started/), [WinUI vs WPF 2026 comparison](https://www.ctco.blog/posts/winui-vs-wpf-2026-practical-comparison/), [Telerik — WPF or .NET MAUI](https://www.telerik.com/blogs/wpf-net-maui-how-choose)
