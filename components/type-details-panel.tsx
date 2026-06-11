"use client"

import type {
  ApiEndpoint,
  TypeDetails,
  ScriptTypeDetails,
  TerraformTypeDetails,
  ApiServiceTypeDetails,
  CliTypeDetails,
  AutomationTypeDetails,
  DesktopTypeDetails,
  DesktopFramework,
} from "@/lib/types"
import { DESKTOP_FRAMEWORK_OPTIONS, desktopProfile } from "@/lib/desktop-frameworks"
import { TextField, AreaField, Field } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X } from "lucide-react"

const EMPTY_SCRIPT: ScriptTypeDetails = {
  runtime: "",
  osTarget: "",
  dependencies: "",
  arguments: "",
  configFile: "",
  inputFormat: "",
  outputFormat: "",
  logging: "",
  errorHandling: "",
  scheduling: "",
  envVars: "",
  secretsHandling: "",
  retryBehavior: "",
  monitoring: "",
  packaging: "",
  productionReadiness: "",
}

const EMPTY_TERRAFORM: TerraformTypeDetails = {
  cloudProvider: "",
  modules: "",
  stateHandling: "",
  environments: "",
  policyChecks: "",
  secretsHandling: "",
  deploymentWorkflow: "",
  driftManagement: "",
  complianceRules: "",
  backendStorage: "",
}

const EMPTY_API: ApiServiceTypeDetails = {
  runtime: "",
  framework: "",
  endpoints: [],
  authentication: "",
  rateLimiting: "",
  inputFormat: "",
  outputFormat: "",
  logging: "",
  errorHandling: "",
}

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]

const EMPTY_ENDPOINT: ApiEndpoint = {
  method: "GET",
  path: "",
  request: "",
  response: "",
  auth: "",
}

const EMPTY_CLI: CliTypeDetails = {
  language: "",
  packageManager: "",
  commands: "",
  arguments: "",
  configFile: "",
  outputFormat: "",
  platformCompatibility: "",
}

const EMPTY_DESKTOP: DesktopTypeDetails = {
  framework: "electron",
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
}

const EMPTY_AUTOMATION: AutomationTypeDetails = {
  runtime: "",
  schedule: "",
  trigger: "",
  dependencies: "",
  logging: "",
  errorHandling: "",
  alerting: "",
  secretsHandling: "",
}

export function defaultTypeDetails(kind: TypeDetails["kind"]): TypeDetails {
  switch (kind) {
    case "python-script":
    case "bash-script":
    case "powershell-script":
      return { kind, details: { ...EMPTY_SCRIPT } }
    case "terraform":
      return { kind, details: { ...EMPTY_TERRAFORM } }
    case "api-service":
      return { kind, details: { ...EMPTY_API } }
    case "cli-tool":
      return { kind, details: { ...EMPTY_CLI } }
    case "automation-cron":
      return { kind, details: { ...EMPTY_AUTOMATION } }
    case "desktop-application":
      return { kind, details: { ...EMPTY_DESKTOP } }
    default:
      return { kind: "full-application" }
  }
}

