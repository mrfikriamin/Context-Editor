// Throwaway validation harness: inspects actual generated output for
// structural errors across all project types and toggle modes.
import { generateFiles, packManifest } from "../lib/generate"
import { DEFAULT_STATE } from "../lib/types"
import type { ContextState, DesktopFramework, ProjectType, TypeDetails } from "../lib/types"

function clone(): ContextState {
  return JSON.parse(JSON.stringify(DEFAULT_STATE))
}

const EXPECTED_NAMES = [
  "project-overview.md",
  "architecture.md",
  "data-model.md",
  "code-standards.md",
  "ui-tokens.md",
  "ui-rules.md",
  "ui-registry.md",
  "library-docs.md",
  "build-plan.md",
  "progress-tracker.md",
]

function tdFor(t: ProjectType): TypeDetails {
  switch (t) {
    case "full-application":
      return { kind: t }
    case "desktop-application":
      return desktopTd("electron")
    case "terraform":
      return { kind: t, details: { cloudProvider: "AWS", modules: "VPC", stateHandling: "remote+lock", environments: "dev\nprod", policyChecks: "Checkov", secretsHandling: "SSM", deploymentWorkflow: "plan, approve, apply", driftManagement: "daily", complianceRules: "CIS", backendStorage: "S3+DynamoDB" } }
    case "api-service":
      return { kind: t, details: { runtime: "Node 20", framework: "Hono", endpoints: [{ method: "GET", path: "/health", request: "-", response: "200 ok", auth: "none" }, { method: "POST", path: "/import|batch", request: "CSV body", response: "202 job id", auth: "API key" }], authentication: "API key", rateLimiting: "100/min", inputFormat: "JSON", outputFormat: "JSON", logging: "JSON", errorHandling: "envelope" } }
    case "cli-tool":
      return { kind: t, details: { language: "Go", packageManager: "brew", commands: "init\nrun", arguments: "--verbose", configFile: ".rc", outputFormat: "table or json", platformCompatibility: "all" } }
    case "automation-cron":
      return { kind: t, details: { runtime: "Python 3.12", schedule: "0 2 * * *", trigger: "cron", dependencies: "boto3", logging: "CloudWatch JSON", errorHandling: "retry 3x", alerting: "Slack", secretsHandling: "Secrets Manager" } }
    default:
      return { kind: t, details: { runtime: "Python 3.12", osTarget: "Linux", dependencies: "requests", arguments: "--input x.csv", configFile: "cfg.yaml", inputFormat: "CSV", outputFormat: "JSON", logging: "stdout", errorHandling: "exit codes", scheduling: "manual", envVars: "API_KEY", secretsHandling: "env", retryBehavior: "3x", monitoring: "none", packaging: "pip", productionReadiness: "health summary" } } as TypeDetails
  }
}

function desktopTd(framework: DesktopFramework): TypeDetails {
  return {
    kind: "desktop-application",
    details: {
      framework,
      language: framework === "qt" ? "C++20" : framework === "csharp" ? "C# / .NET 8" : "TypeScript",
      uiToolkit: framework === "qt" ? "Qt Widgets" : framework === "csharp" ? "WinUI 3" : "React",
      targetOS: "Windows, macOS, Linux",
      buildTool: framework === "tauri" ? "cargo tauri build" : framework === "qt" ? "CMake" : framework === "csharp" ? "dotnet build" : "Electron Forge",
      packaging: framework === "tauri" ? "Tauri bundler" : framework === "qt" ? "Qt Installer Framework" : framework === "csharp" ? "MSIX" : "Forge makers",
      codeSigning: "OS signing certificates",
      autoUpdate: framework === "qt" ? "Qt Installer Framework maintenance tool" : "signed update channel",
      dataStorage: "OS app-data directory",
      nativeIntegrations: "tray icon\nnotifications",
      distribution: "website download and enterprise deployment",
    },
  }
}

const DESKTOP_FRAMEWORKS: DesktopFramework[] = ["electron", "tauri", "qt", "csharp"]
const TYPES: ProjectType[] = ["full-application", "desktop-application", "python-script", "bash-script", "powershell-script", "terraform", "cli-tool", "automation-cron", "api-service"]
const MODES: Record<string, object> = {
  off: {},
  on: { docIngestion: true, codebaseGraph: true, mermaidValidation: true, markdownLinting: true, tokenBudget: true },
  compact: { docIngestion: true, codebaseGraph: true, mermaidValidation: true, markdownLinting: true, tokenBudget: true, compactInstructions: true },
}

let fails = 0
let checks = 0
function assert(ok: boolean, msg: string) {
  checks++
  if (!ok) {
    fails++
    console.log("FAIL:", msg)
  }
}

// --- structural validators -------------------------------------------------

// Counts logical columns of a table line, ignoring escaped pipes.
function columnCount(line: string): number {
  const unescaped = line.split("\\|").join("§")
  // "| a | b |" -> ["", " a ", " b ", ""] -> 2 columns
  return unescaped.split("|").length - 2
}

