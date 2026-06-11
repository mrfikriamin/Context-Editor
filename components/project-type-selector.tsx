"use client"

import { cn } from "@/lib/utils"
import type { ProjectType } from "@/lib/types"
import { PROJECT_TYPES } from "@/lib/types"

interface ProjectTypeSelectorProps {
  value: ProjectType
  onChange: (type: ProjectType) => void
}

export function ProjectTypeSelector({ value, onChange }: ProjectTypeSelectorProps) {
  return (
    <div role="group" aria-label="Project type" className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {PROJECT_TYPES.map((pt) => (
        <button
          key={pt.id}
          aria-pressed={value === pt.id}
          onClick={() => onChange(pt.id)}
          className={cn(
            "flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all",
            value === pt.id
              ? "border-primary/40 bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/20 hover:bg-accent/30"
          )}
        >
          <span
            className={cn(
              "text-sm font-medium",
              value === pt.id ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {pt.label}
          </span>
          <span className="text-xs text-muted-foreground">{pt.description}</span>
        </button>
      ))}
    </div>
  )
}
