"use client"

import { useEffect, useRef, useState } from "react"
import type { MermaidData } from "@/lib/types"
import { SectionHeader } from "@/components/form-field"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, FileCode, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const SAMPLES: { label: string; code: string }[] = [
  {
    label: "Flowchart",
    code: `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Do thing]
  B -->|No| D[Skip]
  C --> E[End]
  D --> E`,
  },
  {
    label: "Sequence",
    code: `sequenceDiagram
  participant U as User
  participant A as App
  participant DB as Database
  U->>A: Submit form
  A->>DB: Persist data
  DB-->>A: OK
  A-->>U: Confirmation`,
  },
  {
    label: "Class",
    code: `classDiagram
  class Project {
    +String name
    +String pitch
    +generate()
  }
  class ContextFile {
    +String name
    +String content
  }
  Project --> ContextFile`,
  },
  {
    label: "ER",
    code: `erDiagram
  PROJECT ||--o{ FEATURE : has
  PROJECT ||--o{ CONTEXT_FILE : exports
  FEATURE {
    string name
    string status
  }`,
  },
]

export function MermaidSection({
  data,
  onChange,
  starterCode,
}: {
  data: MermaidData
  onChange: (patch: Partial<MermaidData>) => void
  starterCode?: string
}) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [valid, setValid] = useState(true)

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      const mermaid = (await import("mermaid")).default
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "strict",
        fontFamily: "var(--font-mono)",
      })
      const code = data.code.trim()
      if (!code) {
        setError("Diagram is empty.")
        setValid(false)
        if (previewRef.current) previewRef.current.innerHTML = ""
        return
      }
      try {
        await mermaid.parse(code)
        const id = "mmd-" + Math.random().toString(36).slice(2)
        const { svg } = await mermaid.render(id, code)
        if (cancelled) return
        if (previewRef.current) previewRef.current.innerHTML = svg
        setError(null)
        setValid(true)
      } catch (e) {
        if (cancelled) return
        setValid(false)
        setError(e instanceof Error ? e.message : "Invalid Mermaid syntax.")
      }
    }
    const t = setTimeout(render, 350)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [data.code])

  return (
    <div className="flex flex-col gap-7">
      <SectionHeader
        title="Mermaid Editor"
        description="Write a diagram with live preview. It is automatically inserted into architecture.md and build-plan.md."
      />

      <div className="flex flex-wrap gap-2">
        {starterCode ? (
          <Button
            variant="outline"
            size="sm"
            title="Build a starter diagram from your project name, type, and MVP features (replaces the current diagram)"
            className="rounded-lg border-primary/40 bg-transparent text-primary hover:text-primary"
            onClick={() => onChange({ code: starterCode })}
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" /> Project starter
          </Button>
        ) : null}
        {SAMPLES.map((s) => (
          <Button
            key={s.label}
            variant="outline"
            size="sm"
            title={`Insert ${s.label} sample (replaces the current diagram)`}
            className="rounded-lg bg-transparent"
            onClick={() => onChange({ code: s.code })}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mermaid source code
            </span>
            <span
              role="status"
              aria-live="polite"
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                valid ? "text-primary" : "text-destructive"
              )}
            >
              {valid ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5" /> Invalid
                </>
              )}
            </span>
          </div>
          <Textarea
            value={data.code}
            onChange={(e) => onChange({ code: e.target.value })}
            rows={16}
            spellCheck={false}
            aria-label="Mermaid source code"
            className="resize-y rounded-xl bg-card font-mono text-sm leading-relaxed"
          />
          {error && !valid ? (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs leading-relaxed text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="font-mono">{error}</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Live preview
          </span>
          <div
            role="img"
            aria-label="Rendered Mermaid diagram preview"
            className="flex min-h-80 flex-1 items-center justify-center overflow-auto rounded-xl border border-border bg-card p-4"
          >
            <div ref={previewRef} className="w-full [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-accent/50 p-3 text-xs leading-relaxed text-accent-foreground">
        <FileCode className="h-4 w-4 shrink-0" />
        This diagram is embedded automatically in architecture.md and build-plan.md when you export.
      </div>
    </div>
  )
}
