"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataModelProfile = dataModelProfile;
exports.starterDiagram = starterDiagram;
exports.packManifest = packManifest;
exports.generateFiles = generateFiles;
const types_1 = require("./types");
const desktop_frameworks_1 = require("./desktop-frameworks");
const stack_options_1 = require("./stack-options");
const context_tools_1 = require("./context-tools");
function listFromText(text) {
    return text
        .split("\n")
        .map((l) => l.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean);
}
function mdList(items, fallback = "_None specified yet._") {
    if (items.length === 0)
        return fallback;
    return items.map((i) => `- ${i}`).join("\n");
}
function val(v, fallback = "_TBD_") {
    return v.trim() ? v.trim() : fallback;
}
// User text placed inside a markdown table cell must not break the row.
function cell(v, fallback = "_—_") {
    const t = v.trim();
    if (!t)
        return fallback;
    return t.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
}
function techLabel(selected) {
    if (selected.length === 0)
        return "_None selected_";
    return selected
        .map((t) => (t.config ? `${t.label} (${t.config})` : t.label))
        .join(", ");
}
function getSelectedForCategory(selected, categoryId) {
    const optionIds = new Set((stack_options_1.TECH_OPTIONS[categoryId] ?? []).map((o) => o.id));
    return selected.filter((t) => optionIds.has(t.techId));
}
function mermaidBlock(code) {
    const trimmed = code.trim();
    if (!trimmed)
        return "_No diagram provided yet. Add one in the Mermaid Editor step._";
    return `\`\`\`mermaid\n${trimmed}\n\`\`\``;
}
function projectTypeLabel(kind) {
    const labels = {
        "full-application": "Full Application",
        "desktop-application": "Desktop Application",
        "python-script": "Python Script",
        "bash-script": "Bash Script",
        "powershell-script": "PowerShell Script",
        "terraform": "Terraform / IaC",
        "cli-tool": "CLI Tool",
        "automation-cron": "Automation / Cron",
        "api-service": "API Service",
    };
    return labels[kind] ?? kind;
}
function typeNounPhrase(kind) {
    const phrases = {
        "full-application": "a full application",
        "desktop-application": "a desktop application",
        "python-script": "a Python script",
        "bash-script": "a Bash script",
        "powershell-script": "a PowerShell script",
        "terraform": "a Terraform / Infrastructure-as-Code project",
        "cli-tool": "a command-line tool",
        "automation-cron": "an automation / cron job",
        "api-service": "an API service",
    };
    return phrases[kind];
}
// Reads an optional field off whichever type-details shape is active.
function detailProp(td, key) {
    if (td.kind === "full-application")
        return "";
    const d = td.details;
    return d[key] ?? "";
}
// Stack categories that matter for a project type. Categories with selections
// are always shown; these are additionally shown (as "_None selected_") so the
// agent knows a decision is still open — without UI noise in script packs.
const RELEVANT_CATEGORIES = {
    "full-application": ["frontend", "backend", "database", "orm", "auth", "validation", "testing", "deployment"],
    "desktop-application": ["frontend", "database", "orm", "validation", "testing", "deployment"],
    "api-service": ["backend", "database", "orm", "auth", "validation", "testing", "deployment"],
    "python-script": ["validation", "testing", "automation"],
    "bash-script": ["testing", "automation"],
    "powershell-script": ["testing", "automation"],
    "terraform": ["testing", "deployment", "automation"],
    "cli-tool": ["validation", "testing", "deployment"],
    "automation-cron": ["validation", "testing", "deployment", "automation"],
};
// Intro prose is framing, not facts — omit it when compact instructions are on.
function intro(s, text) {
    return s.contextTools?.compactInstructions ? "" : `${text}\n\n`;
}
function graphToolForType(kind, profile) {
    switch (kind) {
        case "desktop-application":
            return profile ? `${profile.graphTool}` : "madge / dependency-cruiser, or framework-native tooling";
        case "terraform":
            return "`terraform graph | dot -Tsvg > graph.svg`";
        case "python-script":
        case "automation-cron":
            return "`pydeps src --max-bacon 2` (or Graphify — https://graphify.net)";
        case "bash-script":
        case "powershell-script":
        case "cli-tool":
            return "Graphify (https://graphify.net), or a short manual module map — small codebases rarely need a generated graph";
        default:
            return "`npx madge --image graph.svg src/` or `npx dependency-cruiser src` (or Graphify — https://graphify.net)";
    }
}
// Renders the user-selected tool as "label (url; `command`)" with graceful gaps.
function toolMeta(t) {
    const parts = [t.url, t.command ? `\`${t.command}\`` : ""].filter(Boolean);
    return parts.length ? ` (${parts.join("; ")})` : "";
}
function graphToolText(s) {
    const ct = s.contextTools;
    const profile = (0, desktop_frameworks_1.profileFromTypeDetails)(s.idea.typeDetails);
    if (!ct)
        return graphToolForType(s.idea.typeDetails.kind, profile);
    const t = (0, context_tools_1.resolveContextTool)(context_tools_1.GRAPH_TOOLS, ct.codebaseGraphTool ?? "auto", ct.codebaseGraphCustom ?? "");
    if (t.id === "auto")
        return graphToolForType(s.idea.typeDetails.kind, profile);
    return `${t.label}${toolMeta(t)}`;
}
function langProfile(kind, profile) {
    switch (kind) {
        case "desktop-application":
            return {
                typing: [
                    profile?.typing ?? "Use the strongest typing the chosen framework's language offers; no untyped public surfaces.",
                    "Prefer pure, testable functions for business logic; isolate UI and OS integration at the edges.",
                ],
                naming: [
                    profile?.naming ?? "Follow the chosen framework's standard naming idiom consistently.",
                    "Keep one logical unit (component, class, module) per file.",
                ],
                minimumChecks: [],
            };
        case "python-script":
        case "automation-cron":
            return {
                typing: [
                    "Use type hints on all public functions; keep mypy (or pyright) clean.",
                    "Model structured data with dataclasses or Pydantic models, not bare dicts.",
                    "Prefer pure, testable functions; isolate side effects (I/O, network) at the edges.",
                ],
                naming: [
                    "snake_case for modules, functions, and variables; PascalCase for classes.",
                    "Keep the entry point thin: argument parsing and wiring only.",
                    "One module per responsibility.",
                ],
                minimumChecks: ["ruff check .", "mypy .", "pytest"],
            };
        case "bash-script":
            return {
                typing: [
                    "Start every script with `set -euo pipefail`.",
                    "Quote all variable expansions; use arrays for lists, never word-splitting.",
                    "Return status via exit codes, not global state.",
                ],
                naming: [
                    "kebab-case for script files; lower_snake_case for functions and variables.",
                    "Entry scripts in `bin/`, shared helpers in `lib/`.",
                ],
                minimumChecks: ["shellcheck **/*.sh", "bash -n <script>"],
            };
        case "powershell-script":
            return {
                typing: [
                    "Use `[CmdletBinding()]` and typed parameters with validation attributes.",
                    "Support `-WhatIf` / `-Confirm` for destructive operations.",
                    "Set `$ErrorActionPreference = 'Stop'` and try/catch around external calls.",
                ],
                naming: [
                    "Approved Verb-Noun function names (Get-, Set-, New-, Remove-).",
                    "PascalCase parameters; one exported function per public concern.",
                ],
                minimumChecks: ["Invoke-ScriptAnalyzer -Path .", "Invoke-Pester"],
            };
        case "terraform":
            return {
                typing: [
                    "Declare a type for every variable; mark sensitive values with `sensitive = true`.",
                    "Pin provider and module versions explicitly.",
                    "No hardcoded secrets, account IDs, or region literals — use variables.",
                ],
                naming: [
                    "snake_case for resources, variables, and outputs.",
                    "One module per concern; standard files: `main.tf`, `variables.tf`, `outputs.tf`.",
                ],
                minimumChecks: ["terraform fmt -check", "terraform validate", "terraform plan"],
            };
        case "cli-tool":
            return {
                typing: [
                    "Use the strongest typing the chosen language offers; no untyped public surfaces.",
                    "Model commands and flags as typed structures, not string maps.",
                    "Prefer pure, testable functions for command logic; isolate terminal I/O.",
                ],
                naming: [
                    "Follow the chosen language's standard naming idiom consistently.",
                    "Command entry points stay thin; logic lives in importable modules.",
                ],
                minimumChecks: [],
            };
        default: // full-application, api-service
            return {
                typing: [
                    "Use strongly typed code; avoid `any` / untyped values.",
                    "Model domain data with explicit types or schemas; no loose object shapes at module boundaries.",
                    "Prefer pure, testable functions for business logic.",
                ],
                naming: [
                    "kebab-case for files and directories.",
                    "Name files after the single thing they export.",
                    "Keep one logical unit (component, module, schema) per file.",
                ],
                minimumChecks: [],
            };
    }
}
function dataModelProfile(kind) {
    switch (kind) {
        case "desktop-application":
            return {
                fileIntro: "Application entity, local-storage, and settings contracts.",
                entityNoun: "entity or local record",
                entityHeading: "Entities & Local Records",
                fieldsLabel: "Field",
                emptyDirective: "Define entities, settings, and local-storage records before persisting data; the agent must not invent schemas.",
                showErDiagram: true,
            };
        case "api-service":
            return {
                fileIntro: "API resource, payload, and response contracts.",
                entityNoun: "resource or payload",
                entityHeading: "Resources & Payloads",
                fieldsLabel: "Field",
                emptyDirective: "Define request and response payload shapes before implementing endpoints; the agent must not invent API schemas.",
                showErDiagram: true,
            };
        case "python-script":
        case "bash-script":
        case "powershell-script":
            return {
                fileIntro: "Script input, output, and intermediate record shapes.",
                entityNoun: "data shape",
                entityHeading: "Data Shapes (Input / Output)",
                fieldsLabel: "Field / Variable",
                emptyDirective: "Define input and output record shapes before parsing, transforming, or writing data; the agent must not invent schemas.",
                showErDiagram: false,
            };
        case "automation-cron":
            return {
                fileIntro: "Automation input, output, state, and recovery data shapes.",
                entityNoun: "data shape or state record",
                entityHeading: "Data Shapes & State",
                fieldsLabel: "Field / Variable",
                emptyDirective: "Define trigger input, job state, and output records before implementing the automation; the agent must not invent schemas.",
                showErDiagram: false,
            };
        case "terraform":
            return {
                fileIntro: "Terraform module variables, outputs, and state-facing contracts.",
                entityNoun: "module input or output",
                entityHeading: "Module Inputs & Outputs",
                fieldsLabel: "Variable / Output",
                emptyDirective: "List module variables and outputs before creating resources; the agent must not invent infrastructure contracts.",
                showErDiagram: false,
            };
        case "cli-tool":
            return {
                fileIntro: "CLI config, command input, and output schemas.",
                entityNoun: "config or output schema",
                entityHeading: "Config & Output Schemas",
                fieldsLabel: "Field / Flag",
                emptyDirective: "Define config, flag, and output schemas before implementing commands; the agent must not invent CLI contracts.",
                showErDiagram: false,
            };
        default:
            return {
                fileIntro: "Application entity, state, and payload contracts.",
                entityNoun: "entity",
                entityHeading: "Entities",
                fieldsLabel: "Field",
                emptyDirective: "Define entities, state, or payloads before persisting data; the agent must not invent schemas.",
                showErDiagram: true,
            };
    }
}
function parseRiskLine(line) {
    const match = line.match(/\s(\u2014|--|-)\s/);
    if (!match || match.index === undefined) {
        return { risk: line.trim(), mitigation: "_To be confirmed during implementation._" };
    }
    return {
        risk: line.slice(0, match.index).trim(),
        mitigation: line.slice(match.index + match[0].length).trim() || "_To be confirmed during implementation._",
    };
}
function riskItems(text) {
    return listFromText(text).map(parseRiskLine).filter((r) => r.risk);
}
function hasDataModel(s) {
    return s.dataModel.entities.some((entity) => entity.name.trim() || entity.description.trim() || entity.fields.some((field) => field.name.trim()));
}
function endpointRows(endpoints, fallback) {
    const rows = endpoints.filter((endpoint) => endpoint.method.trim() || endpoint.path.trim());
    if (!rows.length)
        return fallback;
    return rows
        .map((endpoint) => `| ${cell(endpoint.method, "_TBD_")} | ${cell(endpoint.path, "_TBD_")} | ${cell(endpoint.request, "_TBD_")} | ${cell(endpoint.response, "_TBD_")} | ${cell(endpoint.auth, "_TBD_")} |`)
        .join("\n");
}
function relevantStackOpenDecisions(s) {
    const relevant = new Set(RELEVANT_CATEGORIES[s.idea.typeDetails.kind]);
    return stack_options_1.STACK_CATEGORIES
        .filter((cat) => cat.id !== "other" && relevant.has(cat.id))
        .filter((cat) => getSelectedForCategory(s.stack.selected, cat.id).length === 0)
        .map((cat) => `Choose ${cat.label} for this ${projectTypeLabel(s.idea.typeDetails.kind)}.`);
}
function hasProjectConfig(s) {
    const td = s.idea.typeDetails;
    if (td.kind === "full-application" || td.kind === "api-service") {
        return s.stack.configVariables.some((v) => v.name.trim()) || s.stack.configNotes.trim().length > 0;
    }
    if (td.kind === "terraform") {
        return Boolean(td.details.backendStorage.trim() ||
            td.details.stateHandling.trim() ||
            td.details.environments.trim() ||
            td.details.secretsHandling.trim() ||
            td.details.policyChecks.trim());
    }
    if (td.kind === "cli-tool") {
        return Boolean(td.details.configFile.trim() ||
            td.details.arguments.trim() ||
            td.details.outputFormat.trim() ||
            td.details.packageManager.trim() ||
            td.details.platformCompatibility.trim());
    }
    if (td.kind === "automation-cron") {
        return Boolean(td.details.schedule.trim() ||
            td.details.trigger.trim() ||
            td.details.secretsHandling.trim() ||
            td.details.alerting.trim() ||
            td.details.logging.trim());
    }
    return Boolean(td.details.envVars.trim() ||
        td.details.configFile.trim() ||
        td.details.secretsHandling.trim() ||
        td.details.logging.trim() ||
        td.details.retryBehavior.trim() ||
        td.details.packaging.trim());
}
function apiEndpoints(s) {
    return s.idea.typeDetails.kind === "api-service" ? s.idea.typeDetails.details.endpoints : [];
}
function openDecisionItems(s) {
    const profile = dataModelProfile(s.idea.typeDetails.kind);
    const decisions = [
        ...relevantStackOpenDecisions(s),
        ...(!hasDataModel(s) ? [`Define or explicitly defer ${profile.entityNoun} contracts in data-model.md.`] : []),
        ...(!hasProjectConfig(s) ? ["Define or explicitly defer project configuration in architecture.md."] : []),
        ...(s.idea.typeDetails.kind === "api-service" && apiEndpoints(s).filter((endpoint) => endpoint.method.trim() || endpoint.path.trim()).length === 0
            ? ["Define API endpoint contracts before implementing request handlers."]
            : []),
        ...(listFromText(s.idea.successCriteria).length === 0 ? ["Define measurable success criteria before implementation starts."] : []),
        ...(s.features.mvpFeatures.some((f) => f.name.trim()) ? [] : ["Define at least one MVP feature before feature implementation."]),
    ];
    return decisions;
}
function openDecisionsMarkdown(s, fallback = "_No blocking open decisions detected._") {
    return mdList(openDecisionItems(s), fallback);
}
function configRow(name, required, source, defaultValue, visibility, usedBy, notes) {
    return `| ${cell(name, "_TBD_")} | ${cell(required, "_TBD_")} | ${cell(source, "_TBD_")} | ${cell(defaultValue, "_None_")} | ${cell(visibility, "_TBD_")} | ${cell(usedBy, "_TBD_")} | ${cell(notes, "_—_")} |`;
}
function stackConfigRows(vars) {
    const rows = vars.filter((v) => v.name.trim());
    if (!rows.length) {
        return "| _No configuration variables defined_ | _TBD_ | _TBD_ | _None_ | _TBD_ | _TBD_ | _Add variables in the Stack step or explicitly defer._ |";
    }
    return rows
        .map((v) => configRow(v.name, v.required ? "Yes" : "No", v.source, v.defaultValue, v.visibility, v.usedBy, v.notes))
        .join("\n");
}
function configurationRows(s) {
    const td = s.idea.typeDetails;
    switch (td.kind) {
        case "full-application":
        case "api-service":
            return stackConfigRows(s.stack.configVariables);
        case "desktop-application":
            return [
                configRow("Settings / data location", "Yes", "OS app-data directory", td.details.dataStorage, "internal", "Persistence layer", "Define the settings schema before writing it."),
                configRow("Packaging targets", "Yes", "Build pipeline", td.details.packaging, "internal", "Release process", td.details.buildTool),
                configRow("Code signing", "Yes", "CI secrets / certificate store", td.details.codeSigning, "secret", "Installers and updates", "Signing certificates are secrets; never commit them."),
                configRow("Auto-update channel", "No", "Update server / store", td.details.autoUpdate, "internal", "Updater", "Updates must be signed and served over HTTPS."),
            ].join("\n");
        case "terraform":
            return [
                configRow("Backend / state storage", "Yes", "Terraform backend", td.details.backendStorage, "internal", "Terraform state", td.details.stateHandling),
                configRow("Environments", "Yes", "Workspace / tfvars", td.details.environments, "internal", "Deployment workflow", "Define dev/staging/prod before apply."),
                configRow("Secrets handling", "Yes", "Secrets manager", "", "secret", "Providers and modules", td.details.secretsHandling),
                configRow("Policy checks", "Yes", "CI / local tooling", td.details.policyChecks, "internal", "Plan review", td.details.complianceRules),
            ].join("\n");
        case "cli-tool":
            return [
                configRow("Arguments / flags", "Yes", "CLI input", td.details.arguments, "public", "Command dispatcher", "Document every flag in help output."),
                configRow("Config file", "No", "File system", td.details.configFile, "internal", "Runtime config", "Define precedence between defaults, config file, env, and flags."),
                configRow("Output format", "Yes", "CLI option / default", td.details.outputFormat, "public", "Renderer", "Machine-readable formats must stay stable."),
                configRow("Package manager", "Yes", "Distribution", td.details.packageManager, "public", "Install and upgrade", td.details.platformCompatibility),
            ].join("\n");
        case "automation-cron":
            return [
                configRow("Schedule", "Yes", "Scheduler", td.details.schedule, "internal", "Job trigger", td.details.trigger),
                configRow("Secrets handling", "Yes", "Secrets manager / env", "", "secret", "External service access", td.details.secretsHandling),
                configRow("Alerting", "Yes", "Monitoring system", td.details.alerting, "internal", "Failure response", "Failures must alert a human."),
                configRow("Logging", "Yes", "Runtime", td.details.logging, "internal", "Operations", td.details.errorHandling),
            ].join("\n");
        default:
            return [
                configRow("Arguments / parameters", "Yes", "Invocation", td.details.arguments, "public", "Entry point", "Validate before use."),
                configRow("Config file", "No", "File system", td.details.configFile, "internal", "Runtime config", "Define defaults and missing-file behavior."),
                configRow("Environment variables", "No", "Environment", td.details.envVars, "secret", "External integrations", td.details.secretsHandling),
                configRow("Logging", "Yes", "Runtime", td.details.logging, "internal", "Operations", td.details.errorHandling),
                configRow("Retry behavior", "No", "Runtime policy", td.details.retryBehavior, "internal", "External calls", td.details.monitoring),
            ].join("\n");
    }
}
function configurationSection(s) {
    const notes = s.idea.typeDetails.kind === "full-application" || s.idea.typeDetails.kind === "api-service"
        ? s.stack.configNotes.trim()
        : "";
    return `## Configuration

| Name | Required | Source | Default | Visibility | Used By | Notes |
| --- | --- | --- | --- | --- | --- | --- |
${configurationRows(s)}

Rules:
- Read configuration only from the sources listed here.
- Treat every value marked secret as sensitive: never commit, print, or expose it.
- Update this table before adding a new environment variable, config file key, flag, tfvar, or scheduler setting.${notes ? `\n\nAdditional notes: ${notes}` : ""}`;
}
function securitySection(s) {
    const td = s.idea.typeDetails;
    let specific = [];
    switch (td.kind) {
        case "full-application":
            specific = [
                "Escape/encode all user-supplied content rendered in the UI (XSS).",
                "Decide the authentication story before building protected features; enforce authorization on the server, never only in the UI.",
                "If sessions are introduced, use HTTPS-only cookies and standard session hardening.",
            ];
            break;
        case "desktop-application":
            specific = [
                ...((0, desktop_frameworks_1.profileFromTypeDetails)(td)?.securityBullets ?? []),
                `Store local data in ${val(td.details.dataStorage, "the OS app-data directory")}; never in the install directory.`,
            ];
            break;
        case "api-service":
            specific = [
                `Enforce authentication on all non-public endpoints (${val(td.details.authentication, "method TBD — decide in Phase 0")}).`,
                `Enforce rate limiting (${val(td.details.rateLimiting, "limits TBD")}).`,
                "Return consistent error envelopes; never leak stack traces or internal identifiers.",
                "Use least-privilege database credentials.",
            ];
            break;
        case "terraform":
            specific = [
                `Encrypt and lock remote state (${val(td.details.backendStorage, "remote backend TBD")}).`,
                "Apply least-privilege IAM to both the pipeline and provisioned resources.",
                `Run policy/security scans in CI (${val(td.details.policyChecks, "e.g., Checkov or tfsec")}).`,
                "Mark sensitive variables `sensitive`; never store plaintext secrets in state or tfvars.",
            ];
            break;
        case "python-script":
        case "bash-script":
        case "powershell-script":
            specific = [
                `Load credentials via ${val(td.details.secretsHandling, "environment variables or a secrets manager")}; never hardcode them.`,
                "Run with the least privilege required; fail closed on permission errors.",
                "Never write secrets to logs or temp files; create temp files safely.",
                "Validate file paths and external input before acting on them.",
            ];
            break;
        case "automation-cron":
            specific = [
                `Load credentials via ${val(td.details.secretsHandling, "a secrets manager")}; never hardcode them.`,
                "Run with least-privilege credentials scoped to this task only.",
                "Never log secrets; redact sensitive fields in structured logs.",
                "Make the job idempotent so retries cannot corrupt state.",
            ];
            break;
        case "cli-tool":
            specific = [
                "Treat all argument, environment, and config input as untrusted; validate before use.",
                "Store tokens in the platform keychain or config files with restricted permissions.",
                "Never echo secrets to the terminal or logs.",
            ];
            break;
    }
    const common = [
        "Never commit secrets; load them from the environment or a secrets manager.",
        "Keep dependencies pinned; update them deliberately, not implicitly.",
    ];
    return `## Security Considerations
${mdList([...specific, ...common])}`;
}
function operationsSection(s) {
    const td = s.idea.typeDetails;
    const deployment = getSelectedForCategory(s.stack.selected, "deployment");
    const target = deployment.length ? techLabel(deployment) : "_TBD_";
    switch (td.kind) {
        case "desktop-application": {
            const p = (0, desktop_frameworks_1.desktopProfile)(td.details.framework);
            return `## Packaging & Operations
- Build: ${val(td.details.buildTool, p.buildTool)}
- Packaging: ${val(td.details.packaging, p.packaging)}
- Code signing: ${val(td.details.codeSigning, "_TBD — required for distribution on every OS._")}
- Auto-update: ${val(td.details.autoUpdate, p.updater)}
- Distribution: ${val(td.details.distribution, p.distribution)}
- Target OS: ${val(td.details.targetOS, "_TBD — define before the first release build._")}
- CI builds, signs, and verifies installers for every target OS; a release is the full set of signed artifacts.
- Capture crash reports (e.g. Sentry or framework-native reporting) before public release.`;
        }
        case "terraform":
            return `## Deployment & Operations
- Workflow: ${val(td.details.deploymentWorkflow, "plan → review → apply, automated in CI")}
- Environments: ${listFromText(td.details.environments).join(", ") || "_TBD — define environments before first apply._"}
- Drift management: ${val(td.details.driftManagement, "_TBD — schedule drift detection._")}
- Never apply without a reviewed plan.
- Recovery: keep the last reviewed plan and state backup available; document rollback or forward-fix steps for failed applies.`;
        case "python-script":
        case "bash-script":
        case "powershell-script":
            return `## Deployment & Operations
- Packaging: ${val(td.details.packaging, "_TBD — decide how the script is distributed._")}
- Scheduling / trigger: ${val(td.details.scheduling, "manual invocation")}
- Monitoring: ${val(td.details.monitoring, "_TBD — define how failures are noticed._")}
- Logging destination: ${val(td.details.logging, "stdout")}
- Write a short runbook in the README: how to run manually and how to safely re-run after a failure.
- Destructive actions need dry-run or confirmation behavior before production use.`;
        case "automation-cron":
            return `## Deployment & Operations
- Schedule: ${val(td.details.schedule, "_TBD_")} (trigger: ${val(td.details.trigger, "_TBD_")})
- Alerting: ${val(td.details.alerting, "_TBD — failures must alert a human somewhere._")}
- Logging destination: ${val(td.details.logging, "stdout")}
- The job must be idempotent and safe to re-run; document manual re-run and recovery steps in the README.
- Prevent overlapping runs with a lock, queue, or documented scheduler guarantee.`;
        case "api-service":
            return `## Deployment & Operations
- Target: ${target}
- Expose a health endpoint and wire it into deployment checks.
- Use structured logs (${val(td.details.logging, "JSON")}); monitor error rates and latency.
- Configuration via the Configuration table; no environment-specific code paths.
- Rollback: deploy with a reversible release process and verify health checks after rollback.`;
        case "cli-tool":
            return `## Distribution & Operations
- Distribution: ${val(td.details.packageManager, "_TBD — decide the install channel._")}
- Target platforms: ${val(td.details.platformCompatibility, "_TBD_")}
- Version the tool and expose it via \`--version\`; document install and upgrade in the README.`;
        default:
            return `## Deployment & Operations
- Target: ${target}
- Configuration via the Configuration table; never hardcode environment differences.
- The production build must pass locally before deploying.
- Use preview deployments for review when the platform supports them.
- Rollback: document how to restore the last known-good deployment.`;
    }
}
function typeDetailsSection(td) {
    switch (td.kind) {
        case "python-script":
        case "bash-script":
        case "powershell-script":
            return scriptDetailsSection(td.details, td.kind);
        case "terraform":
            return terraformDetailsSection(td.details);
        case "api-service":
            return apiDetailsSection(td.details);
        case "cli-tool":
            return cliDetailsSection(td.details);
        case "automation-cron":
            return automationDetailsSection(td.details);
        case "desktop-application":
            return desktopDetailsSection(td.details);
        default:
            return "";
    }
}
function desktopDetailsSection(d) {
    const p = (0, desktop_frameworks_1.desktopProfile)(d.framework);
    return `## Desktop Application Configuration

| Property | Value |
| --- | --- |
| Framework | ${cell(p.label)} |
| Language | ${cell(d.language, cell(p.language))} |
| UI Toolkit | ${cell(d.uiToolkit, cell(p.uiToolkit))} |
| Target OS | ${cell(d.targetOS, "_TBD_")} |
| Build Tool | ${cell(d.buildTool, cell(p.buildTool))} |
| Packaging | ${cell(d.packaging, cell(p.packaging))} |
| Code Signing | ${cell(d.codeSigning, "_TBD — required before distribution_")} |
| Auto-update | ${cell(d.autoUpdate, cell(p.updater))} |
| Data Storage | ${cell(d.dataStorage, cell(p.dataStorage))} |
| Distribution | ${cell(d.distribution, cell(p.distribution))} |

### Native Integrations
${d.nativeIntegrations.trim() ? mdList(listFromText(d.nativeIntegrations)) : "_None specified — consider tray icon, notifications, file associations, deep links, global shortcuts._"}

### Framework Conventions (${p.label})
${mdList(p.conventions)}`;
}
function scriptDetailsSection(d, kind) {
    return `## ${projectTypeLabel(kind)} Configuration

| Property | Value |
| --- | --- |
| Runtime | ${cell(d.runtime, "_TBD_")} |
| OS Target | ${cell(d.osTarget, "_TBD_")} |
| Arguments | ${cell(d.arguments, "_TBD_")} |
| Config File | ${cell(d.configFile, "_TBD_")} |
| Input Format | ${cell(d.inputFormat, "_TBD_")} |
| Output Format | ${cell(d.outputFormat, "_TBD_")} |
| Secrets Handling | ${cell(d.secretsHandling, "_TBD_")} |
| Retry Behavior | ${cell(d.retryBehavior, "_TBD_")} |
| Logging | ${cell(d.logging, "_TBD_")} |
| Error Handling | ${cell(d.errorHandling, "_TBD_")} |
| Monitoring | ${cell(d.monitoring, "_TBD_")} |
| Packaging | ${cell(d.packaging, "_TBD_")} |
| Scheduling | ${cell(d.scheduling, "_TBD_")} |

### Dependencies
${d.dependencies.trim() ? mdList(listFromText(d.dependencies)) : "_None specified._"}

### Environment Variables
${d.envVars.trim() ? mdList(listFromText(d.envVars)) : "_None specified._"}

### Production Readiness
${d.productionReadiness.trim() ? val(d.productionReadiness) : "_Not specified yet._"}`;
}
function terraformDetailsSection(d) {
    return `## Terraform Configuration

| Property | Value |
| --- | --- |
| Cloud Provider | ${cell(d.cloudProvider, "_TBD_")} |
| Backend / State Storage | ${cell(d.backendStorage, "_TBD_")} |
| State Handling | ${cell(d.stateHandling, "_TBD_")} |
| Policy Checks | ${cell(d.policyChecks, "_TBD_")} |
| Compliance Rules | ${cell(d.complianceRules, "_TBD_")} |
| Secrets Handling | ${cell(d.secretsHandling, "_TBD_")} |
| Deployment Workflow | ${cell(d.deploymentWorkflow, "_TBD_")} |
| Drift / Change Management | ${cell(d.driftManagement, "_TBD_")} |

### Modules
${d.modules.trim() ? mdList(listFromText(d.modules)) : "_None specified._"}

### Environments
${d.environments.trim() ? mdList(listFromText(d.environments)) : "_None specified._"}`;
}
function apiDetailsSection(d) {
    return `## API Service Configuration

| Property | Value |
| --- | --- |
| Runtime | ${cell(d.runtime, "_TBD_")} |
| Framework | ${cell(d.framework, "_TBD_")} |
| Authentication | ${cell(d.authentication, "_TBD_")} |
| Rate Limiting | ${cell(d.rateLimiting, "_TBD_")} |
| Input Format | ${cell(d.inputFormat, "_TBD_")} |
| Output Format | ${cell(d.outputFormat, "_TBD_")} |
| Logging | ${cell(d.logging, "_TBD_")} |
| Error Handling | ${cell(d.errorHandling, "_TBD_")} |

## API Contracts

| Method | Path | Request | Response | Auth |
| --- | --- | --- | --- | --- |
${endpointRows(d.endpoints, "| _TBD_ | _TBD_ | _Define request payload._ | _Define response payload._ | _Define auth requirement._ |")}`;
}
function cliDetailsSection(d) {
    return `## CLI Tool Configuration

| Property | Value |
| --- | --- |
| Language | ${cell(d.language, "_TBD_")} |
| Package Manager | ${cell(d.packageManager, "_TBD_")} |
| Arguments / Flags | ${cell(d.arguments, "_TBD_")} |
| Config File | ${cell(d.configFile, "_TBD_")} |
| Output Format | ${cell(d.outputFormat, "_TBD_")} |
| Platform Compatibility | ${cell(d.platformCompatibility, "_TBD_")} |

### Commands
${d.commands.trim() ? mdList(listFromText(d.commands)) : "_None specified._"}`;
}
function automationDetailsSection(d) {
    return `## Automation / Cron Configuration

| Property | Value |
| --- | --- |
| Runtime | ${cell(d.runtime, "_TBD_")} |
| Schedule | ${cell(d.schedule, "_TBD_")} |
| Trigger | ${cell(d.trigger, "_TBD_")} |
| Alerting | ${cell(d.alerting, "_TBD_")} |
| Logging | ${cell(d.logging, "_TBD_")} |
| Error Handling | ${cell(d.errorHandling, "_TBD_")} |
| Secrets Handling | ${cell(d.secretsHandling, "_TBD_")} |

### Dependencies
${d.dependencies.trim() ? mdList(listFromText(d.dependencies)) : "_None specified._"}`;
}
function sanitizeErId(value, fallback) {
    const sanitized = value.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^_+|_+$/g, "");
    return sanitized || fallback;
}
function relationshipDiagram(entities, relationships) {
    const entityIds = new Map(entities
        .filter((entity) => entity.name.trim())
        .map((entity, index) => [entity.name.trim().toLowerCase(), sanitizeErId(entity.name.trim(), `Entity${index + 1}`)]));
    const lines = ["erDiagram"];
    relationships.forEach((relationship) => {
        const many = relationship.match(/^(.+?)\s+has\s+many\s+(.+)$/i);
        const one = relationship.match(/^(.+?)\s+has\s+one\s+(.+)$/i);
        const match = many ?? one;
        if (!match) {
            lines.push(`  %% ${relationship.replace(/\r?\n/g, " ")}`);
            return;
        }
        const left = entityIds.get(match[1].trim().toLowerCase()) ?? sanitizeErId(match[1].trim(), "Left");
        const right = entityIds.get(match[2].trim().toLowerCase()) ?? sanitizeErId(match[2].trim(), "Right");
        lines.push(`  ${left} ${many ? "||--o{" : "||--||"} ${right} : relates_to`);
    });
    return `\`\`\`mermaid\n${lines.join("\n")}\n\`\`\``;
}
function dataModel(s) {
    const profile = dataModelProfile(s.idea.typeDetails.kind);
    const entities = s.dataModel.entities.filter((entity) => entity.name.trim() || entity.description.trim() || entity.fields.some((field) => field.name.trim()));
    const relationships = listFromText(s.dataModel.relationships);
    const validation = getSelectedForCategory(s.stack.selected, "validation");
    const entitySections = entities.length
        ? entities
            .map((entity, index) => {
            const title = entity.name.trim() || `${profile.entityNoun} ${index + 1}`;
            const fields = entity.fields.filter((field) => field.name.trim() || field.type.trim() || field.notes.trim());
            const fieldRows = fields.length
                ? fields
                    .map((field) => `| ${cell(field.name, "_TBD_")} | ${cell(field.type, "_TBD_")} | ${field.required ? "Yes" : "No"} | ${cell(field.notes, "_—_")} |`)
                    .join("\n")
                : `| _No fields defined_ | _TBD_ | _TBD_ | _Add ${profile.fieldsLabel.toLowerCase()} rows before implementation._ |`;
            return `### ${title}
${entity.description.trim() ? `\n${entity.description.trim()}\n` : ""}
| ${profile.fieldsLabel} | Type | Required | Notes |
| --- | --- | --- | --- |
${fieldRows}`;
        })
            .join("\n\n")
        : `### _No ${profile.entityNoun} contracts defined yet_

| ${profile.fieldsLabel} | Type | Required | Notes |
| --- | --- | --- | --- |
| _TBD_ | _TBD_ | _TBD_ | ${profile.emptyDirective} |`;
    const relationshipSection = s.idea.typeDetails.kind === "terraform"
        ? ""
        : `## Relationships
${relationships.length ? mdList(relationships) : "_None specified yet._"}`;
    const diagramSection = profile.showErDiagram && entities.length && relationships.length
        ? `## ER Diagram
${relationshipDiagram(entities, relationships)}`
        : "";
    return `# Data Model

${intro(s, profile.fileIntro)}## ${profile.entityHeading}

${entitySections}

${relationshipSection ? `${relationshipSection}\n\n` : ""}${diagramSection ? `${diagramSection}\n\n` : ""}## Data Rules
- Validate all external input at the boundary${validation.length ? ` with ${techLabel(validation)}` : ""}.
- Do not invent schemas, payloads, variables, outputs, config shapes, or persisted state.
- Update this file before changing a schema or data contract.
- Record schema decisions in the Decision Log of \`progress-tracker.md\`.
${s.dataModel.notes.trim() ? `\n## Notes\n${s.dataModel.notes.trim()}\n` : ""}`;
}
function dataFlowForType(s) {
    const { stack, idea } = s;
    const validation = getSelectedForCategory(stack.selected, "validation");
    const db = getSelectedForCategory(stack.selected, "database");
    const orm = getSelectedForCategory(stack.selected, "orm");
    const mvp = s.features.mvpFeatures.map((f) => f.name.trim()).filter(Boolean);
    const featureFlow = mvp.length
        ? mvp.map((feature, index) => `${index + 1}. ${feature}`).join(" → ")
        : "";
    switch (idea.typeDetails.kind) {
        case "desktop-application": {
            const d = idea.typeDetails.details;
            const p = (0, desktop_frameworks_1.desktopProfile)(d.framework);
            return `## Data Flow
1. The user interacts with the UI (${val(d.uiToolkit, p.uiToolkit)}).
2. UI events reach core logic through the framework boundary: ${p.coreBoundary}.
3. Inputs crossing that boundary are validated${validation.length ? ` using ${techLabel(validation)}` : ""} — treat them as untrusted.
4. MVP feature flow${featureFlow ? `: ${featureFlow}.` : " is implemented from the feature list in build-plan.md."}
5. Data is persisted locally via ${val(d.dataStorage, db.length ? techLabel(db) : p.dataStorage)}${orm.length ? ` through ${techLabel(orm)}` : ""}.
6. Results update application state and the UI re-renders; long work runs off the UI thread.`;
        }
        case "python-script":
        case "bash-script":
        case "powershell-script":
            return `## Execution Flow
1. Script is invoked with ${val(idea.typeDetails.details.arguments, "no arguments")}.
2. Dependencies are resolved.
3. Input is read from ${val(idea.typeDetails.details.inputFormat, "stdin or arguments")}.
4. Processing occurs.
5. Output is written to ${val(idea.typeDetails.details.outputFormat, "stdout")}.
6. Errors are handled via ${val(idea.typeDetails.details.errorHandling, "standard error handling")}.
7. Logging goes to ${val(idea.typeDetails.details.logging, "stdout")}.`;
        case "terraform":
            return `## Provisioning Flow
1. Terraform initializes providers and modules.
2. Variables are loaded from ${val(idea.typeDetails.details.environments, "environment configs")}.
3. Plan is generated and reviewed.
4. Policy checks run via ${val(idea.typeDetails.details.policyChecks, "built-in checks")}.
5. Apply provisions resources to ${val(idea.typeDetails.details.cloudProvider, "cloud provider")}.
6. State is stored in ${val(idea.typeDetails.details.stateHandling, "remote backend")}.`;
        case "api-service":
            return `## Request Flow
1. Client sends request to an endpoint defined in the API Contracts table.
2. Authentication is verified via ${val(idea.typeDetails.details.authentication, "auth layer")}.
3. Rate limiting is enforced (${val(idea.typeDetails.details.rateLimiting, "default limits")}).
4. Request is validated using ${validation.length ? techLabel(validation) : "the validation layer"}.
5. Business logic is executed${featureFlow ? ` through this MVP feature chain: ${featureFlow}.` : "."}
${db.length ? `6. Data is persisted via ${techLabel(db)}${orm.length ? ` through ${techLabel(orm)}` : ""}.` : "6. Results are computed."}
7. Response is returned as ${val(idea.typeDetails.details.outputFormat, "JSON")}.`;
        case "cli-tool":
            return `## Execution Flow
1. User invokes command with ${val(idea.typeDetails.details.arguments, "flags and arguments")}.
2. Config is loaded from ${val(idea.typeDetails.details.configFile, "defaults")}.
3. Command is dispatched based on input.
4. Processing occurs.
5. Output is rendered as ${val(idea.typeDetails.details.outputFormat, "text")}.
6. Exit code indicates success or failure.`;
        case "automation-cron":
            return `## Execution Flow
1. Job is triggered by ${val(idea.typeDetails.details.trigger, val(idea.typeDetails.details.schedule, "schedule"))}.
2. Dependencies are resolved.
3. Task executes.
4. Results are logged to ${val(idea.typeDetails.details.logging, "stdout")}.
5. Errors are handled via ${val(idea.typeDetails.details.errorHandling, "retry and alert")}.
6. Alerts are sent to ${val(idea.typeDetails.details.alerting, "configured channel")} on failure.`;
        default:
            return `## Data Flow
1. User interacts with the UI layer.
2. Requests are validated using ${validation.length ? techLabel(validation) : "the validation layer"}.
3. MVP feature flow${featureFlow ? `: ${featureFlow}.` : " is implemented from the feature list in build-plan.md."}
4. Persistence is handled by ${db.length ? techLabel(db) : "the data layer"}${orm.length ? ` via ${techLabel(orm)}` : ""}.
5. Results are returned and rendered.`;
    }
}
function folderStructureForType(kind, profile) {
    switch (kind) {
        case "desktop-application":
            if (profile)
                return profile.folderStructure;
            return `src/              # application source
tests/            # unit tests
README.md`;
        case "python-script":
        case "automation-cron":
            return `src/              # script source (entry point: main.py or equivalent)
config/           # configuration files
tests/            # unit tests
requirements.txt  # pinned dependencies
README.md`;
        case "bash-script":
            return `bin/              # entry scripts
lib/              # shared shell functions
tests/            # script tests (bats or equivalent)
README.md`;
        case "powershell-script":
            return `src/              # .ps1 / .psm1 sources
tests/            # Pester tests
config/           # configuration files
README.md`;
        case "terraform":
            return `modules/          # reusable modules
envs/             # per-environment configs (dev, staging, prod)
policies/         # policy-as-code checks
main.tf
variables.tf
outputs.tf
README.md`;
        case "cli-tool":
            return `cmd/              # command entry points
internal/         # core logic, not exported
docs/             # help text and usage docs
tests/
README.md`;
        case "api-service":
            return `src/
  routes/         # endpoint handlers
  services/       # business logic
  models/         # data models and validation schemas
  middleware/     # auth, rate limiting, logging
tests/
README.md`;
        default:
            return `app/              # routes and pages
components/       # reusable UI components
  ui/             # design-system primitives
lib/              # pure logic, generation, utilities
public/           # static assets
tests/            # unit and e2e tests`;
    }
}
function projectOverview(s) {
    const { idea, features } = s;
    const mvp = features.mvpFeatures.filter((f) => f.name.trim());
    const typeSection = typeDetailsSection(idea.typeDetails);
    const risks = riskItems(features.knownRisks);
    const profile = dataModelProfile(idea.typeDetails.kind);
    const mvpRows = mvp.length
        ? mvp
            .map((f) => `| ${cell(f.name)} | ${f.description.trim() ? cell(f.description) : "_To be detailed during implementation._"} | Planned |`)
            .join("\n")
        : "| _None specified yet._ | _Add MVP features in the Features step._ | Planned |";
    const showUI = (0, types_1.isUIProject)(idea.projectType);
    const essential = showUI
        ? "MVP scope, constraints, data contracts, stack choices, design tokens, build phases."
        : "execution commands, arguments, dependencies, file paths, data contracts, configuration, validation, security, and rollback behavior.";
    const skipList = showUI
        ? `- \`ui-tokens.md\`, \`ui-rules.md\`, \`ui-registry.md\` — read only when building interface components.
- \`progress-tracker.md\` history tables — read only the current status and open items.`
        : `- \`ui-tokens.md\` and \`ui-registry.md\` — not applicable to this project type; skip them.
- \`progress-tracker.md\` history tables — read only the current status and open items.`;
    const sections = [
        `# Project Overview

${intro(s, "Read this first. It explains what the project is, who it serves, and how to know whether the MVP is working.")}## Context Usage Strategy
Read in this order; stop as soon as you have what the current task needs:

1. \`project-overview.md\` — scope, users, success criteria (this file)
2. \`architecture.md\` — stack, data flow, structure, security, operations
3. \`data-model.md\` — ${profile.entityNoun} contracts and schema rules
4. \`code-standards.md\` — conventions and verification commands
5. \`build-plan.md\` — the current phase only
6. \`library-docs.md\` — when adding or using a dependency
7. ${showUI ? "`ui-tokens.md`, `ui-rules.md`, `ui-registry.md` — before any interface work" : "`ui-rules.md` — before writing user-facing output, logs, or errors"}

Essential context for this project: ${essential}

Read only when relevant:
${skipList}

Build only what is listed under MVP Scope. Anything under Out of Scope must not be implemented. Update \`progress-tracker.md\` after every change.${s.contextTools?.tokenBudget
            ? "\n\nToken budget: never load the whole pack at once. Pull the smallest set of sections that answers the current question, and re-read a file only after it changes."
            : ""}

## Project Type
${projectTypeLabel(idea.typeDetails.kind)}

## Project Name
${val(idea.projectName, "Untitled Project")}

## One-Line Pitch
${val(idea.pitch)}

## Problem Statement
${val(idea.problem)}

## Target Users
${val(idea.targetUsers)}

## Success Criteria
${mdList(listFromText(idea.successCriteria), "_TBD — define measurable success criteria before Phase 1._")}

## Constraints
${mdList(listFromText(idea.constraints))}

## Open Decisions Before Coding
${openDecisionsMarkdown(s)}`,
        typeSection,
        `## MVP Scope

| Feature | Description | Status |
| --- | --- | --- |
${mvpRows}

## Out of Scope (For Now)
${mdList(listFromText(features.outOfScope))}

## Risks Summary
${mdList(risks.map((r) => (r.mitigation === "_To be confirmed during implementation._" ? r.risk : `${r.risk} - ${r.mitigation}`)), "_None recorded yet._")}

See \`build-plan.md\` for mitigations and \`progress-tracker.md\` for live status.
`,
    ];
    return sections.filter(Boolean).join("\n\n");
}
function architecture(s) {
    const { stack, mermaid, idea } = s;
    const kind = idea.typeDetails.kind;
    const auth = getSelectedForCategory(stack.selected, "auth");
    const validation = getSelectedForCategory(stack.selected, "validation");
    const relevant = new Set(RELEVANT_CATEGORIES[kind]);
    const dprofile = (0, desktop_frameworks_1.profileFromTypeDetails)(idea.typeDetails);
    // Show categories that have selections, plus type-relevant open decisions.
    // Irrelevant empty rows (e.g. Frontend for a cron job) are omitted entirely.
    const stackTable = stack_options_1.STACK_CATEGORIES
        .filter((c) => c.id !== "other")
        .filter((c) => kind === "full-application" || (dprofile?.usesWebTech ?? false) || c.id !== "frontend")
        .filter((c) => getSelectedForCategory(stack.selected, c.id).length > 0 || relevant.has(c.id))
        .map((cat) => {
        const items = getSelectedForCategory(stack.selected, cat.id);
        return `| ${cat.label} | ${items.length ? cell(techLabel(items)) : "_None selected - open decision_"} |`;
    })
        .join("\n");
    const flow = dataFlowForType(s);
    const constraints = listFromText(idea.constraints);
    const implementationNotes = [];
    if (kind === "full-application" || kind === "api-service") {
        implementationNotes.push(`Authentication approach: ${auth.length ? techLabel(auth) : "_TBD — decide before building protected features._"}`);
    }
    implementationNotes.push(`Validation approach: ${validation.length ? `validate all external input at the boundary with ${techLabel(validation)}.` : "validate all external input at the boundary; choose the validation tooling in Phase 0."}`, ...constraints.map((c) => `Constraint: ${c}`));
    const graphBlock = s.contextTools?.codebaseGraph
        ? `

### Codebase Graph (optional tool, enabled)
Once code exists, generate a dependency map and summarize it here:

- ${graphToolText(s)}
- Use it to verify module boundaries before refactors or when entering an unfamiliar area.
- Do not regenerate it on every change, and never paste raw graph output into context — summarize.`
        : "";
    return `# Architecture

${intro(s, `System architecture and technical structure for ${val(idea.projectName, "the project")}.`)}## Overview
${val(idea.projectName, "This project")} is ${typeNounPhrase(kind)}. ${val(idea.pitch, "_Add a one-line pitch in the Idea step._")}

Data contracts live in \`data-model.md\`; do not persist, parse, expose, or output data shapes that are not documented there.

## Stack Summary

| Layer | Choice |
| --- | --- |
${stackTable}

## Architecture Evidence & Diagrams

${mermaidBlock(mermaid.code)}

System boundaries: everything in this repository is inside the boundary; ${kind === "terraform"
        ? "the cloud provider APIs and provisioned resources are outside"
        : kind === "full-application"
            ? "the user's browser, third-party services, and deployment platform are outside"
            : kind === "desktop-application"
                ? "the operating system, external services, and the update/distribution channel are outside"
                : "external services, data sources, and the scheduler/invoker are outside"}. Confirm before adding any integration that crosses it.${graphBlock}

${flow}

## Folder Structure Recommendation

\`\`\`text
${folderStructureForType(kind, dprofile)}
\`\`\`

## Key Implementation Notes
${mdList(implementationNotes)}

${configurationSection(s)}

${securitySection(s)}

${operationsSection(s)}

## Known Issues / Tech Debt

| Item | Impact | Planned Resolution |
| --- | --- | --- |
| _None recorded yet_ | _—_ | _Update this table during implementation._ |
`;
}
function codeStandards(s) {
    const { stack, agent, idea } = s;
    const frontend = getSelectedForCategory(stack.selected, "frontend");
    const backend = getSelectedForCategory(stack.selected, "backend");
    const validation = getSelectedForCategory(stack.selected, "validation");
    const testing = getSelectedForCategory(stack.selected, "testing");
    const showUI = (0, types_1.isUIProject)(idea.projectType);
    const dprofile = (0, desktop_frameworks_1.profileFromTypeDetails)(idea.typeDetails);
    const profile = langProfile(idea.typeDetails.kind, dprofile);
    const isDesktop = idea.typeDetails.kind === "desktop-application";
    const runtimeFromDetails = idea.typeDetails.kind === "terraform"
        ? "Terraform (HCL)"
        : detailProp(idea.typeDetails, "runtime") || detailProp(idea.typeDetails, "language");
    const langSection = isDesktop
        ? `- Framework: ${dprofile?.label ?? "_TBD_"}
- Language: ${val(detailProp(idea.typeDetails, "language"), dprofile?.language ?? "_TBD_")}
- UI Toolkit: ${val(detailProp(idea.typeDetails, "uiToolkit"), dprofile?.uiToolkit ?? "_TBD_")}
- Validation: ${techLabel(validation)}
- Testing: ${techLabel(testing)}`
        : showUI
            ? `- Frontend: ${techLabel(frontend)}
- Backend: ${techLabel(backend)}
- Validation: ${techLabel(validation)}
- Testing: ${techLabel(testing)}`
            : `- Runtime: ${backend.length ? techLabel(backend) : val(runtimeFromDetails, "_TBD — set the runtime in the Idea step._")}
- Validation: ${techLabel(validation)}
- Testing: ${techLabel(testing)}`;
    const uiSections = showUI
        ? `## Component Rules
- Keep components small, single-purpose, and composable.
- Separate presentational components from data/state logic.
- ${isDesktop && !(dprofile?.usesWebTech ?? true)
            ? "Reuse the framework's standard controls and existing project components before creating new ones."
            : "Reuse design-system primitives (see \`ui-registry.md\`) before creating new components."}
- Co-locate component-specific styles and tests with the component.

## State Management Rules
- Prefer local component state; lift state only when shared.
- Derive values instead of duplicating state.
- ${isDesktop
            ? "Persist long-lived state deliberately in the OS app-data location, and validate persisted data on load."
            : "Persist long-lived drafts deliberately (e.g., browser storage), and validate persisted data on load."}

`
        : "";
    return `# Code Standards

${intro(s, "Conventions every contributor and agent must follow.")}## Agent Role
${val(agent.role, "Senior software engineer")}

## Language & Framework
${langSection}

## Principles
${mdList(listFromText(agent.principles))}

## Agent Token Discipline
- Do not load every context file blindly — follow the Context Usage Strategy in \`project-overview.md\`.
- Summarize the relevant section of a file before editing it; never paste whole files into working context.
- Reference only the context relevant to the current phase or task.
- If a required decision is missing from these files, ask before implementing — do not assume.${s.contextTools?.tokenBudget
        ? "\n- Keep context files small when updating them: tables over prose, no instruction repeated across files, no restating what another file already says."
        : ""}

## Typing Rules
${mdList(profile.typing)}

${uiSections}## Form & Validation Rules
- Validate all external and imported data at the boundary${validation.length ? ` using ${techLabel(validation)}` : ""}.
- Fail with clear, actionable error messages; never silently coerce bad input.

## Configuration Rules
- Read configuration only from variables and sources listed in \`architecture.md\` -> \`Configuration\`.
- Do not add environment variables, config keys, CLI flags, tfvars, scheduler settings, or secrets without updating \`architecture.md\`.
- Never log or expose values marked secret.

## Error Handling Rules
- Handle expected failures explicitly; never swallow errors without logging.
- Surface user-facing errors in plain language; keep technical detail in logs.
- Use appropriate exit codes / status codes for failures.

## File Naming Rules
${mdList(profile.naming)}

## Testing Rules
- Every feature ships with tests covering the happy path and at least one failure path.
${testing.length ? `- Use ${techLabel(testing)} as the test toolchain.` : "- _Choose a test framework in the Stack step._"}
- Pure logic gets unit tests; user-critical flows get end-to-end coverage.${profile.minimumChecks.length ? `\n- Minimum static checks for this project type: ${profile.minimumChecks.map((c) => `\`${c}\``).join(", ")}.` : ""}

## Verification Commands
\`\`\`bash
${val(agent.verificationCommands, "npm run lint")}
\`\`\`

## Definition of Done
${val(agent.definitionOfDone)}

## Build Discipline
- Update \`progress-tracker.md\` after every implementation change.
- Record significant decisions in the Decision Log of \`progress-tracker.md\`.
`;
}
function notApplicable(title) {
    return `# ${title}

> **Not applicable** — this project type does not include a user interface.

This file is intentionally kept in the context pack so the file set is always complete. If the project later gains a UI, regenerate the pack with the project type set to Full Application.
`;
}
function uiTokens(s) {
    if (!(0, types_1.isUIProject)(s.idea.projectType)) {
        return notApplicable("UI Tokens");
    }
    const { look } = s;
    return `# UI Tokens

${intro(s, "Design tokens only — usage rules live in `ui-rules.md`.")}## Brand Adjectives
${val(look.brandAdjectives)}

## Color Mode
${look.colorMode}

## Colors

| Token | Value |
| --- | --- |
| primary | \`${cell(look.primary, "_TBD_")}\` |
| background | \`${cell(look.background, "_TBD_")}\` |
| surface | \`${cell(look.surface, "_TBD_")}\` |
| text | \`${cell(look.text, "_TBD_")}\` |
| success | \`${cell(look.success, "_TBD_")}\` |
| error | \`${cell(look.error, "_TBD_")}\` |

## Typography

| Role | Font |
| --- | --- |
| Display | ${cell(look.displayFont, "_TBD_")} |
| Body | ${cell(look.bodyFont, "_TBD_")} |
| Mono | ${cell(look.monoFont, "_TBD_")} |

## Radius

| Token | Value | Usage |
| --- | --- | --- |
| radius-sm | 8px | Inputs, chips, small controls |
| radius-md | 12px | Buttons, list items |
| radius-lg | 16px | Cards, panels, modals |

## Spacing

| Token | Value |
| --- | --- |
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-6 | 24px |
| space-8 | 32px |
| space-12 | 48px |

## Borders

| Token | Value |
| --- | --- |
| border-default | 1px solid, low-contrast neutral derived from text at ~10% opacity |
| border-focus | 1.5px solid primary |

## Shadows

| Token | Value | Usage |
| --- | --- | --- |
| shadow-soft | 0 1px 3px rgba(0,0,0,0.06) | Cards at rest |
| shadow-raised | 0 4px 12px rgba(0,0,0,0.08) | Popovers, dropdowns |

## Motion

| Token | Value |
| --- | --- |
| duration-fast | 150ms |
| duration-base | 250ms |
| easing | ease-out |

## Accessibility Notes
- Body text contrast must be at least 4.5:1 against its background.
- Focus states must be visible (focus ring in primary color); never remove outlines without replacement.
- Never communicate state with color alone — pair with icon or text.
- Honor reduced-motion preferences by disabling non-essential transitions.

## Design Notes
${val(look.designNotes)}
`;
}
function outputInterfaceRules(s) {
    const td = s.idea.typeDetails;
    if (td.kind === "terraform") {
        return `# UI Rules

This project has no graphical interface. These rules govern Terraform plan, apply, and output readability.

## Plan Output Rules
- Terraform plans must be reviewable: keep resource names descriptive and changes scoped.
- Never hide destructive changes in broad refactors; separate risky infrastructure changes into their own phase.
- Policy/security scan output must be summarized in plain language before apply.

## Output Rules
- Outputs use described snake_case names.
- Never expose secrets, tokens, credentials, private keys, or sensitive connection strings in outputs.
- Mark sensitive outputs with \`sensitive = true\` when outputting a sensitive reference is unavoidable.

## Error Surface Rules
- Provider, backend, and policy errors must include the failing environment and next recovery step.
- Drift, failed applies, and partial state changes must be documented in \`progress-tracker.md\`.`;
    }
    const outputFormat = detailProp(td, "outputFormat");
    const logging = detailProp(td, "logging");
    return `# UI Rules

This project has no graphical interface. These rules govern its command-line, log, and output behavior instead — the "UI" an operator actually sees.

## Output Conventions
- Results go to stdout; diagnostics and errors go to stderr.
- Output format: ${val(outputFormat, "_TBD — define before implementation (plain text, JSON, table)._")}
- Exit code 0 on success; non-zero, documented exit codes per failure class.
- Default output is quiet and machine-friendly; put detail behind a verbose flag.

## Help & Usage
- Provide help output (\`--help\` or comment-based help) documenting every argument and flag.
- Invalid arguments fail with a one-line usage hint, never a stack trace.

## Logging Rules
- Logging destination: ${val(logging, "stdout (define before implementation)")}
- Log with timestamps and severity levels; never log secrets or credentials.
- Make failures actionable: what failed, why, and what to do next.

## Error Surface Rules
- Human-readable one-line error first; technical detail afterwards or in logs.
- Distinguish user errors (bad input, missing config) from system errors (network, permissions).
`;
}
function uiRules(s) {
    if (!(0, types_1.isUIProject)(s.idea.projectType)) {
        return outputInterfaceRules(s);
    }
    const { look } = s;
    return `# UI Rules

${intro(s, "How the interface should look and behave.")}Token values live in \`ui-tokens.md\` — reference tokens by name here, never duplicate their values.

## Design Philosophy
${mdList(listFromText(look.brandAdjectives.replace(/,/g, "\n")), "_Define brand adjectives in the Look step._")}

${val(look.designNotes, "")}

## Layout Rules
- Full-height shell; content column centered with a comfortable max width.
- Generous whitespace between sections; never crowd controls.
- One primary action per screen; keep secondary actions visually quiet.

## Core Rules

| Rule | Requirement |
| --- | --- |
| Spacing | Generous, consistent spacing using the scale in \`ui-tokens.md\` |
| Corners | Rounded cards and controls (see radius tokens) |
| Borders | Minimal, subtle borders only where needed |
| Shadows | Soft, low-contrast shadows |
| Hierarchy | Clear typographic and visual hierarchy |
| Color usage | Limited palette anchored on the primary color |
| Motion | Subtle, purposeful micro-interactions |
| Accessibility | Sufficient contrast, semantic HTML, keyboard support |

## Form Rules
- Labels are small, uppercase, muted, letter-spaced, and programmatically associated with their inputs.
- Inputs are large, rounded, with subtle borders; helper text is small and muted.
- Validate gently: guide rather than block; show errors inline next to the field.

## Button Rules
- Primary: solid primary color, white text, rounded.
- Secondary: white/transparent background with subtle border.
- Destructive: red accent, used sparingly, with confirmation where data loss is possible.
- Disabled: lowered opacity, no pointer events, still announced to assistive tech.

## Empty State Rules
- Every list or table has a designed empty state with a short explanation and a next action.
- Never render a blank panel.

## Error State Rules
- Errors are inline, plain-language, and recoverable.
- Never show raw stack traces or codes to end users.

## Responsive Behavior
- Layout collapses gracefully to a single column on small screens.
- Touch targets are at least 40px; nothing depends on hover alone.
${s.idea.typeDetails.kind === "desktop-application"
        ? `
## Desktop Behavior Rules
- Provide native menus and keyboard shortcuts for primary actions; follow each OS's conventions (Ctrl vs Cmd).
- Remember window size and position between sessions; handle multi-monitor setups sanely.
- Long operations run off the UI thread, show progress, and never freeze the window; support cancel where possible.
- Respect the OS theme (light/dark) and scale correctly with system DPI settings.
`
        : ""}
## Accessibility Rules
- All interactive elements are reachable and operable by keyboard.
- Icon-only buttons carry accessible names.
- Live status changes (validation, save state) are announced via polite live regions.
`;
}
function uiRegistry(s) {
    if (!(0, types_1.isUIProject)(s.idea.projectType)) {
        return notApplicable("UI Registry");
    }
    const dprofile = (0, desktop_frameworks_1.profileFromTypeDetails)(s.idea.typeDetails);
    if (dprofile && !dprofile.usesWebTech) {
        return `# UI Registry

> **Not applicable** — this desktop application uses ${dprofile.label} native UI (${dprofile.uiToolkit}), not a web component registry.

Track reusable views and controls directly in code, and record the major ones in \`architecture.md\` when the inventory grows. If the project later moves to a web-technology UI, regenerate the pack.
`;
    }
    const { stack } = s;
    const usesShadcn = stack.selected.some((t) => t.techId === "shadcn");
    const styling = getSelectedForCategory(stack.selected, "frontend")
        .filter((t) => !["nextjs", "react-spa", "vue", "svelte", "angular", "astro"].includes(t.techId));
    return `# UI Registry

${intro(s, "Compact component index — purpose, props, state, and reuse guidance only. Implementation details belong in the code, not here.")}## Styling System
${styling.length ? techLabel(styling) : "Project-defined styling"}

## Component Source
${usesShadcn ? "shadcn/ui registry components, extended with project-specific components." : "Project-defined component library."}

## Component Index

| Component | Purpose | Props | State | Reuse |
| --- | --- | --- | --- | --- |
| AppShell | Page frame: nav + content | children | none | One per app |
| SidebarNav | Wizard navigation and completion state | active, onSelect, completed, disabledSteps | active step | One per wizard |
| StepIndicator | Numbered step state inside sidebar/footer | step, active, completed | none | Reuse for wizard steps |
| WizardFooter | Back/continue/generate navigation | previous, next, step count | active step | One per wizard |
| PageHeader | Screen title + description | title, description | none | One per screen |
| Button | Actions | variant, size, disabled | none | Never restyle ad hoc |
| Input | Single-line entry | value, onChange, placeholder | controlled | Always with a label |
| FormField | Label, hint, and field wrapper | label, hint, htmlFor | none | Use for every form control |
| TextareaField | Multi-line entry + label/hint | label, value, onChange, hint | controlled | One-per-line lists |
| ColorInput | Token color entry | label, value, onChange | controlled | Use in Look step |
| ChipSelector | Compact option selector | options, value, onChange | selected option | Use for small choice sets |
| MermaidEditor | Diagram source editor | code, onChange | controlled | Mermaid step only |
| MermaidPreview | Rendered diagram preview | code | render status | Pair with MermaidEditor |
| DataModelSection | Data contract editor | data, projectType, onChange | controlled | Data step only |
| DataEntityCard | One entity/resource/schema card | entity, labels, onChange | controlled | Repeat inside DataModelSection |
| DataFieldRow | One field/variable row | field, labels, onChange | controlled | Repeat inside DataEntityCard |
| SelectField | Option selection + label | label, value, options | controlled | Keyboard accessible |
| Card | Grouped content surface | children | none | Soft border, radius-lg |
| Table | Tabular data | columns, rows | sort/selection local | Must include EmptyState |
| EmptyState | Designed empty placeholder | message, action | none | Required for every list |
| ErrorBanner | Inline recoverable error | message, onRetry | none | Plain language only |
| FileExportList | Generated file selector | files, active, selected, onSelect | selected files | Export step only |
| MarkdownPreview | Generated markdown reader/editor | file, editing, onChange | edit mode | Export step only |
| DownloadButton | File or zip download action | files, mode | none | Export step only |

Check this index before creating any component; add a row when a new one is introduced.
`;
}
function optionalContextTools(s) {
    const ct = s.contextTools;
    if (!ct)
        return "";
    const tools = [];
    if (ct.docIngestion) {
        const t = (0, context_tools_1.resolveContextTool)(context_tools_1.DOC_INGESTION_TOOLS, ct.docIngestionTool, ct.docIngestionCustom);
        tools.push(`### ${t.label} — document-to-markdown ingestion
- What: converts PDFs, Office files, and notes to clean, well-structured markdown locally${toolMeta(t)}. No API calls.
- Use when: an external document is the source of a requirement and is not yet in this pack.
- Don't: convert whole documents when one section answers the question, or ingest the same document twice.`);
    }
    if (ct.codebaseGraph) {
        tools.push(`### Codebase graph / report
- What: generates architecture and dependency maps. Selected tooling: ${graphToolText(s)}.
- Use when: verifying module boundaries before a refactor, or orienting in an unfamiliar area of the codebase.
- Don't: regenerate per change, or paste raw graph output into context — summarize the relevant slice.`);
    }
    if (ct.mermaidValidation) {
        tools.push(`### Mermaid CLI — diagram validation
- What: validates and renders Mermaid locally (\`npx @mermaid-js/mermaid-cli -i diagram.mmd -o diagram.svg\`).
- Use when: a diagram in \`architecture.md\` or \`build-plan.md\` was edited.
- Don't: render on every read — validation is only needed after a change.`);
    }
    if (ct.markdownLinting) {
        const t = (0, context_tools_1.resolveContextTool)(context_tools_1.LINT_TOOLS, ct.lintTool, ct.lintCustom);
        tools.push(`### ${t.label} — context file hygiene
- What: lints/formats markdown locally${toolMeta(t)}.
- Use when: after editing any file in this context pack.
- Don't: lint the whole repository's markdown as part of this pack's checks.`);
    }
    if (ct.tokenBudget) {
        tools.push(`### Token counter — context size checks
- What: local token estimation (e.g. a tiktoken script or \`npx gpt-tokenizer\`).
- Use when: a context file grows past roughly 1,500 words or starts repeating itself.
- Don't: micro-optimize short files — the budget applies to the pack, not to every line.`);
    }
    if (!tools.length)
        return "";
    return `## Optional Context Tools

Local, no-API tools enabled for this project. Use each only at the moment described — reflexive use wastes time and tokens.

${tools.join("\n\n")}

`;
}
function libraryDocs(s) {
    const { stack } = s;
    const cats = stack_options_1.STACK_CATEGORIES.filter((c) => c.id !== "other" && (s.idea.typeDetails.kind === "full-application" || c.id !== "frontend"));
    const mainRows = cats
        .flatMap((cat) => getSelectedForCategory(stack.selected, cat.id).map((t) => `| ${cell(t.label)} | ${cat.label} | ${t.config ? cell(t.config) : cell(cat.description)} | Official docs required before use. |`))
        .join("\n");
    const rejected = (stack.rejectedLibraries ?? []).filter((r) => r.library.trim());
    const checkedLibs = stack.otherLibraries.filter((l) => l.checked && l.name.trim());
    const libRows = checkedLibs
        .map((l) => `| ${cell(l.name)} | Other | ${cell(l.notes, "_Add usage notes._")} | Official docs required before use. |`)
        .join("\n");
    const allRows = [mainRows, libRows].filter(Boolean).join("\n") ||
        "| _None added yet_ | _—_ | _Select technologies in the Stack step._ | _—_ |";
    // Packages you install vs. platforms/services you configure.
    const INSTALLABLE = new Set(["frontend", "backend", "orm", "auth", "validation", "testing"]);
    const installList = [
        ...cats
            .filter((c) => INSTALLABLE.has(c.id))
            .flatMap((cat) => getSelectedForCategory(stack.selected, cat.id))
            .filter((t) => t.techId !== "no-auth")
            .map((t) => t.label),
        ...checkedLibs.map((l) => l.name),
    ];
    const platformList = cats
        .filter((c) => !INSTALLABLE.has(c.id))
        .flatMap((cat) => getSelectedForCategory(stack.selected, cat.id))
        .map((t) => (t.config ? `${t.label} — ${t.config}` : t.label));
    return `# Library Docs

${intro(s, "Approved libraries and guidance for using them.")}## Approved Libraries

| Library | Category | Purpose / Notes | Docs |
| --- | --- | --- | --- |
${allRows}

## Installation Notes
${installList.length
        ? `Install with the project's standard package manager, pinning versions:

${mdList(installList)}`
        : "_No installable libraries selected yet. Choose technologies in the Stack step._"}
${platformList.length
        ? `
Platforms and services (configured, not installed as packages):

${mdList(platformList)}
`
        : ""}
Rules:

- Pin exact or caret-bounded versions; commit the lockfile.
- Record any newly added dependency in this file before using it.

## Usage Rules
- Use only libraries listed in this file; propose additions by updating the Approved Libraries table first.
- Prefer the standard library or existing dependencies over adding new ones.
- Read the official docs for each library before first use; do not guess APIs.

${optionalContextTools(s)}## Rejected Libraries

| Library | Reason Rejected | Alternative |
| --- | --- | --- |
${rejected.length
        ? rejected
            .map((r) => `| ${cell(r.library)} | ${cell(r.why, "_Not documented_")} | ${cell(r.alternative)} |`)
            .join("\n")
        : "| _None rejected yet_ | _No rejected libraries were specified during planning._ | _—_ |"}

Do not introduce a rejected library without recording a new decision in \`progress-tracker.md\`.
`;
}
function buildPlan(s) {
    const { features, mermaid, idea, agent } = s;
    const mvp = features.mvpFeatures.filter((f) => f.name.trim());
    const profile = dataModelProfile(idea.typeDetails.kind);
    const endpoints = apiEndpoints(s).filter((endpoint) => endpoint.method.trim() || endpoint.path.trim());
    const openDecisions = openDecisionItems(s);
    const setupOpenDecisions = openDecisions.filter((decision) => !decision.startsWith("Define or explicitly defer") &&
        !decision.startsWith("Define API endpoint contracts"));
    const setupPhase = `### Phase 0: Project Setup
- [ ] Scaffold the folder structure from \`architecture.md\`
- [ ] Install approved dependencies from \`library-docs.md\`
- [ ] Confirm \`data-model.md\` (${profile.entityNoun} contracts) or explicitly defer with a tracker decision
- [ ] Confirm \`architecture.md\` -> \`Configuration\` or explicitly defer with a tracker decision
${setupOpenDecisions.map((decision) => `- [ ] ${decision}`).join("\n")}
- [ ] Configure lint, typecheck, and test tooling so every verification command runs
- [ ] Commit a walking skeleton: the project runs end-to-end with no real features yet`;
    const featurePhases = mvp.length
        ? mvp
            .map((f, i) => `### Phase ${i + 1}: ${f.name}\n${f.description.trim() ? `_${f.description.trim()}_\n\n` : ""}- [ ] Implement\n- [ ] Validate inputs\n- [ ] Test\n- [ ] Verify against definition of done\n- [ ] Update \`progress-tracker.md\``)
            .join("\n\n")
        : "_Define MVP features in the Features step to generate feature phases._";
    const hardeningPhase = `### Phase ${mvp.length + 1}: Hardening & Release Readiness
- [ ] Review against Security Considerations in \`architecture.md\`
- [ ] Complete the Testing Checklist below
- [ ] Update docs: README, usage/runbook
- [ ] Final pass on \`progress-tracker.md\`: statuses, decision log, change log`;
    const phases = [setupPhase, featurePhases, hardeningPhase].join("\n\n");
    const successItems = listFromText(idea.successCriteria);
    const acceptance = successItems.length
        ? successItems.map((c) => `- [ ] ${c}`).join("\n")
        : "- [ ] _Define success criteria in the Idea step._";
    const commands = listFromText(agent.verificationCommands);
    const testingChecklist = [
        ...mvp.map((f) => `- [ ] ${f.name} — happy path and failure path covered`),
        ...endpoints.map((endpoint) => `- [ ] ${endpoint.method || "_TBD_"} ${endpoint.path || "_TBD_"} — request, response, auth, and failure cases covered`),
        ...commands.map((c) => `- [ ] \`${c}\` passes`),
    ];
    const riskRows = riskItems(features.knownRisks);
    const ct = s.contextTools;
    const contextPrep = [
        "- [ ] Read the minimum required files per the Context Usage Strategy in `project-overview.md`",
        ct?.docIngestion
            ? `- [ ] Convert referenced external documents to markdown with ${(0, context_tools_1.resolveContextTool)(context_tools_1.DOC_INGESTION_TOOLS, ct.docIngestionTool, ct.docIngestionCustom).label} — only the sections needed`
            : "",
        ct?.mermaidValidation
            ? "- [ ] Validate the architecture diagram with Mermaid CLI before relying on it"
            : "",
        ct?.codebaseGraph
            ? "- [ ] Generate or inspect the codebase graph report if module boundaries are unclear"
            : "",
        "- [ ] Confirm open decisions listed in `project-overview.md` or ask before proceeding",
    ]
        .filter(Boolean)
        .join("\n");
    return `# Build Plan

${intro(s, "Phased implementation plan derived from the MVP scope.")}## Build Objective
${val(idea.pitch, val(idea.problem, "_Define the project pitch in the Idea step._"))}

## Context Preparation (Before Coding)
${contextPrep}

## Flow

${mermaidBlock(mermaid.code)}

## MVP Features
${mdList(mvp.map((f) => (f.description.trim() ? `${f.name} — ${f.description.trim()}` : f.name)), "_None specified yet. Add features in the Features step._")}

## Implementation Phases

${phases}

## Acceptance Criteria
${acceptance}
${agent.definitionOfDone.trim() ? `\nDefinition of done: ${agent.definitionOfDone.trim()}\n` : ""}
## Testing Checklist
${testingChecklist.length ? testingChecklist.join("\n") : "- [ ] _Add MVP features and verification commands to generate a checklist._"}

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
${riskRows.length
        ? riskRows.map((r) => `| ${cell(r.risk)} | _TBD_ | ${cell(r.mitigation, "_To be confirmed during implementation._")} |`).join("\n")
        : "| _None recorded yet_ | _—_ | _Add known risks in the Features step._ |"}
`;
}
function progressTracker(s) {
    const { features, idea } = s;
    const mvp = features.mvpFeatures.filter((f) => f.name.trim());
    const openDecisions = openDecisionItems(s);
    const featureRows = mvp.length
        ? mvp
            .map((f) => `| ${cell(f.name)} | Not started | ${f.description.trim() ? cell(f.description) : "_—_"} |`)
            .join("\n")
        : "| _No features defined_ | _—_ | _Add MVP features in the Features step._ |";
    // Mirrors the phase numbering in build-plan.md (setup + features + hardening).
    const phaseRows = [
        "| Phase 0 | Project setup | Not started |",
        ...(mvp.length
            ? mvp.map((f, i) => `| Phase ${i + 1} | ${cell(f.name)} | Not started |`)
            : ["| Phase 1 | _Define MVP features to populate phases_ | Not started |"]),
        `| Phase ${mvp.length ? mvp.length + 1 : 2} | Hardening & release readiness | Not started |`,
    ].join("\n");
    const riskRows = riskItems(features.knownRisks);
    const ct = s.contextTools;
    const qualityRows = [
        "| All 10 files generated and project-type-aware | Pass |",
        `| Data model defined or explicitly deferred | ${hasDataModel(s) ? "Pass" : "_Verify before Phase 1_"} |`,
        `| Configuration defined or explicitly deferred | ${hasProjectConfig(s) ? "Pass" : "_Verify before Phase 1_"} |`,
        `| Open decisions resolved or tracked | ${openDecisions.length ? "_Resolve before Phase 1_" : "Pass"} |`,
        "| No unresolved placeholders blocking implementation | _Verify before Phase 1_ |",
        "| No instruction repeated across files | _Verify before Phase 1_ |",
        ct?.markdownLinting
            ? `| Markdown lint clean (${(0, context_tools_1.resolveContextTool)(context_tools_1.LINT_TOOLS, ct.lintTool, ct.lintCustom).label}) | _Run after edits_ |`
            : "",
        ct?.tokenBudget ? "| Pack within token budget — no file overly long or repetitive | _Check with token counter_ |" : "",
    ]
        .filter(Boolean)
        .join("\n");
    return `# Progress Tracker

${intro(s, `Living journal of build status for ${val(idea.projectName, "the project")}. Agents update this after every implementation change.`)}## Project Status
**Planning** — context files generated; implementation has not started. Update this line as the build progresses.

## Context Quality Checks

| Check | Status |
| --- | --- |
${qualityRows}

## Status Legend
- Not started
- In progress
- Blocked
- Done

## Open Decisions

| Decision | Status | Notes |
| --- | --- | --- |
${openDecisions.length ? openDecisions.map((decision) => `| ${cell(decision)} | Open | _Resolve before Phase 1 or explicitly defer._ |`).join("\n") : "| _None detected_ | _—_ | _Keep this table updated as decisions change._ |"}

## Feature Status

| Feature | Status | Notes |
| --- | --- | --- |
${featureRows}

## Build Phases

| Phase | Scope | Status |
| --- | --- | --- |
${phaseRows}

## Known Issues / Tech Debt

| Issue | Severity | Found | Notes |
| --- | --- | --- | --- |
| _None recorded yet_ | Low | Initial planning | _Update this table during implementation._ |

## Risks & Unknowns

| Risk | Status | Notes |
| --- | --- | --- |
${riskRows.length
        ? riskRows.map((r) => `| ${cell(r.risk)} | Open | ${cell(r.mitigation, "_To be confirmed during implementation._")} |`).join("\n")
        : "| _None recorded yet_ | _—_ | _Add known risks in the Features step._ |"}

## Decision Log

| Decision | Why | Date |
| --- | --- | --- |
| _None recorded yet_ | _Record significant technical decisions here._ | _—_ |

## Change Log

| Change | Files Touched | Date |
| --- | --- | --- |
| _None recorded yet_ | _—_ | _—_ |

## Agent Execution Notes
_Record decisions, blockers, and deviations from the plan here._
`;
}
function mNode(id, text, shape = "rect") {
    const label = `"${text.replace(/"/g, "'")}"`;
    switch (shape) {
        case "db":
            return `${id}[(${label})]`;
        case "diamond":
            return `${id}{${label}}`;
        default:
            return `${id}[${label}]`;
    }
}
// Deterministic starter diagram built from the brief — offered in the Mermaid
// step as a one-click starting point, never applied silently.
function starterDiagram(s) {
    const td = s.idea.typeDetails;
    const name = s.idea.projectName.trim() || "App";
    const feats = s.features.mvpFeatures.map((f) => f.name.trim()).filter(Boolean).slice(0, 5);
    const lines = ["flowchart TD"];
    const push = (l) => lines.push("  " + l);
    // Chains MVP features between two nodes, or connects them directly.
    const chainFeatures = (fromId, toId) => {
        let prev = fromId;
        feats.forEach((f, i) => {
            push(`${prev} --> ${mNode("F" + i, f)}`);
            prev = "F" + i;
        });
        push(`${prev} --> ${toId}`);
    };
    switch (td.kind) {
        case "terraform": {
            push(`${mNode("C", "Terraform code")} --> ${mNode("F", "fmt + validate")}`);
            push(`F --> ${mNode("P", "terraform plan")}`);
            push(`P --> ${mNode("PC", `Policy checks: ${td.details.policyChecks.trim() || "Checkov / tfsec"}`)}`);
            push(`PC --> ${mNode("AP", "Review and approve", "diamond")}`);
            push(`AP -->|approved| ${mNode("A", `Apply to ${td.details.cloudProvider.trim() || "cloud provider"}`)}`);
            push(`A --> ${mNode("S", `State: ${td.details.backendStorage.trim() || "remote backend"}`, "db")}`);
            break;
        }
        case "api-service": {
            push(`${mNode("CL", "Client")} --> ${mNode("AU", `Auth: ${td.details.authentication.trim() || "TBD"}`)}`);
            push(`AU --> ${mNode("RL", "Rate limiting")}`);
            push(`RL --> ${mNode("V", "Validate request")}`);
            const resp = mNode("R", `Response: ${td.details.outputFormat.trim() || "JSON"}`);
            if (feats.length) {
                push(`V --> ${mNode("D", "Route dispatch", "diamond")}`);
                feats.forEach((f, i) => push(`D --> ${mNode("F" + i, f)}`));
                feats.forEach((_, i) => push(`F${i} --> R`));
                push(resp);
            }
            else {
                push(`V --> ${mNode("H", "Business logic")}`);
                push(`H --> ${resp}`);
            }
            break;
        }
        case "cli-tool": {
            push(`${mNode("U", "User command")} --> ${mNode("P", "Parse args and config")}`);
            const out = mNode("O", `Render output: ${td.details.outputFormat.trim() || "text"}`);
            if (feats.length) {
                push(`P --> ${mNode("D", "Dispatch command", "diamond")}`);
                feats.forEach((f, i) => push(`D --> ${mNode("F" + i, f)}`));
                feats.forEach((_, i) => push(`F${i} --> O`));
                push(out);
            }
            else {
                push(`P --> ${out}`);
            }
            push(`O --> ${mNode("E", "Exit code")}`);
            break;
        }
        case "python-script":
        case "bash-script":
        case "powershell-script": {
            push(`${mNode("T", `Trigger: ${td.details.scheduling.trim() || "manual run"}`)} --> ${mNode("P", `Read and validate input: ${td.details.inputFormat.trim() || "args / stdin"}`)}`);
            chainFeatures("P", "O");
            push(`${mNode("O", `Write output: ${td.details.outputFormat.trim() || "stdout"}`)} --> ${mNode("L", "Log and exit code")}`);
            break;
        }
        case "automation-cron": {
            push(`${mNode("T", `Trigger: ${td.details.schedule.trim() || td.details.trigger.trim() || "schedule"}`)} --> ${mNode("P", "Load config and secrets")}`);
            chainFeatures("P", "O");
            push(`${mNode("O", "Record results")} --> ${mNode("L", `Log: ${td.details.logging.trim() || "stdout"}`)}`);
            push(`L --> ${mNode("AL", `Alert on failure: ${td.details.alerting.trim() || "TBD"}`)}`);
            break;
        }
        case "desktop-application": {
            const p = (0, desktop_frameworks_1.desktopProfile)(td.details.framework);
            push(`${mNode("U", "User")} --> ${mNode("W", `${name} window (${p.label})`)}`);
            push(`W --> ${mNode("B", `Core boundary: ${p.coreBoundary.split("→").pop()?.trim() || "core logic"}`)}`);
            push(`B --> ${mNode("V", "Validate input")}`);
            chainFeatures("V", "S");
            push(`${mNode("S", `Local storage: ${td.details.dataStorage.trim() || "app data"}`, "db")} --> W`);
            break;
        }
        default: {
            push(`${mNode("U", "User")} --> ${mNode("A", name)}`);
            push(`A --> ${mNode("V", "Validate input")}`);
            chainFeatures("V", "S");
            push(`${mNode("S", "Store / state", "db")} --> A`);
            break;
        }
    }
    return lines.join("\n");
}
// Root-level guide included in the full zip so agent harnesses that look for
// AGENTS.md find the reading order immediately.
function packManifest(s) {
    const name = val(s.idea.projectName, "Untitled Project");
    const ct = s.contextTools;
    const enabledTools = [
        ct?.docIngestion &&
            `${(0, context_tools_1.resolveContextTool)(context_tools_1.DOC_INGESTION_TOOLS, ct.docIngestionTool, ct.docIngestionCustom).label} (document → markdown ingestion)`,
        ct?.codebaseGraph && `codebase graph / dependency report (${graphToolText(s)})`,
        ct?.mermaidValidation && "Mermaid CLI diagram validation",
        ct?.markdownLinting &&
            `${(0, context_tools_1.resolveContextTool)(context_tools_1.LINT_TOOLS, ct.lintTool, ct.lintCustom).label} for context files`,
        ct?.tokenBudget && "token budget discipline",
    ].filter(Boolean);
    const toolsSection = enabledTools.length
        ? `\n## Enabled Context Tools\n${mdList(enabledTools)}\n\nAll local, no API calls. Usage rules — when to use each and when not to — are in \`library-docs.md\` under Optional Context Tools.\n`
        : "";
    return `# AGENTS.md — How To Use This Context Pack

This folder is the generated context pack for **${name}** (${projectTypeLabel(s.idea.typeDetails.kind)}). It was produced by Context Editor from a structured project brief — deterministic generation, no AI calls. Read it before writing any code.

## Reading Order

| # | File | Purpose |
| --- | --- | --- |
| 1 | \`project-overview.md\` | Scope, users, success criteria, constraints |
| 2 | \`architecture.md\` | Stack, data flow, structure, security, operations |
| 3 | \`data-model.md\` | Data contracts, payloads, schemas, variables, and outputs |
| 4 | \`code-standards.md\` | Conventions, verification commands, definition of done |
| 5 | \`build-plan.md\` | Phased implementation order and acceptance criteria |
| 6 | \`library-docs.md\` | Approved and rejected dependencies |
| 7 | \`ui-tokens.md\` / \`ui-rules.md\` / \`ui-registry.md\` | Interface rules — read before any UI or output work |
| 8 | \`progress-tracker.md\` | Living status journal — update after every change |

## Operating Rules
- Build only what \`project-overview.md\` lists under **MVP Scope**; never implement anything under **Out of Scope**.
- Follow \`code-standards.md\` and run its verification commands before declaring any phase done.
- Work in the phase order defined in \`build-plan.md\`, starting with Phase 0.
- Update \`progress-tracker.md\` (status, decisions, change log) after every implementation change.
${toolsSection}`;
}
function generateFiles(s) {
    return [
        { name: "project-overview.md", group: "Capture", content: projectOverview(s) },
        { name: "architecture.md", group: "Architecture", content: architecture(s) },
        { name: "data-model.md", group: "Architecture", content: dataModel(s) },
        { name: "code-standards.md", group: "Standards", content: codeStandards(s) },
        { name: "ui-tokens.md", group: "Design", content: uiTokens(s) },
        { name: "ui-rules.md", group: "Design", content: uiRules(s) },
        { name: "ui-registry.md", group: "Design", content: uiRegistry(s) },
        { name: "library-docs.md", group: "Library", content: libraryDocs(s) },
        { name: "build-plan.md", group: "Plan", content: buildPlan(s) },
        { name: "progress-tracker.md", group: "Journal", content: progressTracker(s) },
    ];
}