function validateMarkdownStructure(name: string, content: string, ctx: string) {
  assert(content.startsWith("# "), `${ctx}/${name}: missing H1 on first line`)
  assert(!content.includes("\n\n\n"), `${ctx}/${name}: triple blank line`)
  assert(!content.includes("undefined"), `${ctx}/${name}: literal 'undefined' leaked`)
  assert(!content.includes("[object Object]"), `${ctx}/${name}: object leaked into template`)
  assert(!content.includes("NaN"), `${ctx}/${name}: NaN leaked`)

  // Balanced code fences.
  const fenceCount = content.split("\n").filter((l) => l.trimEnd().startsWith("```")).length
  assert(fenceCount % 2 === 0, `${ctx}/${name}: unbalanced code fences (${fenceCount})`)

  // Mermaid blocks must begin with a known diagram keyword.
  const mermaidBlocks = content.split("```mermaid").slice(1).map((b) => b.split("```")[0].trim())
  for (const block of mermaidBlocks) {
    const head = block.split("\n")[0].trim()
    assert(
      /^(flowchart|erDiagram|sequenceDiagram|classDiagram)/.test(head),
      `${ctx}/${name}: mermaid block starts with '${head}'`
    )
  }

  // Table rows must match their header column count (outside code fences).
  const lines = content.split("\n")
  let inFence = false
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trimEnd().startsWith("```")) {
      inFence = !inFence
      i++
      continue
    }
    if (!inFence && line.startsWith("|")) {
      // table block: header, separator, rows
      const header = line
      const sep = lines[i + 1] ?? ""
      const cols = columnCount(header)
      assert(cols >= 2, `${ctx}/${name}: table with <2 columns near '${header.slice(0, 40)}'`)
      assert(/^\|[\s\-|]+\|$/.test(sep.trim()), `${ctx}/${name}: bad separator row '${sep.slice(0, 40)}'`)
      assert(columnCount(sep) === cols, `${ctx}/${name}: separator/header column mismatch near '${header.slice(0, 40)}'`)
      let j = i + 2
      while (j < lines.length && lines[j].startsWith("|")) {
        assert(
          columnCount(lines[j]) === cols,
          `${ctx}/${name}: row column mismatch (${columnCount(lines[j])} vs ${cols}) near '${lines[j].slice(0, 50)}'`
        )
        j++
      }
      i = j
      continue
    }
    i++
  }
}

// --- matrix run -------------------------------------------------------------

for (const t of TYPES) {
  for (const [mode, patch] of Object.entries(MODES)) {
    const variants = t === "desktop-application" ? DESKTOP_FRAMEWORKS : [undefined]
    for (const framework of variants) {
      const ctx = framework ? `${t}/${framework}/${mode}` : `${t}/${mode}`
      const s = clone()
      s.idea.projectType = t
      s.idea.typeDetails = framework ? desktopTd(framework) : tdFor(t)
      s.idea.projectName = "Probe Project"
      // Adversarial-but-realistic user input: pipes and quotes.
      s.features.mvpFeatures = [
        { name: "Import | parse data", description: 'handles "weird" cells' },
        { name: "Report output", description: "" },
      ]
      s.features.knownRisks = "Formats differ - normalize per provider\nLong runtimes"
      s.dataModel = {
        entities: [
          {
            name: "Record",
            description: "One processed item",
            fields: [
              { name: "id|key", type: "text", required: true, notes: "pipe|in|notes" },
              { name: "value", type: "number", required: false, notes: "" },
            ],
          },
          { name: "Tag", description: "", fields: [{ name: "label", type: "text", required: true, notes: "" }] },
        ],
        relationships: "Record has many Tag\nfree-form note line",
        notes: "",
      }
      s.contextTools = { ...s.contextTools, ...patch }

      const files = generateFiles(s)

      // File-set contract.
      assert(files.length === 10, `${ctx}: ${files.length} files`)
      assert(
        JSON.stringify(files.map((f) => f.name)) === JSON.stringify(EXPECTED_NAMES),
        `${ctx}: file names/order drifted`
      )
      assert(files.every((f) => f.group.length > 0), `${ctx}: missing group label`)

      // Per-file structure.
      for (const f of files) validateMarkdownStructure(f.name, f.content, ctx)
      validateMarkdownStructure("AGENTS.md", packManifest(s), ctx)

      // Determinism: same input, byte-identical output.
      const again = generateFiles(s)
      assert(
        files.every((f, idx) => f.content === again[idx].content),
        `${ctx}: generation not deterministic`
      )

      // Preview parity: the Data step preview uses the same selector the export uses.
      const previewed = generateFiles(s).find((f) => f.name === "data-model.md")
      const exported = files.find((f) => f.name === "data-model.md")
      assert(previewed!.content === exported!.content, `${ctx}: data-model preview differs from export`)

      // Manifest must reference every canonical file.
      const manifest = packManifest(s)
      for (const n of ["project-overview.md", "architecture.md", "data-model.md", "code-standards.md", "build-plan.md", "library-docs.md", "progress-tracker.md"]) {
        assert(manifest.includes(n), `${ctx}: AGENTS.md missing reference to ${n}`)
      }
    }
  }
}

// Default (untouched) state must also be fully valid — the first-run experience.
const fresh = clone()
const freshFiles = generateFiles(fresh)
assert(freshFiles.length === 10, "default-state: file count")
for (const f of freshFiles) validateMarkdownStructure(f.name, f.content, "default-state")

console.log(
  fails === 0
    ? `ALL PASS — ${checks} checks across ${checks} structural checks`
    : `${fails} FAILURES out of ${checks} checks`
)
