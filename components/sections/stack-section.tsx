"use client"

import type { ConfigVariable, StackData, ProjectType } from "@/lib/types"
import { isUIProject } from "@/lib/types"
import { AreaField, Field, SectionHeader } from "@/components/form-field"
import { StackCard } from "@/components/stack-card"
import { OtherLibraries } from "@/components/other-libraries"
import { RejectedLibraries } from "@/components/rejected-libraries"
import { STACK_CATEGORIES, TECH_OPTIONS } from "@/lib/stack-options"
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

const EMPTY_CONFIG: ConfigVariable = {
  name: "",
  required: false,
  source: "",
  defaultValue: "",
  visibility: "internal",
  usedBy: "",
  notes: "",
}

function ConfigVariables({
  items,
  notes,
  onItemsChange,
  onNotesChange,
}: {
  items: ConfigVariable[]
  notes: string
  onItemsChange: (items: ConfigVariable[]) => void
  onNotesChange: (notes: string) => void
}) {
  const addItem = () => onItemsChange([...items, { ...EMPTY_CONFIG }])
  const removeItem = (index: number) => onItemsChange(items.filter((_, i) => i !== index))
  const update = (index: number, patch: Partial<ConfigVariable>) => {
    const next = [...items]
    next[index] = { ...next[index], ...patch }
    onItemsChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Configuration variables" hint="Used by architecture.md as the single source of truth for env vars, public config, and secrets.">
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_140px_auto]">
                <Input
                  value={item.name}
                  onChange={(e) => update(index, { name: e.target.value })}
                  placeholder="VARIABLE_NAME"
                  aria-label={`Configuration variable ${index + 1} name`}
                  className="h-9 rounded-lg bg-background/80"
                />
                <div
                  role="checkbox"
                  aria-checked={item.required}
                  tabIndex={0}
                  aria-label={`${item.name.trim() || "Configuration variable"} required`}
                  className="flex h-9 cursor-pointer select-none items-center justify-center rounded-lg border border-border bg-background/80 px-3 text-xs font-medium text-muted-foreground outline-none transition-colors hover:border-primary/20 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={() => update(index, { required: !item.required })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      update(index, { required: !item.required })
                    }
                  }}
                >
                  {item.required ? "Required" : "Optional"}
                </div>
                <Select
                  value={item.visibility}
                  onValueChange={(visibility) =>
                    update(index, { visibility: visibility as ConfigVariable["visibility"] })
                  }
                >
                  <SelectTrigger className="h-9 rounded-lg bg-background/80" aria-label={`Configuration variable ${index + 1} visibility`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="secret">Secret</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove ${item.name.trim() || "configuration variable"}`}
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <Input
                  value={item.source}
                  onChange={(e) => update(index, { source: e.target.value })}
                  placeholder="Source"
                  aria-label={`Configuration variable ${index + 1} source`}
                  className="h-8 rounded-lg border-border/60 bg-background/80 text-xs"
                />
                <Input
                  value={item.defaultValue}
                  onChange={(e) => update(index, { defaultValue: e.target.value })}
                  placeholder="Default"
                  aria-label={`Configuration variable ${index + 1} default`}
                  className="h-8 rounded-lg border-border/60 bg-background/80 text-xs"
                />
                <Input
                  value={item.usedBy}
                  onChange={(e) => update(index, { usedBy: e.target.value })}
                  placeholder="Used by"
                  aria-label={`Configuration variable ${index + 1} used by`}
                  className="h-8 rounded-lg border-border/60 bg-background/80 text-xs"
                />
                <Input
                  value={item.notes}
                  onChange={(e) => update(index, { notes: e.target.value })}
                  placeholder="Notes"
                  aria-label={`Configuration variable ${index + 1} notes`}
                  className="h-8 rounded-lg border-border/60 bg-background/80 text-xs"
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addItem} className="w-fit rounded-xl bg-transparent">
            <Plus className="mr-1 h-4 w-4" /> Add config variable
          </Button>
        </div>
      </Field>
      <AreaField
        label="Configuration notes"
        value={notes}
        onChange={onNotesChange}
        placeholder="Config precedence, required deployment settings, local development notes..."
        rows={3}
      />
    </div>
  )
}

export function StackSection({
  data,
  onChange,
  projectType = "full-application",
}: {
  data: StackData
  onChange: (patch: Partial<StackData>) => void
  projectType?: ProjectType
}) {
  const showUI = isUIProject(projectType)
  const showStackConfig = projectType === "full-application" || projectType === "api-service"

  const hiddenCategories = new Set<string>()
  if (!showUI) {
    hiddenCategories.add("frontend")
  }

  const toggle = (techId: string, label: string, defaultConfig: string) => {
    const exists = data.selected.find((t) => t.techId === techId)
    if (exists) {
      onChange({ selected: data.selected.filter((t) => t.techId !== techId) })
    } else {
      onChange({
        selected: [...data.selected, { techId, label, config: defaultConfig }],
      })
    }
  }

  const updateConfig = (techId: string, config: string) => {
    onChange({
      selected: data.selected.map((t) =>
        t.techId === techId ? { ...t, config } : t
      ),
    })
  }

  const selectedIds = new Set(data.selected.map((t) => t.techId))
  const getConfig = (techId: string) =>
    data.selected.find((t) => t.techId === techId)?.config ?? ""

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        title="Stack"
        description="Select technologies for your project. Multiple options per category are allowed. Customize configurations as needed."
      />

      {!showUI && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
          Frontend categories are hidden because this is a non-UI project. UI-related technologies are not applicable.
        </div>
      )}

      {showStackConfig && (
        <ConfigVariables
          items={data.configVariables ?? []}
          notes={data.configNotes ?? ""}
          onItemsChange={(configVariables) => onChange({ configVariables })}
          onNotesChange={(configNotes) => onChange({ configNotes })}
        />
      )}

      {STACK_CATEGORIES
        .filter((cat) => cat.id !== "other" && !hiddenCategories.has(cat.id))
        .map((cat) => {
          const options = TECH_OPTIONS[cat.id] ?? []
          if (options.length === 0) return null

          const catSelected = data.selected.filter((t) =>
            options.some((o) => o.id === t.techId)
          )

          return (
            <div key={cat.id} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {cat.label}
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    {cat.description}
                  </span>
                </div>
                {catSelected.length > 0 && (
                  <span className="text-xs font-medium text-primary">
                    {catSelected.length} selected
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {options.map((opt) => (
                  <StackCard
                    key={opt.id}
                    option={opt}
                    isSelected={selectedIds.has(opt.id)}
                    config={getConfig(opt.id)}
                    onToggle={toggle}
                    onConfigChange={updateConfig}
                  />
                ))}
              </div>
            </div>
          )
        })}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Other Libraries
          </span>
          <span className="text-xs text-muted-foreground/70">
            Additional libraries and tools used in the project
          </span>
        </div>
        <OtherLibraries
          items={data.otherLibraries}
          onChange={(otherLibraries) => onChange({ otherLibraries })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Rejected / Deferred Libraries
          </span>
          <span className="text-xs text-muted-foreground/70">
            Libraries you considered and ruled out — exported to library-docs.md so agents don&apos;t re-introduce them
          </span>
        </div>
        <RejectedLibraries
          items={data.rejectedLibraries ?? []}
          onChange={(rejectedLibraries) => onChange({ rejectedLibraries })}
        />
      </div>
    </div>
  )
}
