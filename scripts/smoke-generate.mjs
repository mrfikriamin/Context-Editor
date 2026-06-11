import { createRequire } from "node:module"
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

const root = process.cwd()
const tempRoot = path.join(root, ".tmp")
fs.mkdirSync(tempRoot, { recursive: true })
const temp = fs.mkdtempSync(path.join(tempRoot, "context-editor-generate-"))
const files = ["types.ts", "stack-options.ts", "context-tools.ts", "desktop-frameworks.ts", "generate.ts"]

for (const file of files) {
  const sourcePath = path.join(root, "lib", file)
  const outPath = path.join(temp, "lib", file.replace(/\.ts$/, ".js"))
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  const source = fs.readFileSync(sourcePath, "utf8")
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  })
  fs.writeFileSync(outPath, compiled.outputText)
}

const requireTemp = createRequire(path.join(temp, "index.js"))
const { DEFAULT_STATE } = requireTemp("./lib/types.js")
const { generateFiles } = requireTemp("./lib/generate.js")

const projectTypes = [
  "full-application",
  "desktop-application",
  "api-service",
  "python-script",
  "bash-script",
  "powershell-script",
  "terraform",
  "cli-tool",
  "automation-cron",
]

const modes = ["off", "all", "compact"]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function detailsFor(kind) {
  const script = {
    runtime: "Runtime 1",
    osTarget: "Cross-platform",
    dependencies: "dep-one",
    arguments: "--input file.json",
    configFile: "config.json",
    inputFormat: "JSON",
    outputFormat: "JSON",
    logging: "stdout",
    errorHandling: "non-zero exit codes",
    scheduling: "manual",
    envVars: "API_KEY",
    secretsHandling: "env vars",
    retryBehavior: "3 retries",
    monitoring: "logs",
    packaging: "archive",
    productionReadiness: "dry-run supported",
  }
  switch (kind) {
    case "full-application":
      return { kind }
    case "api-service":
      return {
        kind,
        details: {
          runtime: "Node.js 20",
          framework: "Fastify",
          endpoints: [
            {
              method: "GET",
              path: "/health",
              request: "none",
              response: "HealthResponse",
              auth: "public",
            },
          ],
          authentication: "API key",
          rateLimiting: "100 req/min",
          inputFormat: "JSON",
          outputFormat: "JSON",
          logging: "JSON",
          errorHandling: "error envelope",
        },
      }
    case "desktop-application":
      return {
        kind,
        details: {
          framework: "electron",
          language: "TypeScript",
          uiToolkit: "React renderer",
          targetOS: "Windows, macOS, Linux",
          buildTool: "Electron Forge",
          packaging: "NSIS, dmg, AppImage",
          codeSigning: "OS signing certificates",
          autoUpdate: "electron-updater",
          dataStorage: "app.getPath('userData') + SQLite",
          nativeIntegrations: "tray icon\nnotifications\nfile associations",
          distribution: "website download and GitHub releases",
        },
      }
    case "terraform":
      return {
        kind,
        details: {
          cloudProvider: "AWS",
          modules: "vpc",
          stateHandling: "remote state with locking",
          environments: "dev\nprod",
          policyChecks: "checkov",
          secretsHandling: "Secrets Manager",
          deploymentWorkflow: "plan -> review -> apply",
          driftManagement: "daily drift check",
          complianceRules: "CIS",
          backendStorage: "S3 + DynamoDB",
        },
      }
    case "cli-tool":
      return {
        kind,
        details: {
          language: "Go",
          packageManager: "go install",
          commands: "scan\nreport",
          arguments: "--format json",
          configFile: "tool.toml",
          outputFormat: "JSON",
          platformCompatibility: "Linux, macOS, Windows",
        },
      }
    case "automation-cron":
      return {
        kind,
        details: {
          runtime: "Python 3.12",
          schedule: "0 2 * * *",
          trigger: "cron",
          dependencies: "requests",
          logging: "stdout",
          errorHandling: "retry and alert",
          alerting: "Slack",
          secretsHandling: "env vars",
        },
      }
    default:
      return { kind, details: { ...script } }
  }
}

