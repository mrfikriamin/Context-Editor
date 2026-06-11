"use client"

import { useRef } from "react"
import type { IdeaData, ProjectType, TypeDetails } from "@/lib/types"
import { SectionHeader, TextField, AreaField, Field } from "@/components/form-field"
import { ProjectTypeSelector } from "@/components/project-type-selector"
import { TypeDetailsPanel, defaultTypeDetails } from "@/components/type-details-panel"

export function IdeaSection({
  data,
  onChange,
}: {
  data: IdeaData
  onChange: (patch: Partial<IdeaData>) => void
}) {
  // Remember details per project type so switching types doesn't destroy entered data.
  const detailsCache = useRef<Partial<Record<ProjectType, TypeDetails>>>({})

  const handleTypeChange = (projectType: ProjectType) => {
    if (projectType === data.projectType) return
    detailsCache.current[data.projectType] = data.typeDetails
    onChange({
      projectType,
      typeDetails: detailsCache.current[projectType] ?? defaultTypeDetails(projectType),
    })
  }

  const showTypeDetails = data.projectType !== "full-application"

  return (
    <div className="flex flex-col gap-7">
      <SectionHeader
        title="Idea"
        description="Capture the core intent of the project. Select a project type, then fill in the details."
      />

      <Field label="Project type">
        <ProjectTypeSelector value={data.projectType} onChange={handleTypeChange} />
      </Field>

      {showTypeDetails && (
        <div className="flex flex-col gap-5 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {data.projectType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} details
            </span>
            <span className="text-xs text-muted-foreground">
              Configuration specific to your {data.projectType.replace(/-/g, " ")} project
            </span>
          </div>
          <TypeDetailsPanel
            value={data.typeDetails}
            onChange={(typeDetails) => onChange({ typeDetails })}
          />
        </div>
      )}

      <TextField
        label="Project name"
        value={data.projectName}
        onChange={(v) => onChange({ projectName: v })}
        placeholder="Cloud Cost Monitoring Dashboard"
      />
      <TextField
        label="One-line pitch"
        value={data.pitch}
        onChange={(v) => onChange({ pitch: v })}
        placeholder="A web dashboard that helps teams monitor daily cloud spending."
      />
      <AreaField
        label="Problem statement"
        value={data.problem}
        onChange={(v) => onChange({ problem: v })}
        placeholder="Describe the problem this project solves..."
        rows={5}
      />
      <TextField
        label="Target users"
        value={data.targetUsers}
        onChange={(v) => onChange({ targetUsers: v })}
        placeholder="Cloud engineers, DevOps teams, FinOps teams..."
      />
      <AreaField
        label="Success criteria"
        value={data.successCriteria}
        onChange={(v) => onChange({ successCriteria: v })}
        placeholder="How will you know the MVP is working?"
        rows={5}
      />
      <AreaField
        label="Constraints"
        value={data.constraints}
        onChange={(v) => onChange({ constraints: v })}
        placeholder={"One constraint per line\nNo AI calls\nOffline first"}
        hint="One per line — rendered as a list in the export."
        rows={4}
      />
    </div>
  )
}
