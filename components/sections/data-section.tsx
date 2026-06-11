"use client"

import { useState } from "react"
import type { DataEntity, DataField, DataModelData, ProjectType } from "@/lib/types"
import { dataModelProfile } from "@/lib/generate"
import { AreaField, Field, SectionHeader } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Plus, X, Sparkles, Eye, EyeOff, Undo2 } from "lucide-react"

const EMPTY_FIELD: DataField = {
  name: "",
  type: "",
  required: false,
  notes: "",
}

const EMPTY_ENTITY: DataEntity = {
  name: "",
  description: "",
  fields: [{ ...EMPTY_FIELD }],
}

const GENERAL_TYPES = ["text", "number", "boolean", "date", "datetime", "list", "json", "file path", "reference", "secret"]
const TERRAFORM_TYPES = ["string", "number", "bool", "list(string)", "map(string)", "object", "sensitive string"]

// Plain-language guidance + a one-click example per project type, so a junior
// can see the expected shape instead of decoding terminology.
const GUIDANCE: Record<ProjectType, { help: string; example: DataEntity }> = {
  "full-application": {
    help: "List the things your app stores or shows — like User, Project, or Invoice. For each one, add its fields (like columns in a spreadsheet). The agent will build exactly these instead of inventing its own.",
    example: {
      name: "User",
      description: "A person with an account",
      fields: [
        { name: "id", type: "number", required: true, notes: "unique" },
        { name: "email", type: "text", required: true, notes: "used to sign in" },
        { name: "created_at", type: "datetime", required: false, notes: "" },
      ],
    },
  },
  "desktop-application": {
    help: "Describe the local records, settings, and app state your desktop app stores. The agent will keep persistence, import/export, and UI state aligned to these contracts.",
    example: {
      name: "AppSettings",
      description: "User preferences persisted in the OS app-data directory",
      fields: [
        { name: "theme", type: "text", required: true, notes: "light, dark, or system" },
        { name: "window_bounds", type: "json", required: false, notes: "last window size and position" },
        { name: "recent_files", type: "list", required: false, notes: "file paths shown in the recent menu" },
      ],
    },
  },
  "api-service": {
    help: "Describe what clients send and what your API returns — one card per payload. The agent will match these shapes in every endpoint.",
    example: {
      name: "CreateUserRequest",
      description: "Body of POST /users",
      fields: [
        { name: "email", type: "text", required: true, notes: "must be valid email" },
        { name: "role", type: "text", required: false, notes: "defaults to 'member'" },
      ],
    },
  },
  "python-script": {
    help: "Describe the data your script reads and writes — for example one row of the input CSV, or the JSON record you output. The agent will parse and produce exactly these shapes.",
    example: {
      name: "InputRow",
      description: "One row of the input CSV",
      fields: [
        { name: "date", type: "date", required: true, notes: "YYYY-MM-DD" },
        { name: "amount", type: "number", required: true, notes: "" },
        { name: "category", type: "text", required: false, notes: "" },
      ],
    },
  },
  "bash-script": {
    help: "Describe the data your script reads and writes — input file lines, output records, or important variables. The agent will handle exactly these shapes.",
    example: {
      name: "LogLine",
      description: "One line of the input log",
      fields: [
        { name: "timestamp", type: "datetime", required: true, notes: "ISO format" },
        { name: "level", type: "text", required: true, notes: "INFO, WARN, ERROR" },
        { name: "message", type: "text", required: true, notes: "" },
      ],
    },
  },
  "powershell-script": {
    help: "Describe the data your script reads and writes — input objects, CSV rows, or output records. The agent will handle exactly these shapes.",
    example: {
      name: "ServerRecord",
      description: "One server entry from the inventory CSV",
      fields: [
        { name: "hostname", type: "text", required: true, notes: "" },
        { name: "environment", type: "text", required: true, notes: "dev, staging, prod" },
        { name: "last_patched", type: "date", required: false, notes: "" },
      ],
    },
  },
  "terraform": {
    help: "One card per module: list its inputs (variables) and outputs. The agent will write variables.tf and outputs.tf to match exactly.",
    example: {
      name: "vpc",
      description: "Network module used by every environment",
      fields: [
        { name: "cidr_block", type: "string", required: true, notes: "input variable" },
        { name: "environment", type: "string", required: true, notes: "dev, staging, prod" },
        { name: "tags", type: "map(string)", required: false, notes: "input variable" },
        { name: "vpc_id", type: "string", required: true, notes: "output" },
      ],
    },
  },
  "cli-tool": {
    help: "Describe your config file keys and the output your tool guarantees. The agent will keep these stable so scripts that use your tool don't break.",
    example: {
      name: "ConfigFile",
      description: "Keys read from the .rc config file",
      fields: [
        { name: "output_format", type: "text", required: false, notes: "table or json" },
        { name: "verbose", type: "boolean", required: false, notes: "defaults to false" },
      ],
    },
  },
  "automation-cron": {
    help: "Describe what the job reads, what it writes, and any state it keeps between runs. The agent will make retries safe for exactly these shapes.",
    example: {
      name: "JobResult",
      description: "Record written after each run",
      fields: [
        { name: "run_id", type: "text", required: true, notes: "unique per run" },
        { name: "status", type: "text", required: true, notes: "success or failed" },
        { name: "processed_count", type: "number", required: true, notes: "" },
      ],
    },
  },
}

