# Graph Report - UI  (2026-06-11)

## Corpus Check
- 65 files · ~73,104 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 659 nodes · 1214 edges · 34 communities (30 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 52 edges
2. `architecture()` - 17 edges
3. `mdList()` - 16 edges
4. `architecture()` - 16 edges
5. `mdList()` - 16 edges
6. `compilerOptions` - 16 edges
7. `listFromText()` - 15 edges
8. `listFromText()` - 15 edges
9. `val()` - 14 edges
10. `val()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `DesktopFields()` --calls--> `desktopProfile()`  [EXTRACTED]
  components/type-details-panel.tsx → lib/desktop-frameworks.ts
- `ProjectTypeSelectorProps` --references--> `ProjectType`  [EXTRACTED]
  components/project-type-selector.tsx → lib/types.ts
- `ToggleCard()` --calls--> `cn()`  [EXTRACTED]
  components/sections/context-tools-section.tsx → lib/utils.ts
- `RequiredToggle()` --calls--> `cn()`  [EXTRACTED]
  components/sections/data-section.tsx → lib/utils.ts
- `Card()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (34 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (67): Home(), AreaField(), Field(), SectionHeader(), TextField(), OtherLibraries(), OtherLibrariesProps, RejectedLibraries() (+59 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (65): ContextToolOption, DOC_INGESTION_TOOLS, GRAPH_TOOLS, LINT_TOOLS, desktopProfile(), profileFromTypeDetails(), RiskItem, apiDetailsSection() (+57 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (62): context_tools_1, desktop_frameworks_1, stack_options_1, types_1, apiDetailsSection(), apiEndpoints(), architecture(), automationDetailsSection() (+54 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (38): 1. Understand What Is Here, 2. Align on Language, 3. Resolve Important Decisions, 4. Say “Blueprint ready.”, Acceptance Criteria, App Shell, Architect Skill Workflow To Follow Before Coding, `architecture.md` (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (29): buildDraft(), downloadDraft(), DraftFile, draftFileName(), parseDraft(), ApiEndpoint, ContextState, DEFAULT_STATE (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (32): dependencies, @base-ui/react, class-variance-authority, clsx, jszip, lucide-react, mermaid, next (+24 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (20): 1. Add `dataModelProfile(projectType)`, 2. Generate `data-model.md`, 3. Add Explicit Open-Decision Logic, 4. Add Single Configuration Section, 5. Improve API Contracts, 6. Improve Project-Type Output, 7. Improve Risks And Mitigations, 8. Improve `ui-registry.md` (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (19): Acknowledge the situation honestly, Diagnose before touching code, Do not start rebuilding immediately, Failure Mode 1 — A specific thing is broken, Failure Mode 2 — The session has gone wrong, Failure Mode 3 — The foundation is wrong, Find the root cause, If the fix does not work (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (19): Acknowledge the situation honestly, Diagnose before touching code, Do not start rebuilding immediately, Failure Mode 1 — A specific thing is broken, Failure Mode 2 — The session has gone wrong, Failure Mode 3 — The foundation is wrong, Find the root cause, If the fix does not work (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (13): DesktopFields(), EMPTY_API, EMPTY_AUTOMATION, EMPTY_CLI, EMPTY_DESKTOP, EMPTY_ENDPOINT, EMPTY_SCRIPT, EMPTY_TERRAFORM (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (15): AgentData, AgentPreset, CliTypeDetails, ColorMode, ConfigVariable, ContextToolsData, FeaturesData, GeneratedFile (+7 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (14): clone(), dataHeadings, { DEFAULT_STATE }, detailsFor(), files, { generateFiles }, modes, projectTypes (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (14): 1. `lib/types.ts`, 2. New `lib/desktop-frameworks.ts`, 3. `components/type-details-panel.tsx`, 4. `lib/generate.ts` — one new case per branch point (read profile via `s.idea.typeDetails`), 5. `lib/stack-options.ts`, 6. `app/page.tsx`, 7. Persistence — no migration needed, Context (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (14): Audit Mode — /imprint audit, Entry format, How to Invoke, How ui-registry.md Gets Used, Step 1 — Find What Was Just Built, Step 1 — Scan all UI components, Step 2 — Extract What Matters for Consistency, Step 2 — Identify conflicts (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (14): Format, How to Invoke, If memory is incomplete or unclear, Restore Mode, Safety check before writing, Save Mode, Security Boundary, Step 1 — Find the memory (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (14): Audit Mode — /imprint audit, Entry format, How to Invoke, How ui-registry.md Gets Used, Step 1 — Find What Was Just Built, Step 1 — Scan all UI components, Step 2 — Extract What Matters for Consistency, Step 2 — Identify conflicts (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (14): Format, How to Invoke, If memory is incomplete or unclear, Restore Mode, Safety check before writing, Save Mode, Security Boundary, Step 1 — Find the memory (+6 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (10): Layer 1 — Does it match the plan?, Layer 2 — Does it respect the system?, Layer 3 — Is it production ready?, Severity Guide, Step 1 — Understand What Should Have Been Built, Step 2 — Review in Three Layers, Step 3 — Report What You Found, Step 4 — Let the Developer Decide (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (10): Layer 1 — Does it match the plan?, Layer 2 — Does it respect the system?, Layer 3 — Is it production ready?, Severity Guide, Step 1 — Understand What Should Have Been Built, Step 2 — Review in Three Layers, Step 3 — Report What You Found, Step 4 — Let the Developer Decide (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.27
Nodes (8): ProjectTypeSelector(), ProjectTypeSelectorProps, defaultTypeDetails(), TypeDetailsPanel(), IdeaData, PROJECT_TYPES, ProjectType, IdeaSection()

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (6): DESKTOP_FRAMEWORK_OPTIONS, DESKTOP_FRAMEWORKS, DesktopFrameworkProfile, DesktopFramework, DesktopTypeDetails, TypeDetails

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (5): checkedExtensions, ignoredDirs, issues, root, tsc

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (6): Step 1 — Understand What's Here, Step 2 — Align on Language, Step 3 — Think Through the Decisions Together, Step 4 — Know When You Are Done, Step 5 — Produce the Implementation Plan, What This Session Is Not

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (5): StackCardProps, STACK_CATEGORIES, TECH_OPTIONS, StackCategory, TechOption

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (6): Step 1 — Understand What's Here, Step 2 — Align on Language, Step 3 — Think Through the Decisions Together, Step 4 — Know When You Are Done, Step 5 — Produce the Implementation Plan, What This Session Is Not

### Community 27 - "Community 27"
Cohesion: 0.40
Nodes (4): ApiEndpointEditor, ConfigVariables, DataModelSection, UI Registry

## Knowledge Gaps
- **294 isolated node(s):** `types_1`, `desktop_frameworks_1`, `stack_options_1`, `context_tools_1`, `RELEVANT_CATEGORIES` (+289 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 21`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `ContextState` connect `Community 4` to `Community 0`, `Community 1`, `Community 12`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `ProjectType` connect `Community 21` to `Community 0`, `Community 1`, `Community 12`, `Community 4`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `types_1`, `desktop_frameworks_1`, `stack_options_1` to the rest of the system?**
  _294 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.054627911770768915 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0886128364389234 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09663461538461539 - nodes in this community are weakly interconnected._