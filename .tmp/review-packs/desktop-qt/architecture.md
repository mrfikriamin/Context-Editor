# Architecture

System architecture and technical structure for Notesmith.

## Overview
Notesmith is a desktop application. Local-first note manager with fast search.

Data contracts live in `data-model.md`; do not persist, parse, expose, or output data shapes that are not documented there.

## Stack Summary

| Layer | Choice |
| --- | --- |
| Database | _None selected - open decision_ |
| ORM / DB Access | _None selected - open decision_ |
| Validation | _None selected - open decision_ |
| Testing | _None selected - open decision_ |
| Deployment | _None selected - open decision_ |

## Architecture Evidence & Diagrams

```mermaid
flowchart TD
  A[Input or trigger] --> B[Validate input]
  B --> C[Core processing]
  C --> D[Persist or output results]
  D --> E[Log and verify success]
```

System boundaries: everything in this repository is inside the boundary; the operating system, external services, and the update/distribution channel are outside. Confirm before adding any integration that crosses it.

## Data Flow
1. The user interacts with the UI (Qt Widgets or Qt Quick/QML).
2. UI events reach core logic through the framework boundary: UI signals/slots → controller/service classes.
3. Inputs crossing that boundary are validated — treat them as untrusted.
4. MVP feature flow: 1. Create and edit notes → 2. Full-text search → 3. Tagging.
5. Data is persisted locally via SQLite in app data.
6. Results update application state and the UI re-renders; long work runs off the UI thread.

## Folder Structure Recommendation

```text
src/core/         # UI-free business logic (unit-testable)
src/ui/           # widgets / QML, controllers
src/main.cpp
resources/        # .qrc, icons, translations
tests/            # ctest + Qt Test
CMakeLists.txt
```

## Key Implementation Notes
- Validation approach: validate all external input at the boundary; choose the validation tooling in Phase 0.
- Constraint: Offline-first
- Constraint: No telemetry

## Configuration

| Name | Required | Source | Default | Visibility | Used By | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Settings / data location | Yes | OS app-data directory | SQLite in app data | internal | Persistence layer | Define the settings schema before writing it. |
| Packaging targets | Yes | Build pipeline | _None_ | internal | Release process | _—_ |
| Code signing | Yes | CI secrets / certificate store | EV cert (Windows), Developer ID (macOS) | secret | Installers and updates | Signing certificates are secrets; never commit them. |
| Auto-update channel | No | Update server / store | _None_ | internal | Updater | Updates must be signed and served over HTTPS. |

Rules:
- Read configuration only from the sources listed here.
- Treat every value marked secret as sensitive: never commit, print, or expose it.
- Update this table before adding a new environment variable, config file key, flag, tfvar, or scheduler setting.

## Security Considerations
- Validate all external input (files, network, IPC) before use; treat file parsers as attack surface.
- Store credentials in the OS keychain (QtKeychain), never in QSettings or plain files.
- Code-sign binaries and installers for each OS.
- Keep Qt patched; track CVEs in bundled modules (e.g. QtWebEngine if used).
- Store local data in SQLite in app data; never in the install directory.
- Never commit secrets; load them from the environment or a secrets manager.
- Keep dependencies pinned; update them deliberately, not implicitly.

## Packaging & Operations
- Build: CMake + Ninja (qmake is legacy)
- Packaging: windeployqt / macdeployqt, then Qt Installer Framework, MSI, or dmg
- Code signing: EV cert (Windows), Developer ID (macOS)
- Auto-update: Qt Installer Framework maintenance tool, Sparkle/WinSparkle, or custom
- Distribution: Website download, enterprise deployment, app stores
- Target OS: Windows, macOS
- CI builds, signs, and verifies installers for every target OS; a release is the full set of signed artifacts.
- Capture crash reports (e.g. Sentry or framework-native reporting) before public release.

## Known Issues / Tech Debt

| Item | Impact | Planned Resolution |
| --- | --- | --- |
| _None recorded yet_ | _—_ | _Update this table during implementation._ |
