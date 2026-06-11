import type { DesktopFramework, DesktopTypeDetails, TypeDetails } from "./types"

export interface DesktopFrameworkProfile {
  id: DesktopFramework
  label: string
  language: string
  uiToolkit: string
  buildTool: string
  packaging: string
  updater: string
  distribution: string
  dataStorage: string
  // True when the UI is built with web technologies (HTML/CSS/JS), so the
  // web-oriented design files (ui-registry.md) still apply.
  usesWebTech: boolean
  // How the UI layer talks to core logic — used in data-flow text and diagrams.
  coreBoundary: string
  graphTool: string
  typing: string
  naming: string
  folderStructure: string
  securityBullets: string[]
  conventions: string[]
}

export const DESKTOP_FRAMEWORKS: Record<DesktopFramework, DesktopFrameworkProfile> = {
  electron: {
    id: "electron",
    label: "Electron",
    language: "TypeScript (main + preload + renderer)",
    uiToolkit: "HTML/CSS with React, Vue, or plain DOM in the renderer",
    buildTool: "Electron Forge (official) or electron-builder",
    packaging: "electron-builder / Forge makers — NSIS or MSI (Windows), dmg (macOS), AppImage/deb (Linux)",
    updater: "electron-updater or Squirrel via update server / GitHub releases",
    distribution: "Website download, GitHub releases, Microsoft Store, winget",
    dataStorage: "app.getPath('userData') — JSON settings, SQLite (better-sqlite3), or electron-store",
    usesWebTech: true,
    coreBoundary: "renderer → contextBridge (preload) → ipcMain handler in the main process",
    graphTool: "madge or dependency-cruiser",
    typing: "Strict TypeScript everywhere (main, preload, renderer). Type IPC channels end-to-end with a shared contract module.",
    naming: "camelCase functions/variables, PascalCase components and classes, kebab-case files, IPC channels namespaced like `feature:action`.",
    folderStructure: `src/main/         # main process: windows, IPC handlers, app lifecycle
src/preload/      # contextBridge API surface (narrow, validated)
src/renderer/     # UI (web tech) — no Node access
src/shared/       # types + IPC contracts shared across processes
assets/           # icons, installer resources
forge.config.ts   # or electron-builder.yml
package.json`,
    securityBullets: [
      "Keep `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` (Electron 20+ defaults) — never relax them.",
      "Expose one narrow method per IPC message via `contextBridge`; never expose raw `ipcRenderer`.",
      "Validate every IPC payload in the main process like an untrusted HTTP request.",
      "Set a restrictive Content-Security-Policy and block navigation/window.open to unknown origins.",
      "Never load remote code; keep Electron updated to pick up Chromium/V8 security fixes.",
      "Code-sign installers and serve auto-updates over HTTPS with signature verification.",
    ],
    conventions: [
      "Business logic lives in plain modules imported by the main process — keep `main/` thin and testable.",
      "Renderer state management follows normal web-app practice; only cross-process concerns go through IPC.",
      "Use Forge/electron-builder for packaging; CI builds installers per OS.",
    ],
  },
  tauri: {
    id: "tauri",
    label: "Tauri v2",
    language: "Rust (core) + TypeScript (frontend)",
    uiToolkit: "Any static web frontend — React/Vite, Next.js with output: 'export', Svelte",
    buildTool: "cargo tauri build (frontend built first via beforeBuildCommand)",
    packaging: "Tauri bundler — MSI/NSIS (Windows), dmg/app (macOS), AppImage/deb/rpm (Linux)",
    updater: "Tauri updater plugin with signed update manifests",
    distribution: "Website download, GitHub releases, winget, app stores",
    dataStorage: "tauri-plugin-store, SQLite via tauri-plugin-sql, or app data dir from the path API",
    usesWebTech: true,
    coreBoundary: "WebView UI → invoke() → #[tauri::command] function in Rust",
    graphTool: "madge or dependency-cruiser (frontend) and cargo-modules (Rust)",
    typing: "Strict TypeScript in the frontend; typed command payloads with serde structs in Rust. Share command contracts via generated types where possible.",
    naming: "Rust snake_case for commands/modules, camelCase TypeScript, PascalCase components, kebab-case files.",
    folderStructure: `src/                     # web frontend (static build)
src-tauri/src/           # Rust: commands, state, plugins
src-tauri/capabilities/  # permission grants per window (keep minimal)
src-tauri/tauri.conf.json
src-tauri/Cargo.toml
package.json`,
    securityBullets: [
      "Grant the minimum capability/permission set in `capabilities/` — never a blanket allowlist.",
      "Validate every `#[tauri::command]` input at the Rust boundary; return `Result`, never `unwrap` in handlers.",
      "Set a restrictive CSP in `tauri.conf.json`.",
      "Keep secrets and privileged work in Rust; the WebView only sees what commands return.",
      "Sign update manifests (Tauri updater) and installers for each OS.",
    ],
    conventions: [
      "Frontend must build to static assets (no SSR) — e.g. Next.js `output: 'export'` to `out/`, wired via `frontendDist`.",
      "Heavy or privileged work belongs in Rust commands; keep the WebView UI thin.",
      "Exclude `src-tauri/` from the frontend tsconfig.",
    ],
  },
  qt: {
    id: "qt",
    label: "Qt 6",
    language: "C++17/20 (or Python with PySide6)",
    uiToolkit: "Qt Widgets (dense desktop UIs) or Qt Quick/QML (fluid, animated UIs)",
    buildTool: "CMake + Ninja (qmake is legacy)",
    packaging: "windeployqt / macdeployqt, then Qt Installer Framework, MSI, or dmg",
    updater: "Qt Installer Framework maintenance tool, Sparkle/WinSparkle, or custom",
    distribution: "Website download, enterprise deployment, app stores",
    dataStorage: "QSettings for preferences, SQLite via QSqlDatabase for data",
    usesWebTech: false,
    coreBoundary: "UI signals/slots → controller/service classes",
    graphTool: "Doxygen call graphs or clang-based tooling (e.g. clangd, CodeChecker)",
    typing: "Modern C++ with RAII and smart pointers — no naked new/delete. Prefer Qt's ownership (parent/child) consistently; document any exceptions.",
    naming: "PascalCase classes, camelCase methods/variables, m_ prefix for members (Qt convention), snake_case file names matching class names.",
    folderStructure: `src/core/         # UI-free business logic (unit-testable)
src/ui/           # widgets / QML, controllers
src/main.cpp
resources/        # .qrc, icons, translations
tests/            # ctest + Qt Test
CMakeLists.txt`,
    securityBullets: [
      "Validate all external input (files, network, IPC) before use; treat file parsers as attack surface.",
      "Store credentials in the OS keychain (QtKeychain), never in QSettings or plain files.",
      "Code-sign binaries and installers for each OS.",
      "Keep Qt patched; track CVEs in bundled modules (e.g. QtWebEngine if used).",
    ],
    conventions: [
      "Keep core logic in a UI-free library target so ctest can cover it without a display.",
      "Never block the UI thread — use worker threads or QtConcurrent for long work.",
      "CMake is the single source of build truth; clang-format + clang-tidy run in CI.",
    ],
  },
  csharp: {
    id: "csharp",
    label: "C# / .NET (Visual Studio)",
    language: "C# on .NET 8+",
    uiToolkit: "WinUI 3 (new Windows-only apps), WPF (mature ecosystem), MAUI (cross-platform/mobile), WinForms (legacy)",
    buildTool: "dotnet build / MSBuild (Visual Studio solution)",
    packaging: "MSIX (recommended), ClickOnce, or Inno Setup / WiX installer",
    updater: "MSIX auto-update, ClickOnce, or Squirrel.Windows",
    distribution: "Microsoft Store, winget, website download, enterprise deployment",
    dataStorage: "ApplicationData / %APPDATA% settings, SQLite via Microsoft.Data.Sqlite or EF Core",
    usesWebTech: false,
    coreBoundary: "XAML binding → ViewModel command → service/model layer",
    graphTool: ".NET analyzers and Visual Studio code maps (or NDepend)",
    typing: "Enable nullable reference types solution-wide and treat warnings as errors. Use records for immutable models.",
    naming: "PascalCase types/methods/properties, camelCase locals/parameters, _camelCase private fields, one class per file.",
    folderStructure: `MyApp.sln
src/MyApp/        # app project: Views/ (XAML), ViewModels/, App.xaml
src/MyApp.Core/   # UI-free models + services (unit-testable)
src/MyApp.Tests/  # xUnit/NUnit tests for Core + ViewModels
installer/        # MSIX packaging project or installer scripts`,
    securityBullets: [
      "Protect local secrets with DPAPI (ProtectedData) or Windows Credential Manager — never plain config files.",
      "Validate all file/network input; keep deserializers locked down (no BinaryFormatter).",
      "Code-sign the MSIX/installer; updates must come from a trusted, signed channel.",
      "Run as standard user — never require admin for normal operation.",
    ],
    conventions: [
      "MVVM throughout: no business logic in code-behind; views bind to view models.",
      "All I/O is async/await so the UI thread never blocks.",
      "Core logic lives in a UI-free project referenced by the app and the test project.",
    ],
  },
}

