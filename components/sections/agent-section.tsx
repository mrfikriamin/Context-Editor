"use client"

import type { AgentData, DesktopFramework, ProjectType } from "@/lib/types"
import { getAgentPreset } from "@/lib/types"
import { SectionHeader, TextField, AreaField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

export function AgentSection({
  data,
  onChange,
  projectType,
  framework,
}: {
  data: AgentData
  onChange: (patch: Partial<AgentData>) => void
  projectType: ProjectType
  framework?: DesktopFramework
}) {
  const preset = getAgentPreset(projectType, framework)

  return (
    <div className="flex flex-col gap-7">
      <SectionHeader
        title="Agent"
        description="Instructions for the implementation agent. Feeds code-standards.md."
      />

      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Suggested preset for {projectType.replace(/-/g, " ")}
          </span>
          <span className="text-xs text-muted-foreground">
            Role: {preset.role}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl bg-transparent"
          onClick={() => onChange({
            role: preset.role,
            principles: preset.principles,
            verificationCommands: preset.verificationCommands,
            definitionOfDone: preset.definitionOfDone,
          })}
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Apply preset
        </Button>
      </div>

      <TextField
        label="Agent role"
        value={data.role}
        onChange={(v) => onChange({ role: v })}
        placeholder={preset.role}
      />
      <AreaField
        label="Agent principles"
        value={data.principles}
        onChange={(v) => onChange({ principles: v })}
        placeholder={preset.principles}
        rows={5}
      />
      <AreaField
        label="Verification commands"
        value={data.verificationCommands}
        onChange={(v) => onChange({ verificationCommands: v })}
        placeholder={preset.verificationCommands}
        hint="One command per line."
        rows={5}
      />
      <AreaField
        label="Definition of done"
        value={data.definitionOfDone}
        onChange={(v) => onChange({ definitionOfDone: v })}
        placeholder={preset.definitionOfDone}
        rows={5}
      />
    </div>
  )
}
