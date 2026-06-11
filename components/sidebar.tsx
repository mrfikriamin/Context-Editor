"use client"

import { Sparkles, Check } from "lucide-react"
import { SECTIONS, type SectionId } from "@/lib/types"
import { cn } from "@/lib/utils"

export function Sidebar({
  active,
  onSelect,
  completed,
  disabledSteps = {},
}: {
  active: SectionId
  onSelect: (id: SectionId) => void
  completed: Record<SectionId, boolean>
  disabledSteps?: Partial<Record<SectionId, string>>
}) {
  // Number only the enabled steps so the sidebar matches the footer's "Step X of N".
  let stepNumber = 0
  const numbered = SECTIONS.map((s) => {
    const disabled = !!disabledSteps[s.id]
    if (!disabled) stepNumber += 1
    return { ...s, disabled, number: disabled ? null : stepNumber }
  })

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 border-b border-border bg-sidebar px-5 py-4 md:min-h-screen md:w-64 md:gap-8 md:border-b-0 md:border-r md:py-7">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Context Editor</span>
      </div>

      <nav
        aria-label="Wizard steps"
        className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible"
      >
        {numbered.map((s) => {
          const isActive = s.id === active

          return (
            <button
              key={s.id}
              disabled={s.disabled}
              aria-current={isActive ? "step" : undefined}
              title={s.disabled ? disabledSteps[s.id] : undefined}
              onClick={() => onSelect(s.id)}
              className={cn(
                "group flex shrink-0 items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                s.disabled
                  ? "cursor-not-allowed opacity-40"
                  : isActive
                    ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium",
                    !s.disabled && isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {s.number ?? "-"}
                </span>
                <span className="flex flex-col">
                  <span className="whitespace-nowrap">{s.label}</span>
                  {s.disabled && (
                    <span className="hidden text-[10px] leading-tight text-muted-foreground md:block">
                      {disabledSteps[s.id]}
                    </span>
                  )}
                </span>
              </span>
              {completed[s.id] && !s.disabled && s.id !== "export" ? (
                <Check className="h-4 w-4 text-primary" aria-label="Completed" />
              ) : null}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
