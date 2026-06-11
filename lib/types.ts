export type ColorMode = "Light" | "Dark" | "System"

export type ProjectType =
  | "full-application"
  | "desktop-application"
  | "python-script"
  | "bash-script"
  | "powershell-script"
  | "terraform"
  | "cli-tool"
  | "automation-cron"
  | "api-service"

export type DesktopFramework = "electron" | "tauri" | "qt" | "csharp"

export interface DesktopTypeDetails {
  framework: DesktopFramework
  language: string
  uiToolkit: string
  targetOS: string
  buildTool: string
  packaging: string
  codeSigning: string
  autoUpdate: string
  dataStorage: string
  nativeIntegrations: string
  distribution: string
}

export interface ScriptTypeDetails {
  runtime: string
  osTarget: string
  dependencies: string
  arguments: string
  configFile: string
  inputFormat: string
  outputFormat: string
  logging: string
  errorHandling: string
  scheduling: string
  envVars: string
  secretsHandling: string
  retryBehavior: string
  monitoring: string
  packaging: string
  productionReadiness: string
}

export interface TerraformTypeDetails {
  cloudProvider: string
  modules: string
  stateHandling: string
  environments: string
  policyChecks: string
  secretsHandling: string
  deploymentWorkflow: string
  driftManagement: string
  complianceRules: string
  backendStorage: string
}

export interface ApiServiceTypeDetails {
  runtime: string
  framework: string
  endpoints: ApiEndpoint[]
  authentication: string
  rateLimiting: string
  inputFormat: string
  outputFormat: string
  logging: string
  errorHandling: string
}

export interface CliTypeDetails {
  language: string
  packageManager: string
  commands: string
  arguments: string
  configFile: string
  outputFormat: string
  platformCompatibility: string
}

export interface AutomationTypeDetails {
  runtime: string
  schedule: string
  trigger: string
  dependencies: string
  logging: string
  errorHandling: string
  alerting: string
  secretsHandling: string
}

export interface ApiEndpoint {
  method: string
  path: string
  request: string
  response: string
  auth: string
}

export type TypeDetails =
  | { kind: "full-application" }
  | { kind: "desktop-application"; details: DesktopTypeDetails }
  | { kind: "python-script"; details: ScriptTypeDetails }
  | { kind: "bash-script"; details: ScriptTypeDetails }
  | { kind: "powershell-script"; details: ScriptTypeDetails }
  | { kind: "terraform"; details: TerraformTypeDetails }
  | { kind: "cli-tool"; details: CliTypeDetails }
  | { kind: "automation-cron"; details: AutomationTypeDetails }
  | { kind: "api-service"; details: ApiServiceTypeDetails }

export const PROJECT_TYPES: { id: ProjectType; label: string; description: string }[] = [
  { id: "full-application", label: "Full Application", description: "Web or mobile app with UI" },
  { id: "desktop-application", label: "Desktop Application", description: "Native desktop app — Electron, Tauri, Qt, or C#/.NET" },
  { id: "python-script", label: "Python Script", description: "Standalone Python script or tool" },
  { id: "bash-script", label: "Bash Script", description: "Shell script for Linux/macOS" },
  { id: "powershell-script", label: "PowerShell Script", description: "PowerShell script for Windows" },
  { id: "terraform", label: "Terraform / IaC", description: "Infrastructure as Code" },
  { id: "cli-tool", label: "CLI Tool", description: "Command-line interface tool" },
  { id: "automation-cron", label: "Automation / Cron", description: "Scheduled job or automation task" },
  { id: "api-service", label: "API Service", description: "REST/GraphQL API or microservice" },
]

export function isUIProject(type: ProjectType): boolean {
  return type === "full-application" || type === "desktop-application"
}

export interface IdeaData {
  projectName: string
  pitch: string
  problem: string
  targetUsers: string
  successCriteria: string
  constraints: string
  projectType: ProjectType
  typeDetails: TypeDetails
}

export interface MvpFeature {
  name: string
  description: string
}

export interface FeaturesData {
  mvpFeatures: MvpFeature[]
  outOfScope: string
  knownRisks: string
}

export interface SelectedTech {
  techId: string
  label: string
  config: string
}

export interface OtherLibItem {
  name: string
  notes: string
  checked: boolean
}

export interface DataField {
  name: string
  type: string
  required: boolean
  notes: string
}

export interface DataEntity {
  name: string
  description: string
  fields: DataField[]
}

export interface DataModelData {
  entities: DataEntity[]
  relationships: string
  notes: string
}

