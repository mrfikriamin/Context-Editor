"use client"

import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { OtherLibItem } from "@/lib/types"

interface OtherLibrariesProps {
  items: OtherLibItem[]
  onChange: (items: OtherLibItem[]) => void
}

export function OtherLibraries({ items, onChange }: OtherLibrariesProps) {
  const addItem = () => onChange([...items, { name: "", notes: "", checked: true }])

  const removeItem = (i: number) => {
    const next = [...items]
    next.splice(i, 1)
    onChange(next)
  }

  const update = (i: number, patch: Partial<OtherLibItem>) => {
    const next = [...items]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col gap-2 rounded-xl border px-4 py-3 transition-colors",
            item.checked
              ? "border-primary/40 bg-primary/5"
              : "border-border bg-card"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              role="checkbox"
              aria-checked={item.checked}
              aria-label={`Include ${item.name.trim() || "this library"} in the export`}
              tabIndex={0}
              className={cn(
                "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                item.checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/40 bg-background"
              )}
              onClick={() => update(i, { checked: !item.checked })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  update(i, { checked: !item.checked })
                }
              }}
            >
              {item.checked && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-primary-foreground" aria-hidden="true">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <Input
              value={item.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Library name"
              aria-label="Library name"
              className="h-8 flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
            />
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Remove ${item.name.trim() || "library"}`}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(i)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          {item.checked && (
            <Input
              value={item.notes}
              onChange={(e) => update(i, { notes: e.target.value })}
              placeholder="Optional notes (purpose, version, usage)…"
              aria-label={`Notes for ${item.name.trim() || "library"}`}
              className="ml-[30px] h-7 rounded-lg border-border/60 bg-background/80 text-xs"
            />
          )}
        </div>
      ))}
      <Button
        variant="outline"
        onClick={addItem}
        className="w-fit rounded-xl bg-transparent"
      >
        <Plus className="mr-1 h-4 w-4" /> Add library
      </Button>
    </div>
  )
}
