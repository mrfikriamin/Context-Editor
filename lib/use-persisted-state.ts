"use client"

import { useState, useEffect } from "react"
import { DEFAULT_STATE } from "./types"
import type { ApiEndpoint, ContextState } from "./types"

function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base } as Record<string, unknown>
  for (const key of Object.keys(override)) {
    const b = base[key]
    const o = (override as Record<string, unknown>)[key]
    if (
      b && o && typeof b === "object" && typeof o === "object" &&
      !Array.isArray(b) && !Array.isArray(o)
    ) {
      result[key] = deepMerge(
        b as Record<string, unknown>,
        o as Record<string, unknown>
      )
    } else {
      result[key] = o
    }
  }
  return result as T
}

export function isValidState(parsed: unknown, key: string): boolean {
  if (!parsed || typeof parsed !== "object") return false
  const p = parsed as Record<string, unknown>
  if (key === "context-editor-state") {
    if (!("idea" in p)) return false
    if (p.stack && typeof p.stack === "object") {
      const stack = p.stack as Record<string, unknown>
      if (!("selected" in stack) || !Array.isArray(stack.selected)) return false
    }
    if (p.idea && typeof p.idea === "object") {
      const idea = p.idea as Record<string, unknown>
      if (!("projectType" in idea) || !("typeDetails" in idea)) return false
    }
    return true
  }
  if (key === "context-editor-step") return typeof parsed === "string"
  return true
}

function endpointFromLine(line: string): ApiEndpoint {
  const trimmed = line.trim()
  const match = trimmed.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(.+)$/i)
  if (!match) {
    return { method: "", path: trimmed, request: "", response: "", auth: "" }
  }
  return {
    method: match[1].toUpperCase(),
    path: match[2].trim(),
    request: "",
    response: "",
    auth: "",
  }
}

function normalizeEndpoints(value: unknown): ApiEndpoint[] {
  if (Array.isArray(value)) {
    return value.map((endpoint) => {
      if (!endpoint || typeof endpoint !== "object") {
        return { method: "", path: String(endpoint ?? ""), request: "", response: "", auth: "" }
      }
      const e = endpoint as Partial<Record<keyof ApiEndpoint, unknown>>
      return {
        method: typeof e.method === "string" ? e.method : "",
        path: typeof e.path === "string" ? e.path : "",
        request: typeof e.request === "string" ? e.request : "",
        response: typeof e.response === "string" ? e.response : "",
        auth: typeof e.auth === "string" ? e.auth : "",
      }
    })
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)
      .map(endpointFromLine)
  }
  return []
}

export function normalizeState(parsed: unknown): ContextState {
  const merged = deepMerge(
    DEFAULT_STATE as unknown as Record<string, unknown>,
    parsed as Record<string, unknown>
  ) as unknown as ContextState

  // Migrate legacy drafts where mvpFeatures was a string[].
  const features = merged.features as unknown as { mvpFeatures: unknown[] }
  if (Array.isArray(features?.mvpFeatures)) {
    features.mvpFeatures = features.mvpFeatures.map((f) =>
      typeof f === "string" ? { name: f, description: "" } : f
    )
  }

  // Older drafts predate rejectedLibraries.
  if (!Array.isArray(merged.stack.rejectedLibraries)) {
    merged.stack.rejectedLibraries = []
  }

  // Newer drafts include structured data-model and configuration rows.
  if (!Array.isArray(merged.dataModel.entities)) {
    merged.dataModel.entities = []
  }
  merged.dataModel.entities = merged.dataModel.entities.map((entity) => ({
    ...entity,
    fields: Array.isArray(entity.fields) ? entity.fields : [],
  }))
  if (!Array.isArray(merged.stack.configVariables)) {
    merged.stack.configVariables = []
  }
  if (typeof merged.stack.configNotes !== "string") {
    merged.stack.configNotes = ""
  }

  // API endpoint rows used to be a free-text textarea. Preserve every line.
  if (merged.idea.typeDetails.kind === "api-service") {
    merged.idea.typeDetails.details.endpoints = normalizeEndpoints(
      (merged.idea.typeDetails.details as unknown as { endpoints?: unknown }).endpoints
    )
  }

  return merged
}

export function usePersistedState<T>(key: string, fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(fallback)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (isValidState(parsed, key)) {
          if (key === "context-editor-state") {
            setState(normalizeState(parsed) as T)
          } else {
            setState(parsed as T)
          }
        }
      }
    } catch {}
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[usePersistedState] Failed to write "${key}":`, e)
      }
    }
  }, [key, state, hydrated])

  return [state, setState]
}