export interface ConfigVariable {
  name: string
  required: boolean
  source: string
  defaultValue: string
  visibility: "public" | "secret" | "internal"
  usedBy: string
  notes: string
}

export type StackCategoryId =
  | "frontend"
  | "backend"
  | "database"
  | "orm"
  | "auth"
  | "validation"
  | "testing"
  | "deployment"
  | "automation"
  | "other"

export interface StackCategory {
  id: StackCategoryId
  label: string
  description: string
}

export interface TechOption {
  id: string
  label: string
  defaultConfig: string
}

export interface RejectedLib {
  library: string
  why: string
  alternative: string
}

export interface StackData {
  selected: SelectedTech[]
  otherLibraries: OtherLibItem[]
  rejectedLibraries: RejectedLib[]
  configVariables: ConfigVariable[]
  configNotes: string
}

export interface LookData {
  brandAdjectives: string
  primary: string
  background: string
  surface: string
  text: string
  success: string
  error: string
  displayFont: string
  bodyFont: string
  monoFont: string
  colorMode: ColorMode
  designNotes: string
}

export interface AgentData {
  role: string
  principles: string
  verificationCommands: string
  definitionOfDone: string
}

export interface AgentPreset {
  role: string
  principles: string
  verificationCommands: string
  definitionOfDone: string
}

const DESKTOP_AGENT_PRESETS: Record<DesktopFramework, AgentPreset> = {
  electron: {
    role: "Senior desktop application engineer (Electron)",
    principles:
      "Keep Electron security defaults intact: contextIsolation true, nodeIntegration false, sandbox true. Expose only narrow, validated APIs through contextBridge — one method per IPC message, never raw ipcRenderer. Treat every IPC message from the renderer as untrusted input. Set a restrictive CSP and limit navigation. Keep main-process logic small and testable; put business logic in plain modules.",
    verificationCommands: "npm run lint\nnpm run typecheck\nnpm run test\nnpm run package",
    definitionOfDone:
      "The app launches on all target OSes and delivers the MVP. Installers build successfully. Security defaults (context isolation, sandbox, CSP) are intact and IPC inputs are validated. Code passes linting, type checking, and tests.",
  },
  tauri: {
    role: "Senior desktop application engineer (Tauri v2 + Rust)",
    principles:
      "Keep the frontend a static bundle (no SSR). Grant the minimum capability/permission set in the Tauri config — never a blanket allowlist. Implement typed Tauri commands in Rust and validate every command input at the Rust boundary. Keep heavy work in Rust; keep the WebView UI thin. Handle errors with Result types, never unwrap in command handlers.",
    verificationCommands:
      "npm run lint\nnpm run typecheck\ncargo clippy --all-targets\ncargo test\ncargo tauri build",
    definitionOfDone:
      "The app builds and runs on all target OSes and delivers the MVP. Capabilities are minimal and documented. Rust passes clippy and tests; the frontend passes linting and type checking. Bundles are produced for each target.",
  },
  qt: {
    role: "Senior C++/Qt desktop engineer",
    principles:
      "Use modern C++ (C++17 or later) with RAII and smart pointers — no naked new/delete. Separate UI (Widgets/QML) from core logic so the core is unit-testable without a display. Use signals/slots for decoupling; avoid blocking the UI thread. Keep CMake the single source of build truth. Follow clang-format and fix clang-tidy findings.",
    verificationCommands:
      "cmake --build build\nctest --test-dir build\nclang-format --dry-run --Werror src/*.cpp\nclang-tidy -p build src/*.cpp",
    definitionOfDone:
      "The app builds with CMake and runs on all target OSes, delivering the MVP. Core logic is covered by ctest units. UI stays responsive under load. Deployment bundles are produced with windeployqt/macdeployqt.",
  },
  csharp: {
    role: "Senior .NET desktop engineer (Visual Studio)",
    principles:
      "Follow MVVM: views bind to view models, no business logic in code-behind. Enable nullable reference types and treat warnings as errors. Use async/await for all I/O so the UI thread never blocks. Use dependency injection for services. Keep models and services in a UI-free project so they are unit-testable.",
    verificationCommands:
      "dotnet format --verify-no-changes\ndotnet build -warnaserror\ndotnet test",
    definitionOfDone:
      "The solution builds clean in Visual Studio and delivers the MVP. View models and services pass unit tests. The UI stays responsive. An installer/package (MSIX or equivalent) is produced.",
  },
}

