"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { TechOption } from "@/lib/types"

interface StackCardProps {
  option: TechOption
  isSelected: boolean
  config: string
  onToggle: (techId: string, label: string, defaultConfig: string) => void
  onConfigChange: (techId: string, config: string) => void
}

export function StackCard({
  option,
  isSelected,
  config,
  onToggle,
  onConfigChange,
}: StackCardProps) {
  const toggle = () => onToggle(option.id, option.label, option.defaultConfig)

  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      aria-label={option.label}
      tabIndex={0}
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border px-4 py-3 transition-all cursor-pointer select-none outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isSelected
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/20 hover:bg-accent/30"
      )}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          toggle()
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className={cn(
            "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/40 bg-background"
          )}
        >
          {isSelected && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              className="text-primary-foreground"
            >
              <path
                d="M2.5 6L5 8.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          {option.label}
        </span>
      </div>

      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="ml-[30px]"
        >
          <Input
            value={config}
            onChange={(e) => onConfigChange(option.id, e.target.value)}
            placeholder={option.defaultConfig || "Configuration details…"}
            aria-label={`${option.label} configuration details`}
            className="h-8 rounded-lg border-border/60 bg-background/80 text-xs"
          />
        </div>
      )}
    </div>
  )
}
