"use client"

import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { RejectedLib } from "@/lib/types"

interface RejectedLibrariesProps {
  items: RejectedLib[]
  onChange: (items: RejectedLib[]) => void
}

export function RejectedLibraries({ items, onChange }: RejectedLibrariesProps) {
  const addItem = () => onChange([...items, { library: "", why: "", alternative: "" }])

  const removeItem = (i: number) => {
    const next = [...items]
    next.splice(i, 1)
    onChange(next)
  }

  const update = (i: number, patch: Partial<RejectedLib>) => {
    const next = [...items]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center"
        >
          <Input
            value={item.library}
            onChange={(e) => update(i, { library: e.target.value })}
            placeholder="Library name"
            aria-label="Rejected library name"
            className="h-8 rounded-lg border-border/60 bg-background/80 text-sm sm:max-w-44"
          />
          <Input
            value={item.why}
            onChange={(e) => update(i, { why: e.target.value })}
            placeholder="Why rejected"
            aria-label={`Why ${item.library.trim() || "this library"} was rejected`}
            className="h-8 flex-1 rounded-lg border-border/60 bg-background/80 text-sm"
          />
          <Input
            value={item.alternative}
            onChange={(e) => update(i, { alternative: e.target.value })}
            placeholder="Alternative chosen"
            aria-label={`Alternative to ${item.library.trim() || "this library"}`}
            className="h-8 rounded-lg border-border/60 bg-background/80 text-sm sm:max-w-44"
          />
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Remove ${item.library.trim() || "rejected library"}`}
            className="h-7 w-7 shrink-0 self-end p-0 text-muted-foreground hover:text-destructive sm:self-auto"
            onClick={() => removeItem(i)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" onClick={addItem} className="w-fit rounded-xl bg-transparent">
        <Plus className="mr-1 h-4 w-4" /> Add rejected library
      </Button>
    </div>
  )
}