export function getAgentPreset(type: ProjectType, framework?: DesktopFramework): AgentPreset {
  switch (type) {
    case "desktop-application":
      return { ...DESKTOP_AGENT_PRESETS[framework ?? "electron"] }
    case "full-application":
      return {
        role: "Senior full-stack product engineer",
        principles: "Plan before coding. Keep every change scoped and testable. Build the MVP first before adding advanced integrations. Use strongly typed code, reusable components, and validation for all imported data. Verify each feature before moving to the next build phase.",
        verificationCommands: "npm run lint\nnpm run typecheck\nnpm run test\nnpm run build",
        definitionOfDone: "The app runs locally without errors and delivers the MVP. All core pages are responsive, readable, and aligned with the design system. Code passes linting, type checking, unit tests, and a production build.",
      }
    case "python-script":
      return {
        role: "Senior Python automation engineer",
        principles: "Write clean, typed Python with docstrings. Handle errors explicitly with proper exit codes. Use virtual environments and pin dependencies. Log all operations with structured output. Keep scripts focused and composable.",
        verificationCommands: "python -m py_compile main.py\nruff check .\npytest\nmypy .",
        definitionOfDone: "Script runs without errors on the target OS. All edge cases are handled with proper error messages. Dependencies are documented. Script passes linting and type checking.",
      }
    case "bash-script":
      return {
        role: "Senior shell scripting / DevOps engineer",
        principles: "Use shellcheck-compliant bash. Set strict mode (set -euo pipefail). Validate all inputs. Use proper exit codes. Log operations with timestamps. Handle signals and cleanup with traps.",
        verificationCommands: "shellcheck script.sh\nbash -n script.sh\n./run-tests.sh",
        definitionOfDone: "Script runs without errors on target shells. Edge cases handled. Proper exit codes. Clean output. Documented usage with --help flag.",
      }
    case "powershell-script":
      return {
        role: "Senior Windows / PowerShell automation engineer",
        principles: "Use approved verbs for functions. Implement proper error handling with try/catch and $ErrorActionPreference. Support -Verbose and -WhatIf. Use [CmdletBinding()] and proper parameter validation. Follow PSScriptAnalyzer rules.",
        verificationCommands: "Invoke-ScriptAnalyzer -Path .\nGet-Command *-Tests | ForEach-Object { & $_ }",
        definitionOfDone: "Script runs without errors on target PowerShell version. Supports common parameters. Proper error handling. Documented with comment-based help.",
      }
    case "terraform":
      return {
        role: "Senior infrastructure / DevOps / security engineer",
        principles: "Follow Terraform best practices. Use remote state with locking. Implement least-privilege IAM. Tag all resources. Use variables and outputs consistently. Validate with terraform validate and plan before apply. Run security scans.",
        verificationCommands: "terraform fmt -check\nterraform validate\nterraform plan\ncheckov -d .",
        definitionOfDone: "Infrastructure provisions cleanly with no errors. All resources tagged. State stored remotely with encryption. Security scans pass. All environments configured.",
      }
    case "cli-tool":
      return {
        role: "Senior CLI / systems tooling engineer",
        principles: "Follow POSIX conventions where applicable. Implement --help and --version flags. Use proper exit codes. Handle piped input gracefully. Provide clear error messages. Support configuration files.",
        verificationCommands: "go test ./...\ngo vet ./...\ngolangci-lint run\ngo build",
        definitionOfDone: "CLI builds for all target platforms. All commands work as documented. Help text is clear and complete. Exit codes are correct. Man page or help is generated.",
      }
    case "automation-cron":
      return {
        role: "Senior automation / reliability engineer",
        principles: "Design for idempotency. Implement proper retry logic with backoff. Log all operations with structured output. Alert on failures. Handle concurrent execution. Clean up resources after completion.",
        verificationCommands: "python -m py_compile main.py\nruff check .\npytest\ndry-run.sh",
        definitionOfDone: "Job runs on schedule without manual intervention. Failures trigger alerts. Retry logic handles transient errors. Logs are queryable. No resource leaks.",
      }
    case "api-service":
      return {
        role: "Senior backend / API engineer",
        principles: "Design RESTful endpoints with proper HTTP semantics. Validate all inputs at the boundary. Implement rate limiting and authentication. Use structured logging. Handle errors with appropriate status codes. Write OpenAPI documentation.",
        verificationCommands: "npm run lint\nnpm run typecheck\nnpm run test\nnpm run build",
        definitionOfDone: "API serves requests without errors. All endpoints documented. Authentication enforced. Rate limiting active. Error responses follow consistent format. Passes load testing.",
      }
    default:
      return {
        role: "Senior software engineer",
        principles: "Plan before coding. Keep every change scoped and testable. Verify each feature before moving to the next.",
        verificationCommands: "npm run lint\nnpm run test",
        definitionOfDone: "The project runs without errors and delivers the MVP.",
      }
  }
}