export function desktopProfile(framework: DesktopFramework | undefined): DesktopFrameworkProfile {
  return DESKTOP_FRAMEWORKS[framework ?? "electron"]
}

export function profileFromTypeDetails(td: TypeDetails): DesktopFrameworkProfile | null {
  return td.kind === "desktop-application" ? desktopProfile(td.details.framework) : null
}

export const DESKTOP_FRAMEWORK_OPTIONS: { id: DesktopFramework; label: string }[] = (
  ["electron", "tauri", "qt", "csharp"] as DesktopFramework[]
).map((id) => ({ id, label: DESKTOP_FRAMEWORKS[id].label }))

export function desktopDetailsOrDefault(d: Partial<DesktopTypeDetails>): DesktopTypeDetails {
  return {
    framework: d.framework ?? "electron",
    language: d.language ?? "",
    uiToolkit: d.uiToolkit ?? "",
    targetOS: d.targetOS ?? "",
    buildTool: d.buildTool ?? "",
    packaging: d.packaging ?? "",
    codeSigning: d.codeSigning ?? "",
    autoUpdate: d.autoUpdate ?? "",
    dataStorage: d.dataStorage ?? "",
    nativeIntegrations: d.nativeIntegrations ?? "",
    distribution: d.distribution ?? "",
  }
}
