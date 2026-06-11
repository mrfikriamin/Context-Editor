"use client"

import { useMemo, useState } from "react"
import type { ContextState, GeneratedFile } from "@/lib/types"
import { generateFiles, packManifest } from "@/lib/generate"
import { SectionHeader } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, Copy, Check, Package, Pencil, RotateCcw } from "lucide-react"
import { buildDraft } from "@/lib/draft-io"
import { cn } from "@/lib/utils"

function download(name: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

// Local heuristic (~4 chars/token) — indicative only, no API calls.
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function ExportSection({
  state,
  overrides,
  setOverrides,
}: {
  state: ContextState
  overrides: Record<string, string>
  setOverrides: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  const generated = useMemo(() => generateFiles(state), [state])
  const fileCount = generated.length
  const [activeName, setActiveName] = useState(generated[0].name)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  const files: GeneratedFile[] = generated.map((f) => ({
    ...f,
    content: overrides[f.name] ?? f.content,
  }))
  const active = files.find((f) => f.name === activeName) ?? files[0]
  const selectedFiles = files.filter((f) => selected[f.name])

  const toggle = (name: string) =>
    setSelected((s) => ({ ...s, [name]: !s[name] }))

  const downloadZip = async (toZip: GeneratedFile[], withManifest = false) => {
    const JSZip = (await import("jszip")).default
    const zip = new JSZip()
    const folder = zip.folder("context-pack")!
    if (withManifest) {
      folder.file("AGENTS.md", packManifest(state))
      // Re-importable backup of the editor state that produced this pack.
      folder.file("draft.json", JSON.stringify(buildDraft(state, overrides), null, 2))
    }
    toZip.forEach((f) => folder.file(f.name, f.content))
    const blob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "context-pack.zip"
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadSelected = () => {
    if (selectedFiles.length === 1) {
      download(selectedFiles[0].name, selectedFiles[0].content)
    } else {
      downloadZip(selectedFiles)
    }
  }

  const copyActive = async () => {
    const ok = await copyText(active.content)
    setCopyError(!ok)
    setCopied(ok)
    setTimeout(() => {
      setCopied(false)
      setCopyError(false)
    }, 1500)
  }

  const copySelected = async () => {
    const ok = await copyText(
      selectedFiles.map((f) => `<!-- ${f.name} -->\n\n${f.content}`).join("\n\n---\n\n")
    )
    setCopyError(!ok)
    if (!ok) setTimeout(() => setCopyError(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Export"
        description={`${fileCount} context files. Inspect, edit, and download as individual .md files or a zipped context pack.`}
      />

      <div className="flex flex-wrap gap-3">
        <Button className="rounded-xl" onClick={() => downloadZip(files, true)}>
          <Package className="mr-2 h-4 w-4" /> Download all (.zip)
        </Button>
        <Button
          variant="outline"
          className="rounded-xl bg-transparent"
          disabled={selectedFiles.length === 0}
          onClick={downloadSelected}
        >
          <Download className="mr-2 h-4 w-4" /> Download selected
        </Button>
        <Button
          variant="outline"
          className="rounded-xl bg-transparent"
          disabled={selectedFiles.length === 0}
          onClick={copySelected}
        >
          <Copy className="mr-2 h-4 w-4" /> Copy selected
        </Button>
      </div>

      {copyError ? (
        <p role="alert" className="text-xs text-destructive">
          Could not access the clipboard. Copy the content manually from the preview.
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Pack size: ≈{estimateTokens(files.map((f) => f.content).join("")).toLocaleString()} tokens
        across {files.length} files (estimated locally at ~4 chars/token — no API calls).
      </p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-1.5">
          {files.map((f) => (
            <div
              key={f.name}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                f.name === activeName
                  ? "border-primary/40 bg-accent/60"
                  : "border-transparent hover:bg-muted"
              )}
            >
              <input
                type="checkbox"
                checked={!!selected[f.name]}
                onChange={() => toggle(f.name)}
                className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                aria-label={`Select ${f.name}`}
              />
              <button
                onClick={() => {
                  setActiveName(f.name)
                  setEditing(false)
                }}
                aria-current={f.name === activeName ? "true" : undefined}
                className="flex min-w-0 flex-1 flex-col text-left"
              >
                <span className="truncate font-mono text-sm font-medium">{f.name}</span>
                <span className="text-xs text-muted-foreground">{f.group}</span>
              </button>
              {overrides[f.name] !== undefined ? (
                <span className="text-xs font-medium text-primary">edited</span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-mono text-sm font-semibold">{active.name}</span>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "mr-1 text-xs",
                  estimateTokens(active.content) > 2500 ? "text-destructive" : "text-muted-foreground"
                )}
                title={
                  estimateTokens(active.content) > 2500
                    ? "Large for a single context file — consider trimming repetition"
                    : "Estimated locally at ~4 chars/token"
                }
              >
                {active.content.length} chars · ≈{estimateTokens(active.content).toLocaleString()} tok
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg"
                onClick={copyActive}
                aria-label={`Copy ${active.name} content`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg"
                onClick={() => setEditing((e) => !e)}
                aria-label={`Edit ${active.name}`}
                aria-pressed={editing}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {overrides[active.name] !== undefined ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() =>
                    setOverrides((o) => {
                      const next = { ...o }
                      delete next[active.name]
                      return next
                    })
                  }
                  title="Reset to generated"
                  aria-label={`Reset ${active.name} to generated content`}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg"
                onClick={() => download(active.name, active.content)}
                aria-label={`Download ${active.name}`}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {editing ? (
            <Textarea
              value={active.content}
              onChange={(e) =>
                setOverrides((o) => ({ ...o, [active.name]: e.target.value }))
              }
              rows={24}
              spellCheck={false}
              aria-label={`Markdown content of ${active.name}`}
              className="resize-y rounded-xl bg-card font-mono text-xs leading-relaxed"
            />
          ) : (
            <pre className="max-h-[36rem] overflow-auto rounded-xl border border-border bg-card p-4 font-mono text-xs leading-relaxed">
              {active.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