export interface MermaidData {
  code: string
}

export interface ContextToolsData {
  docIngestion: boolean
  docIngestionTool: string
  docIngestionCustom: string
  codebaseGraph: boolean
  codebaseGraphTool: string
  codebaseGraphCustom: string
  mermaidValidation: boolean
  markdownLinting: boolean
  lintTool: string
  lintCustom: string
  tokenBudget: boolean
  compactInstructions: boolean
}

export interface ContextState {
  idea: IdeaData
  features: FeaturesData
  dataModel: DataModelData
  stack: StackData
  look: LookData
  contextTools: ContextToolsData
  agent: AgentData
  mermaid: MermaidData
}

export type SectionId =
  | "idea"
  | "mermaid"
  | "features"
  | "data"
  | "stack"
  | "look"
  | "context"
  | "agent"
  | "export"

export interface GeneratedFile {
  name: string
  group: string
  content: string
}

export const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "idea", label: "Idea" },
  { id: "mermaid", label: "Mermaid Editor" },
  { id: "features", label: "Features" },
  { id: "data", label: "Data Model" },
  { id: "stack", label: "Stack" },
  { id: "look", label: "Look" },
  { id: "context", label: "Context Tools" },
  { id: "agent", label: "Agent" },
  { id: "export", label: "Export" },
]

export const DEFAULT_STATE: ContextState = {
  idea: {
    projectName: "",
    pitch: "",
    problem: "",
    targetUsers: "",
    successCriteria: "",
    constraints: "",
    projectType: "full-application",
    typeDetails: { kind: "full-application" },
  },
  features: {
    mvpFeatures: [
      { name: "", description: "" },
      { name: "", description: "" },
      { name: "", description: "" },
    ],
    outOfScope: "",
    knownRisks: "",
  },
  dataModel: {
    entities: [],
    relationships: "",
    notes: "",
  },
  stack: {
    selected: [
      { techId: "nextjs", label: "Next.js App Router + TypeScript", config: "" },
      { techId: "tailwind", label: "Tailwind CSS", config: "" },
      { techId: "shadcn", label: "shadcn/ui", config: "" },
      { techId: "zod", label: "Zod", config: "" },
      { techId: "vitest", label: "Vitest", config: "" },
      { techId: "playwright", label: "Playwright", config: "" },
      { techId: "vercel", label: "Vercel", config: "" },
    ],
    otherLibraries: [],
    rejectedLibraries: [],
    configVariables: [],
    configNotes: "",
  },
  look: {
    brandAdjectives: "calm, precise, useful, restrained, trustworthy",
    primary: "#2563eb",
    background: "#ffffff",
    surface: "#f5f5f7",
    text: "#111111",
    success: "#22c55e",
    error: "#ef4444",
    displayFont: "SF Pro Display",
    bodyFont: "SF Pro Text",
    monoFont: "SF Mono",
    colorMode: "Light",
    designNotes:
      "Use a clean, minimal layout influenced by Jony Ive and Dieter Rams. Generous spacing, soft cards, subtle borders, rounded corners, clear information hierarchy.",
  },
  contextTools: {
    docIngestion: false,
    docIngestionTool: "markitdown",
    docIngestionCustom: "",
    codebaseGraph: false,
    codebaseGraphTool: "auto",
    codebaseGraphCustom: "",
    mermaidValidation: false,
    markdownLinting: false,
    lintTool: "markdownlint",
    lintCustom: "",
    tokenBudget: false,
    compactInstructions: false,
  },
  agent: {
    role: "Senior full-stack product engineer",
    principles:
      "Plan before coding. Keep every change scoped and testable. Build the MVP first before adding advanced integrations. Use strongly typed code, reusable components, and validation for all imported data. Verify each feature before moving to the next build phase.",
    verificationCommands: "npm run lint\nnpm run typecheck\nnpm run test\nnpm run build",
    definitionOfDone:
      "The app runs locally without errors and delivers the MVP. All core pages are responsive, readable, and aligned with the design system. Code passes linting, type checking, unit tests, and a production build.",
  },
  mermaid: {
    code: `flowchart TD
  A[Input or trigger] --> B[Validate input]
  B --> C[Core processing]
  C --> D[Persist or output results]
  D --> E[Log and verify success]`,
  },
}
