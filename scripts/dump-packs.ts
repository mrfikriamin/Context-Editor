// Review helper: writes complete generated packs for representative states to
// .tmp/review-packs/ so the markdown can be inspected and linted directly.
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { generateFiles, packManifest, starterDiagram } from "../lib/generate"
import { DEFAULT_STATE, getAgentPreset } from "../lib/types"
import type { ContextState, DesktopFramework, TypeDetails } from "../lib/types"

function clone(): ContextState {
  return JSON.parse(JSON.stringify(DEFAULT_STATE))
}

function desktopTd(framework: DesktopFramework, filled: boolean): TypeDetails {
  return {
    kind: "desktop-application",
    details: filled
      ? {
          framework,
          language: "",
          uiToolkit: "",
          targetOS: "Windows, macOS",
          buildTool: "",
          packaging: "",
          codeSigning: "EV cert (Windows), Developer ID (macOS)",
          autoUpdate: "",
          dataStorage: "SQLite in app data",
          nativeIntegrations: "tray icon\nfile associations (.ctx)",
          distribution: "",
        }
      : {
          framework,
          language: "",
          uiToolkit: "",
          targetOS: "",
          buildTool: "",
          packaging: "",
          codeSigning: "",
          autoUpdate: "",
          dataStorage: "",
          nativeIntegrations: "",
          distribution: "",
        },
  }
}

function fill(s: ContextState) {
  s.idea.projectName = "Notesmith"
  s.idea.pitch = "Local-first note manager with fast search."
  s.idea.problem = "Notes are scattered across tools."
  s.idea.targetUsers = "Individual knowledge workers."
  s.idea.successCriteria = "Search under 100ms on 10k notes."
  s.idea.constraints = "Offline-first\nNo telemetry"
  s.features.mvpFeatures = [
    { name: "Create and edit notes", description: "Markdown editor with autosave" },
    { name: "Full-text search", description: "Indexed, under 100ms" },
    { name: "Tagging", description: "" },
  ]
  s.features.outOfScope = "Sync between devices\nCollaboration"
  s.features.knownRisks = "Search index growth — cap and compact periodically"
  s.dataModel.entities = [
    {
      name: "Note",
      description: "A single note",
      fields: [
        { name: "id", type: "uuid", required: true, notes: "" },
        { name: "title", type: "text", required: true, notes: "" },
        { name: "body", type: "markdown", required: false, notes: "" },
      ],
    },
    { name: "Tag", description: "", fields: [{ name: "label", type: "text", required: true, notes: "unique" }] },
  ]
  s.dataModel.relationships = "Note has many Tag"
}

const variants: { dir: string; mutate: (s: ContextState) => void }[] = [
  { dir: "full-application", mutate: () => {} },
  ...(["electron", "tauri", "qt", "csharp"] as DesktopFramework[]).map((fw) => ({
    dir: `desktop-${fw}`,
    mutate: (s: ContextState) => {
      s.idea.projectType = "desktop-application"
      s.idea.typeDetails = desktopTd(fw, true)
    },
  })),
  {
    dir: "desktop-electron-empty",
    mutate: (s: ContextState) => {
      s.idea.projectType = "desktop-application"
      s.idea.typeDetails = desktopTd("electron", false)
    },
  },
  {
    dir: "python-script",
    mutate: (s: ContextState) => {
      s.idea.projectType = "python-script"
      s.idea.typeDetails = {
        kind: "python-script",
        details: {
          runtime: "Python 3.12", osTarget: "Linux", dependencies: "click", arguments: "--input notes.csv",
          configFile: "", inputFormat: "CSV", outputFormat: "JSON", logging: "stdout", errorHandling: "exit codes",
          scheduling: "manual", envVars: "", secretsHandling: "env", retryBehavior: "", monitoring: "", packaging: "pip",
          productionReadiness: "",
        },
      }
    },
  },
]

const root = join(process.cwd(), ".tmp", "review-packs")
for (const v of variants) {
  const s = clone()
  fill(s)
  v.mutate(s)
  // Mirror what the app's patchIdea does on a project-type switch: follow the
  // agent preset and drop the untouched default web stack for non-web types.
  const fw = s.idea.typeDetails.kind === "desktop-application" ? s.idea.typeDetails.details.framework : undefined
  s.agent = { ...getAgentPreset(s.idea.projectType, fw) }
  if (s.idea.projectType !== "full-application") s.stack.selected = []
  const dir = join(root, v.dir)
  mkdirSync(dir, { recursive: true })
  for (const f of generateFiles(s)) writeFileSync(join(dir, f.name), f.content)
  writeFileSync(join(dir, "AGENTS.md"), packManifest(s))
  writeFileSync(join(dir, "starter-diagram.mmd"), starterDiagram(s) + "\n")
}
console.log(`Wrote ${variants.length} packs to ${root}`)