function ScriptFields({
  details,
  onChange,
}: {
  details: ScriptTypeDetails
  onChange: (d: ScriptTypeDetails) => void
}) {
  const set = (k: keyof ScriptTypeDetails) => (v: string) => onChange({ ...details, [k]: v })
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Runtime / Version" value={details.runtime} onChange={set("runtime")} placeholder="Python 3.12, Bash 5, PowerShell 7" />
        <TextField label="OS target" value={details.osTarget} onChange={set("osTarget")} placeholder="Linux, macOS, Windows, Cross-platform" />
      </div>
      <AreaField label="Dependencies" value={details.dependencies} onChange={set("dependencies")} placeholder="One per line — requests, pandas, openpyxl" rows={3} />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Arguments / Parameters" value={details.arguments} onChange={set("arguments")} placeholder="--input data.csv --output report.json" />
        <TextField label="Config file" value={details.configFile} onChange={set("configFile")} placeholder="config.yaml, .env" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Input format" value={details.inputFormat} onChange={set("inputFormat")} placeholder="CSV, JSON, stdin, file path" />
        <TextField label="Output format" value={details.outputFormat} onChange={set("outputFormat")} placeholder="JSON, CSV, stdout, file" />
      </div>
      <AreaField label="Environment variables" value={details.envVars} onChange={set("envVars")} placeholder="One per line — DB_HOST, API_KEY, LOG_LEVEL" rows={3} />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Secrets handling" value={details.secretsHandling} onChange={set("secretsHandling")} placeholder="Vault, AWS Secrets Manager, env vars" />
        <TextField label="Retry behavior" value={details.retryBehavior} onChange={set("retryBehavior")} placeholder="3 retries with exponential backoff" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Logging" value={details.logging} onChange={set("logging")} placeholder="stdout, file, structured JSON" />
        <TextField label="Error handling" value={details.errorHandling} onChange={set("errorHandling")} placeholder="try/catch with exit codes, retry logic" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Monitoring" value={details.monitoring} onChange={set("monitoring")} placeholder="CloudWatch, Prometheus, Datadog" />
        <TextField label="Packaging" value={details.packaging} onChange={set("packaging")} placeholder="Docker, pip package, standalone binary" />
      </div>
      <AreaField label="Scheduling / Triggers" value={details.scheduling} onChange={set("scheduling")} placeholder="Cron expression, manual, file watcher, event trigger" rows={2} />
      <AreaField label="Production readiness" value={details.productionReadiness} onChange={set("productionReadiness")} placeholder="Requirements for production deployment — health checks, graceful shutdown, etc." rows={3} />
    </div>
  )
}

function TerraformFields({
  details,
  onChange,
}: {
  details: TerraformTypeDetails
  onChange: (d: TerraformTypeDetails) => void
}) {
  const set = (k: keyof TerraformTypeDetails) => (v: string) => onChange({ ...details, [k]: v })
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Cloud / Provider" value={details.cloudProvider} onChange={set("cloudProvider")} placeholder="AWS, Azure, GCP, Multi-cloud" />
        <TextField label="Backend / State storage" value={details.backendStorage} onChange={set("backendStorage")} placeholder="S3 + DynamoDB, Terraform Cloud, Azure Blob" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="State handling" value={details.stateHandling} onChange={set("stateHandling")} placeholder="Remote state with locking, local for dev" />
        <TextField label="Secrets handling" value={details.secretsHandling} onChange={set("secretsHandling")} placeholder="Vault, AWS Secrets Manager, SSM Parameter Store" />
      </div>
      <AreaField label="Modules" value={details.modules} onChange={set("modules")} placeholder="One per line — VPC, ECS cluster, RDS instance, S3 bucket" rows={3} />
      <AreaField label="Environments" value={details.environments} onChange={set("environments")} placeholder="dev, staging, production" rows={2} />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Policy / Security checks" value={details.policyChecks} onChange={set("policyChecks")} placeholder="Sentinel, OPA, Checkov, tfsec" />
        <TextField label="Compliance rules" value={details.complianceRules} onChange={set("complianceRules")} placeholder="SOC2, HIPAA, CIS benchmarks" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Deployment workflow" value={details.deploymentWorkflow} onChange={set("deploymentWorkflow")} placeholder="GitHub Actions → terraform plan → manual approve → apply" />
        <TextField label="Drift / Change management" value={details.driftManagement} onChange={set("driftManagement")} placeholder="Daily drift detection, automated remediation" />
      </div>
    </div>
  )
}