function RequiredToggle({
  checked,
  onToggle,
  label,
}: {
  checked: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      tabIndex={0}
      className={cn(
        "flex h-9 cursor-pointer select-none items-center justify-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        checked
          ? "border-primary/40 bg-primary/5 text-foreground"
          : "border-border bg-background/80 text-muted-foreground hover:border-primary/20 hover:text-foreground"
      )}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 bg-background"
        )}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-primary-foreground">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      Required
    </div>
  )
}

function TypeSelect({
  value,
  presets,
  onChange,
  label,
}: {
  value: string
  presets: string[]
  onChange: (v: string) => void
  label: string
}) {
  // Custom mode when the current value isn't a preset (and isn't empty).
  const isCustom = value !== "" && !presets.includes(value)
  const [customMode, setCustomMode] = useState(false)

  if (isCustom || customMode) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Custom type"
          aria-label={`${label} custom type`}
          className="h-9 rounded-lg bg-background/80"
        />
        <Button
          variant="ghost"
          size="sm"
          aria-label="Back to common types"
          title="Back to common types"
          className="h-9 w-8 shrink-0 p-0 text-muted-foreground"
          onClick={() => {
            setCustomMode(false)
            onChange("")
          }}
        >
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Select
      value={presets.includes(value) ? value : null}
      onValueChange={(v) => {
        if (v === "__custom") {
          setCustomMode(true)
          return
        }
        if (v != null) onChange(v)
      }}
    >
      <SelectTrigger className="h-9 w-full rounded-lg bg-background/80 text-sm" aria-label={`${label} type`}>
        <SelectValue placeholder="Type…" />
      </SelectTrigger>
      <SelectContent>
        {presets.map((t) => (
          <SelectItem key={t} value={t}>
            {t}
          </SelectItem>
        ))}
        <SelectItem value="__custom">Custom…</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function DataModelSection({
  data,
  projectType,
  onChange,
  preview,
}: {
  data: DataModelData
  projectType: ProjectType
  onChange: (patch: Partial<DataModelData>) => void
  preview?: string
}) {
  const profile = dataModelProfile(projectType)
  const guidance = GUIDANCE[projectType]
  const typePresets = projectType === "terraform" ? TERRAFORM_TYPES : GENERAL_TYPES
  const entities = data.entities
  const [showPreview, setShowPreview] = useState(false)
  const [relA, setRelA] = useState("")
  const [relKind, setRelKind] = useState("has many")
  const [relB, setRelB] = useState("")

  const setEntities = (next: DataEntity[]) => onChange({ entities: next })
  const addEntity = () => setEntities([...entities, { ...EMPTY_ENTITY, fields: [{ ...EMPTY_FIELD }] }])
  const addExample = () =>
    setEntities([...entities, { ...guidance.example, fields: guidance.example.fields.map((f) => ({ ...f })) }])
  const updateEntity = (index: number, patch: Partial<DataEntity>) => {
    const next = [...entities]
    next[index] = { ...next[index], ...patch }
    setEntities(next)
  }
  const removeEntity = (index: number) => setEntities(entities.filter((_, i) => i !== index))
  const updateField = (entityIndex: number, fieldIndex: number, patch: Partial<DataField>) => {
    const next = [...entities]
    const fields = [...next[entityIndex].fields]
    fields[fieldIndex] = { ...fields[fieldIndex], ...patch }
    next[entityIndex] = { ...next[entityIndex], fields }
    setEntities(next)
  }
  const addField = (entityIndex: number) => {
    const next = [...entities]
    next[entityIndex] = {
      ...next[entityIndex],
      fields: [...next[entityIndex].fields, { ...EMPTY_FIELD }],
    }
    setEntities(next)
  }
  const removeField = (entityIndex: number, fieldIndex: number) => {
    const next = [...entities]
    const fields = next[entityIndex].fields.filter((_, i) => i !== fieldIndex)
    next[entityIndex] = {
      ...next[entityIndex],
      fields: fields.length ? fields : [{ ...EMPTY_FIELD }],
    }
    setEntities(next)
  }

  // Deduplicated: relationships reference entities by name, so two entities
  // with the same name are one option (and duplicate keys break React).
  const namedEntities = Array.from(new Set(entities.map((e) => e.name.trim()).filter(Boolean)))
  const addRelationship = () => {
    if (!relA || !relB) return
    const line = `${relA} ${relKind} ${relB}`
    onChange({ relationships: data.relationships.trim() ? `${data.relationships.trimEnd()}\n${line}` : line })
  }

  return (
    <div className="flex flex-col gap-7">
      <SectionHeader
        title="Data Model"
        description="Optional — but it's the difference between the agent building your data shapes and the agent guessing them."
      />

      <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          What goes here?
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">{guidance.help}</p>
        <p className="text-xs text-muted-foreground/70">
          Exported as <code className="font-mono">data-model.md</code> — the agent treats it as the source
          of truth for every {profile.entityNoun}.
        </p>
      </div>

      {entities.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-card px-5 py-6">
          <p className="text-sm text-muted-foreground">
            Nothing here yet. The fastest way to learn the format is to start from an example and edit it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl" onClick={addExample}>
              <Sparkles className="mr-2 h-4 w-4" /> Start from an example ({guidance.example.name})
            </Button>
            <Button variant="outline" className="rounded-xl bg-transparent" onClick={addEntity}>
              <Plus className="mr-1 h-4 w-4" /> Start blank
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {entities.map((entity, entityIndex) => (
            <div key={entityIndex} className="flex flex-col gap-4 rounded-xl border border-border bg-card px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    value={entity.name}
                    onChange={(e) => updateEntity(entityIndex, { name: e.target.value })}
                    placeholder={`Name — e.g. ${guidance.example.name}`}
                    aria-label={`${profile.entityNoun} ${entityIndex + 1} name`}
                    className="h-10 rounded-lg bg-background/80"
                  />
                  <Input
                    value={entity.description}
                    onChange={(e) => updateEntity(entityIndex, { description: e.target.value })}
                    placeholder={`What is it? — e.g. ${guidance.example.description}`}
                    aria-label={`${profile.entityNoun} ${entityIndex + 1} description`}
                    className="h-10 rounded-lg bg-background/80"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove ${entity.name.trim() || profile.entityNoun}`}
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEntity(entityIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Field label={`${profile.fieldsLabel} rows`} hint="Name, type, whether it must always be present, and anything the agent should know.">
                <div className="flex flex-col gap-2">
                  {entity.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_180px_120px_1fr_auto]">
                      <Input
                        value={field.name}
                        onChange={(e) => updateField(entityIndex, fieldIndex, { name: e.target.value })}
                        placeholder={`Name — e.g. ${guidance.example.fields[0]?.name ?? "name"}`}
                        aria-label={`${profile.fieldsLabel} name`}
                        className="h-9 rounded-lg bg-background/80"
                      />
                      <TypeSelect
                        value={field.type}
                        presets={typePresets}
                        onChange={(type) => updateField(entityIndex, fieldIndex, { type })}
                        label={field.name.trim() || profile.fieldsLabel}
                      />
                      <RequiredToggle
                        checked={field.required}
                        label={`${field.name.trim() || profile.fieldsLabel} required`}
                        onToggle={() => updateField(entityIndex, fieldIndex, { required: !field.required })}
                      />
                      <Input
                        value={field.notes}
                        onChange={(e) => updateField(entityIndex, fieldIndex, { notes: e.target.value })}
                        placeholder="Notes — e.g. must be unique"
                        aria-label={`${profile.fieldsLabel} notes`}
                        className="h-9 rounded-lg bg-background/80"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove ${field.name.trim() || profile.fieldsLabel}`}
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeField(entityIndex, fieldIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addField(entityIndex)}
                    className="w-fit rounded-xl bg-transparent"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add field
                  </Button>
                </div>
              </Field>
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={addEntity} className="w-fit rounded-xl bg-transparent">
              <Plus className="mr-1 h-4 w-4" /> Add {profile.entityNoun}
            </Button>
            <Button variant="outline" onClick={addExample} className="w-fit rounded-xl bg-transparent text-primary hover:text-primary">
              <Sparkles className="mr-1 h-4 w-4" /> Insert example
            </Button>
          </div>
        </div>
      )}

      {projectType !== "terraform" ? (
        <Field
          label="Relationships"
          hint="How the pieces connect. Use the picker — it writes the line for you."
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={relA || null} onValueChange={(v) => v != null && setRelA(v)}>
                <SelectTrigger className="h-9 w-44 rounded-lg bg-card text-sm" aria-label="First item">
                  <SelectValue placeholder={namedEntities.length ? "Select…" : "Name items first"} />
                </SelectTrigger>
                <SelectContent>
                  {namedEntities.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={relKind} onValueChange={(v) => v != null && setRelKind(v)}>
                <SelectTrigger className="h-9 w-32 rounded-lg bg-card text-sm" aria-label="Relationship kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="has many">has many</SelectItem>
                  <SelectItem value="has one">has one</SelectItem>
                </SelectContent>
              </Select>
              <Select value={relB || null} onValueChange={(v) => v != null && setRelB(v)}>
                <SelectTrigger className="h-9 w-44 rounded-lg bg-card text-sm" aria-label="Second item">
                  <SelectValue placeholder={namedEntities.length ? "Select…" : "Name items first"} />
                </SelectTrigger>
                <SelectContent>
                  {namedEntities.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg bg-transparent"
                disabled={!relA || !relB}
                onClick={addRelationship}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add
              </Button>
            </div>
            <AreaField
              label="Relationship lines"
              value={data.relationships}
              onChange={(relationships) => onChange({ relationships })}
              placeholder={"One per line\nUser has many Project\nProject has one Owner"}
              hint="For web/API projects these lines also produce an ER diagram automatically."
              rows={3}
            />
          </div>
        </Field>
      ) : null}

      <AreaField
        label="Notes"
        value={data.notes}
        onChange={(notes) => onChange({ notes })}
        placeholder="Anything else the agent should know — retention rules, formats, validation limits…"
        rows={3}
      />

      {preview ? (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-fit rounded-xl bg-transparent"
            onClick={() => setShowPreview((p) => !p)}
            aria-expanded={showPreview}
          >
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? "Hide" : "Preview"} generated data-model.md
          </Button>
          {showPreview ? (
            <pre className="max-h-96 overflow-auto rounded-xl border border-border bg-card p-4 font-mono text-xs leading-relaxed">
              {preview}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