function stateFor(kind, mode) {
  const state = clone(DEFAULT_STATE)
  state.idea.projectType = kind
  state.idea.typeDetails = detailsFor(kind)
  state.idea.projectName = `${kind} smoke`
  state.idea.pitch = "Smoke-test generated context."
  state.idea.problem = "Ensure generated markdown is implementation-ready."
  state.idea.targetUsers = "Implementation agents"
  state.idea.successCriteria = "Generator emits valid context\nNo stale file-count copy"
  state.features.mvpFeatures = [{ name: "Core workflow", description: "Happy and failure paths work" }]
  state.features.knownRisks = "Contract drift - Keep data-model.md updated"
  state.dataModel.entities = [
    {
      name: kind === "terraform" ? "module_input" : "Project",
      description: "Primary contract",
      fields: [{ name: "id", type: "string", required: true, notes: "Stable identifier" }],
    },
  ]
  state.dataModel.relationships = "Project has many Tasks"
  state.stack.configVariables = [
    {
      name: "API_KEY",
      required: true,
      source: "Environment",
      defaultValue: "",
      visibility: "secret",
      usedBy: "Runtime",
      notes: "Never log",
    },
  ]
  state.stack.configNotes = "Use env vars in production."
  if (mode === "all") {
    state.contextTools = {
      ...state.contextTools,
      docIngestion: true,
      codebaseGraph: true,
      mermaidValidation: true,
      markdownLinting: true,
      tokenBudget: true,
    }
  }
  if (mode === "compact") {
    state.contextTools.compactInstructions = true
  }
  return state
}

function countHeading(files, heading) {
  const re = new RegExp(`^## ${heading}$`, "gm")
  return files.reduce((count, file) => count + (file.content.match(re) ?? []).length, 0)
}

const dataHeadings = {
  "full-application": "Entities",
  "desktop-application": "Entities & Local Records",
  "api-service": "Resources & Payloads",
  "python-script": "Data Shapes (Input / Output)",
  "bash-script": "Data Shapes (Input / Output)",
  "powershell-script": "Data Shapes (Input / Output)",
  terraform: "Module Inputs & Outputs",
  "cli-tool": "Config & Output Schemas",
  "automation-cron": "Data Shapes & State",
}

for (const kind of projectTypes) {
  for (const mode of modes) {
    const state = stateFor(kind, mode)
    const generated = generateFiles(state)
    const byName = Object.fromEntries(generated.map((file) => [file.name, file.content]))
    const joined = generated.map((file) => file.content).join("\n\n")

    assert(generated.length === 10, `${kind}/${mode}: expected 10 files`)
    assert(generated.every((file) => file.content.startsWith("#")), `${kind}/${mode}: every file must start with #`)
    assert(!/\n{4,}/.test(joined), `${kind}/${mode}: generated output has triple blank lines`)
    assert(byName["data-model.md"]?.includes(`## ${dataHeadings[kind]}`), `${kind}/${mode}: wrong data-model heading`)
    assert(countHeading(generated, "Configuration") === 1, `${kind}/${mode}: expected exactly one Configuration section`)
    assert(byName["build-plan.md"].includes("Keep data-model.md updated"), `${kind}/${mode}: risk mitigation not rendered`)
    assert(byName["build-plan.md"].includes("Phase 0"), `${kind}/${mode}: missing Phase 0`)
    assert(byName["progress-tracker.md"].includes("Phase 0"), `${kind}/${mode}: tracker missing Phase 0`)
    assert(byName["data-model.md"].includes("Do not invent"), `${kind}/${mode}: data rules missing`)
    if (!["full-application", "desktop-application", "api-service"].includes(kind)) {
      assert(!byName["data-model.md"].includes("ER Diagram"), `${kind}/${mode}: ER diagram leaked`)
    }
    if (kind === "terraform") {
      assert(!byName["ui-rules.md"].includes("--help"), `${kind}/${mode}: CLI help leaked into Terraform`)
    }
    if (kind === "api-service") {
      assert(byName["project-overview.md"].includes("| Method | Path | Request | Response | Auth |"), `${kind}/${mode}: API contract columns missing`)
      assert(byName["build-plan.md"].includes("GET /health"), `${kind}/${mode}: endpoint test row missing`)
    }
  }
}

const sourceFiles = [
  "app/layout.tsx",
  "components/sidebar.tsx",
  "components/sections/export-section.tsx",
  "components/sections/context-tools-section.tsx",
]
for (const file of sourceFiles) {
  const text = fs.readFileSync(path.join(root, file), "utf8")
  assert(!text.includes("9 files") && !text.includes("9 AI-ready"), `${file}: stale 9-file copy`)
}

fs.rmSync(temp, { recursive: true, force: true })
console.log(`Generated markdown smoke matrix passed (${projectTypes.length} project types x ${modes.length} modes).`)