function ApiServiceFields({
  details,
  onChange,
}: {
  details: ApiServiceTypeDetails
  onChange: (d: ApiServiceTypeDetails) => void
}) {
  const set = (k: Exclude<keyof ApiServiceTypeDetails, "endpoints">) => (v: string) =>
    onChange({ ...details, [k]: v })
  const addEndpoint = () =>
    onChange({ ...details, endpoints: [...details.endpoints, { ...EMPTY_ENDPOINT }] })
  const updateEndpoint = (index: number, patch: Partial<ApiEndpoint>) => {
    const endpoints = [...details.endpoints]
    endpoints[index] = { ...endpoints[index], ...patch }
    onChange({ ...details, endpoints })
  }
  const removeEndpoint = (index: number) => {
    onChange({ ...details, endpoints: details.endpoints.filter((_, i) => i !== index) })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Runtime" value={details.runtime} onChange={set("runtime")} placeholder="Node.js 20, Python 3.12, Go 1.22" />
        <TextField label="Framework" value={details.framework} onChange={set("framework")} placeholder="FastAPI, Express, Gin, Axum" />
      </div>
      <Field
        label="API endpoint contracts"
        hint="Add one row per endpoint. Request/response can reference data-model.md payload names or short inline shapes."
      >
        <div className="flex flex-col gap-3">
          {details.endpoints.map((endpoint, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr_auto]">
                <Select
                  value={endpoint.method || "GET"}
                  onValueChange={(method) => method != null && updateEndpoint(index, { method })}
                >
                  <SelectTrigger className="h-9 rounded-lg bg-background/80" aria-label={`Endpoint ${index + 1} method`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HTTP_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={endpoint.path}
                  onChange={(e) => updateEndpoint(index, { path: e.target.value })}
                  placeholder="/api/resource"
                  aria-label={`Endpoint ${index + 1} path`}
                  className="h-9 rounded-lg bg-background/80"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove endpoint ${index + 1}`}
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEndpoint(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Input
                  value={endpoint.request}
                  onChange={(e) => updateEndpoint(index, { request: e.target.value })}
                  placeholder="Request payload / params"
                  aria-label={`Endpoint ${index + 1} request`}
                  className="h-8 rounded-lg border-border/60 bg-background/80 text-xs"
                />
                <Input
                  value={endpoint.response}
                  onChange={(e) => updateEndpoint(index, { response: e.target.value })}
                  placeholder="Response payload"
                  aria-label={`Endpoint ${index + 1} response`}
                  className="h-8 rounded-lg border-border/60 bg-background/80 text-xs"
                />
                <Input
                  value={endpoint.auth}
                  onChange={(e) => updateEndpoint(index, { auth: e.target.value })}
                  placeholder="Auth requirement"
                  aria-label={`Endpoint ${index + 1} auth`}
                  className="h-8 rounded-lg border-border/60 bg-background/80 text-xs"
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addEndpoint} className="w-fit rounded-xl bg-transparent">
            <Plus className="mr-1 h-4 w-4" /> Add endpoint
          </Button>
        </div>
      </Field>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Authentication" value={details.authentication} onChange={set("authentication")} placeholder="API key, JWT, OAuth2" />
        <TextField label="Rate limiting" value={details.rateLimiting} onChange={set("rateLimiting")} placeholder="100 req/min per IP" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Input format" value={details.inputFormat} onChange={set("inputFormat")} placeholder="JSON body, form-data, query params" />
        <TextField label="Output format" value={details.outputFormat} onChange={set("outputFormat")} placeholder="JSON, XML, protobuf" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Logging" value={details.logging} onChange={set("logging")} placeholder="Structured JSON, stdout" />
        <TextField label="Error handling" value={details.errorHandling} onChange={set("errorHandling")} placeholder="HTTP status codes, error envelope" />
      </div>
    </div>
  )
}

function CliFields({
  details,
  onChange,
}: {
  details: CliTypeDetails
  onChange: (d: CliTypeDetails) => void
}) {
  const set = (k: keyof CliTypeDetails) => (v: string) => onChange({ ...details, [k]: v })
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Language" value={details.language} onChange={set("language")} placeholder="TypeScript, Rust, Go, Python" />
        <TextField label="Package manager" value={details.packageManager} onChange={set("packageManager")} placeholder="npm, cargo, pip, brew" />
      </div>
      <AreaField label="Commands" value={details.commands} onChange={set("commands")} placeholder="One per line — init, build, deploy, status" rows={3} />
      <TextField label="Arguments / Flags" value={details.arguments} onChange={set("arguments")} placeholder="--verbose, --config path, --output json" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Config file" value={details.configFile} onChange={set("configFile")} placeholder=".clirc, config.toml" />
        <TextField label="Output format" value={details.outputFormat} onChange={set("outputFormat")} placeholder="Table, JSON, plain text" />
      </div>
      <TextField label="Platform compatibility" value={details.platformCompatibility} onChange={set("platformCompatibility")} placeholder="Linux, macOS, Windows, Cross-platform" />
    </div>
  )
}

function AutomationFields({
  details,
  onChange,
}: {
  details: AutomationTypeDetails
  onChange: (d: AutomationTypeDetails) => void
}) {
  const set = (k: keyof AutomationTypeDetails) => (v: string) => onChange({ ...details, [k]: v })
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Runtime" value={details.runtime} onChange={set("runtime")} placeholder="Python 3.12, Node.js 20, Bash" />
        <TextField label="Schedule" value={details.schedule} onChange={set("schedule")} placeholder="*/5 * * * *, daily at 2am" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Trigger" value={details.trigger} onChange={set("trigger")} placeholder="Cron, webhook, file change, event" />
        <TextField label="Alerting" value={details.alerting} onChange={set("alerting")} placeholder="Email, Slack, PagerDuty" />
      </div>
      <AreaField label="Dependencies" value={details.dependencies} onChange={set("dependencies")} placeholder="One per line — boto3, requests, pandas" rows={3} />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Logging" value={details.logging} onChange={set("logging")} placeholder="CloudWatch, file, structured JSON" />
        <TextField label="Error handling" value={details.errorHandling} onChange={set("errorHandling")} placeholder="Retry 3x, alert on failure" />
      </div>
      <TextField label="Secrets handling" value={details.secretsHandling} onChange={set("secretsHandling")} placeholder="Vault, AWS Secrets Manager, env vars" />
    </div>
  )
}

function DesktopFields({
  details,
  onChange,
}: {
  details: DesktopTypeDetails
  onChange: (d: DesktopTypeDetails) => void
}) {
  const set = (k: Exclude<keyof DesktopTypeDetails, "framework">) => (v: string) =>
    onChange({ ...details, [k]: v })
  const profile = desktopProfile(details.framework)
  return (
    <div className="flex flex-col gap-5">
      <Field
        label="Desktop framework"
        hint="Drives the generated build, packaging, security, and folder-structure guidance."
      >
        <Select
          value={details.framework}
          onValueChange={(framework) =>
            framework != null && onChange({ ...details, framework: framework as DesktopFramework })
          }
        >
          <SelectTrigger className="h-9 w-full rounded-lg bg-background/80 md:w-72" aria-label="Desktop framework">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DESKTOP_FRAMEWORK_OPTIONS.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Language" value={details.language} onChange={set("language")} placeholder={profile.language} />
        <TextField label="UI toolkit" value={details.uiToolkit} onChange={set("uiToolkit")} placeholder={profile.uiToolkit} />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Target OS" value={details.targetOS} onChange={set("targetOS")} placeholder="Windows, macOS, Linux" />
        <TextField label="Build tool" value={details.buildTool} onChange={set("buildTool")} placeholder={profile.buildTool} />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Packaging / installer" value={details.packaging} onChange={set("packaging")} placeholder={profile.packaging} />
        <TextField label="Code signing" value={details.codeSigning} onChange={set("codeSigning")} placeholder="EV certificate (Windows), Developer ID (macOS)" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Auto-update" value={details.autoUpdate} onChange={set("autoUpdate")} placeholder={profile.updater} />
        <TextField label="Local data storage" value={details.dataStorage} onChange={set("dataStorage")} placeholder={profile.dataStorage} />
      </div>
      <AreaField
        label="Native integrations"
        value={details.nativeIntegrations}
        onChange={set("nativeIntegrations")}
        placeholder="One per line — tray icon, notifications, file associations, deep links, global shortcuts"
        rows={3}
      />
      <TextField label="Distribution" value={details.distribution} onChange={set("distribution")} placeholder={profile.distribution} />
    </div>
  )
}

export function TypeDetailsPanel({
  value,
  onChange,
}: {
  value: TypeDetails
  onChange: (d: TypeDetails) => void
}) {
  switch (value.kind) {
    case "python-script":
    case "bash-script":
    case "powershell-script":
      return (
        <ScriptFields
          details={value.details}
          onChange={(d) => onChange({ kind: value.kind, details: d })}
        />
      )
    case "terraform":
      return (
        <TerraformFields
          details={value.details}
          onChange={(d) => onChange({ kind: "terraform", details: d })}
        />
      )
    case "api-service":
      return (
        <ApiServiceFields
          details={value.details}
          onChange={(d) => onChange({ kind: "api-service", details: d })}
        />
      )
    case "cli-tool":
      return (
        <CliFields
          details={value.details}
          onChange={(d) => onChange({ kind: "cli-tool", details: d })}
        />
      )
    case "automation-cron":
      return (
        <AutomationFields
          details={value.details}
          onChange={(d) => onChange({ kind: "automation-cron", details: d })}
        />
      )
    case "desktop-application":
      return (
        <DesktopFields
          details={value.details}
          onChange={(d) => onChange({ kind: "desktop-application", details: d })}
        />
      )
    case "full-application":
    default:
      return null
  }
}
