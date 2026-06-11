import type { ContextState } from "./types"
import { isValidState, normalizeState } from "./use-persisted-state"

export interface DraftFile {
  app: "context-editor"
  version: 1
  exportedAt: string
  state: ContextState
  overrides: Record<string, string>
}

export function buildDraft(state: ContextState, overrides: Record<string, string>): DraftFile {
  return {
    app: "context-editor",
    version: 1,
    exportedAt: new Date().toISOString(),
    state,
    overrides,
  }
}

export function draftFileName(state: ContextState): string {
  const slug = state.idea.projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `${slug || "context-editor"}-draft.json`
}

export function downloadDraft(state: ContextState, overrides: Record<string, string>) {
  const blob = new Blob([JSON.stringify(buildDraft(state, overrides), null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = draftFileName(state)
  a.click()
  URL.revokeObjectURL(url)
}

export function parseDraft(text: string): {
  state: ContextState
  overrides: Record<string, string>
} {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("This file is not valid JSON.")
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("This file does not contain a Context Editor draft.")
  }
  const draft = parsed as Partial<DraftFile>
  if (draft.app !== "context-editor" || !isValidState(draft.state, "context-editor-state")) {
    throw new Error("This file does not contain a Context Editor draft.")
  }
  const overrides: Record<string, string> = {}
  if (draft.overrides && typeof draft.overrides === "object" && !Array.isArray(draft.overrides)) {
    for (const [name, content] of Object.entries(draft.overrides)) {
      if (typeof content === "string") overrides[name] = content
    }
  }
  return { state: normalizeState(draft.state), overrides }
}
