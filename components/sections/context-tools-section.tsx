"use client"

import type { ReactNode } from "react"
import type { ContextToolsData } from "@/lib/types"
import { DOC_INGESTION_TOOLS, GRAPH_TOOLS, LINT_TOOLS } from "@/lib/context-tools"
import type { ContextToolOption } from "@/lib/context-tools"
import { SectionHeader } from "@/components/form-field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

function ToggleCard({
  label,
  description,
  files,
  checked,
  onToggle,
  children,
}: {
  label: string
  description: string
  files: string
  checked: boolean
  onToggle: () => void
  children?: ReactNode
}) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      tabIndex={0}
      className={cn(
        "flex cursor-pointer select-none items-start gap-3 rounded-xl border px-4 py-3 transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        checked
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/20 hover:bg-accent/30"
      )}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <div
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors",
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
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn("text-sm font-medium", checked ? "text-foreground" : "text-muted-foreground")}>
          {label}
        </span>
        <span className="text-xs leading-relaxed text-muted-foreground">{description}</span>
        <span className="text-[11px] text-muted-foreground/70">Adds instructions to: {files}</span>
        {checked && children ? (
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="pt-2"
          >
            {children}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ToolPicker({
  label,
  options,
  value,
  custom,
  onValue,
  onCustom,
}: {
  label: string
  options: ContextToolOption[]
  value: string
  custom: string
  onValue: (v: string) => void
  onCustom: (v: string) => void
}) {
  const selected = options.find((o) => o.id === value)
  return (
    <div className="flex flex-col gap-2">
      <Select value={value} onValueChange={(v) => v != null && onValue(v)}>
        <SelectTrigger className="h-8 w-full rounded-lg bg-background/80 text-xs" aria-label={`${label} tool`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom…</SelectItem>
        </SelectContent>
      </Select>
      {value === "custom" ? (
        <Input
          value={custom}
          onChange={(e) => onCustom(e.target.value)}
          placeholder="Tool name — URL"
          aria-label={`${label} custom tool`}
          className="h-8 rounded-lg border-border/60 bg-background/80 text-xs"
        />
      ) : selected?.url ? (
        <a
          href={selected.url}
          target="_blank"
          rel="noreferrer"
          className="w-fit text-[11px] text-primary hover:underline"
        >
          {selected.url}
        </a>
      ) : null}
    </div>
  )
}

export function ContextToolsSection({
  data,
  onChange,
}: {
  data: ContextToolsData
  onChange: (patch: Partial<ContextToolsData>) => void
}) {
  return (
    <div className="flex flex-col gap-7">
      <SectionHeader
        title="Context Optimization"
        description="Optional, local-only tooling guidance for the implementation agent (Codex, Claude Code, Cursor, …). Nothing here adds AI or API calls — enabled options only add instructions to the generated files telling the agent which tool to use, when, and when not to."
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ToggleCard
          label="Document-to-markdown ingestion"
          description="Convert referenced PDFs, Office files, or technical notes into clean markdown context — only the sections the agent needs."
          files="library-docs.md, build-plan.md"
          checked={data.docIngestion}
          onToggle={() => onChange({ docIngestion: !data.docIngestion })}
        >
          <ToolPicker
            label="Document ingestion"
            options={DOC_INGESTION_TOOLS}
            value={data.docIngestionTool}
            custom={data.docIngestionCustom}
            onValue={(docIngestionTool) => onChange({ docIngestionTool })}
            onCustom={(docIngestionCustom) => onChange({ docIngestionCustom })}
          />
        </ToggleCard>

        <ToggleCard
          label="Codebase graph / report context"
          description="Generate architecture and dependency maps before refactors or when orienting in unfamiliar code."
          files="architecture.md, library-docs.md, build-plan.md"
          checked={data.codebaseGraph}
          onToggle={() => onChange({ codebaseGraph: !data.codebaseGraph })}
        >
          <ToolPicker
            label="Codebase graph"
            options={GRAPH_TOOLS}
            value={data.codebaseGraphTool}
            custom={data.codebaseGraphCustom}
            onValue={(codebaseGraphTool) => onChange({ codebaseGraphTool })}
            onCustom={(codebaseGraphCustom) => onChange({ codebaseGraphCustom })}
          />
        </ToggleCard>

        <ToggleCard
          label="Mermaid validation"
          description="Validate diagrams with mermaid-cli after editing them, instead of trusting unrendered syntax."
          files="library-docs.md, build-plan.md"
          checked={data.mermaidValidation}
          onToggle={() => onChange({ mermaidValidation: !data.mermaidValidation })}
        />

        <ToggleCard
          label="Markdown linting"
          description="Keep the context files themselves clean and consistently structured after edits."
          files="library-docs.md, progress-tracker.md"
          checked={data.markdownLinting}
          onToggle={() => onChange({ markdownLinting: !data.markdownLinting })}
        >
          <ToolPicker
            label="Markdown lint"
            options={LINT_TOOLS}
            value={data.lintTool}
            custom={data.lintCustom}
            onValue={(lintTool) => onChange({ lintTool })}
            onCustom={(lintCustom) => onChange({ lintCustom })}
          />
        </ToggleCard>

        <ToggleCard
          label="Token budget guidance"
          description="Token-discipline rules: smallest useful context, tables over prose, size checks when files grow or repeat themselves."
          files="project-overview.md, code-standards.md, library-docs.md, progress-tracker.md"
          checked={data.tokenBudget}
          onToggle={() => onChange({ tokenBudget: !data.tokenBudget })}
        />

        <ToggleCard
          label="Compact agent instructions"
          description="Trim explanatory intro prose from generated files so the pack spends tokens on facts, not framing."
          files="all files"
          checked={data.compactInstructions}
          onToggle={() => onChange({ compactInstructions: !data.compactInstructions })}
        />
      </div>

      <div className="rounded-xl bg-accent/50 p-3 text-xs leading-relaxed text-accent-foreground">
        Everything here is optional. Disabled tools simply don&apos;t appear in the export — the context
        files are always complete either way. The app never runs these tools itself; it embeds your
        selection (name, link, command) so the agent and your team know exactly what to use.
      </div>
    </div>
  )
}
