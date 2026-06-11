"use client"

import { useMemo, useRef } from "react"
import { ChevronLeft, ChevronRight, Download, Upload } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { IdeaSection } from "@/components/sections/idea-section"
import { MermaidSection } from "@/components/sections/mermaid-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { DataModelSection } from "@/components/sections/data-section"
import { StackSection } from "@/components/sections/stack-section"
import { LookSection } from "@/components/sections/look-section"
import { ContextToolsSection } from "@/components/sections/context-tools-section"
import { AgentSection } from "@/components/sections/agent-section"
import { ExportSection } from "@/components/sections/export-section"
import {
  DEFAULT_STATE,
  SECTIONS,
  isUIProject,
  getAgentPreset,
  type ContextState,
  type IdeaData,
  type SectionId,
  type ProjectType,
} from "@/lib/types"
import { generateFiles, starterDiagram } from "@/lib/generate"
import { usePersistedState } from "@/lib/use-persisted-state"
import { downloadDraft, parseDraft } from "@/lib/draft-io"

function getDisabledSteps(projectType: ProjectType): Partial<Record<SectionId, string>> {
  if (isUIProject(projectType)) return {}
  return {
    look: "Not applicable for this project type",
  }
}

function getEnabledSections(disabled: Partial<Record<SectionId, string>>) {
  return SECTIONS.filter((s) => !disabled[s.id])
}

export default function Home() {
  const [state, setState] = usePersistedState<ContextState>("context-editor-state", DEFAULT_STATE)
  const [active, setActive] = usePersistedState<SectionId>("context-editor-step", "idea")
  const [overrides, setOverrides] = usePersistedState<Record<string, string>>(
    "context-editor-overrides",
    {}
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const saveDraft = () => downloadDraft(state, overrides)

  const importDraft = async (file: File) => {
    let draft: ReturnType<typeof parseDraft>
    try {
      draft = parseDraft(await file.text())
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not read this draft file.")
      return
    }
    const hasWork = JSON.stringify(state) !== JSON.stringify(DEFAULT_STATE)
    if (hasWork && !confirm("Importing will replace your current draft. Continue?")) return
    setState(draft.state)
    setOverrides(draft.overrides)
  }

  const showUI = isUIProject(state.idea?.projectType ?? "full-application")
  const disabledSteps = useMemo(() => getDisabledSteps(state.idea?.projectType ?? "full-application"), [state.idea?.projectType])
  const enabledSections = useMemo(() => getEnabledSections(disabledSteps), [disabledSteps])

  const patch =
    <K extends keyof ContextState>(key: K) =>
    (p: Partial<ContextState[K]>) =>
      setState((s) => ({ ...s, [key]: { ...s[key], ...p } }))

  // When the project type (or the desktop framework within it) changes and the
  // agent step is still on the previous preset (untouched by the user), follow it
  // to the new preset so script projects don't export npm commands and Qt projects
  // don't export Electron verification steps.
  const patchIdea = (p: Partial<IdeaData>) =>
    setState((s) => {
      const next = { ...s, idea: { ...s.idea, ...p } }
      const prevFramework =
        s.idea.typeDetails.kind === "desktop-application" ? s.idea.typeDetails.details.framework : undefined
      const nextFramework =
        next.idea.typeDetails.kind === "desktop-application" ? next.idea.typeDetails.details.framework : undefined
      const typeChanged = !!p.projectType && p.projectType !== s.idea.projectType
      const frameworkChanged = !typeChanged && !!prevFramework && !!nextFramework && prevFramework !== nextFramework
      if (typeChanged || frameworkChanged) {
        const prev = getAgentPreset(s.idea.projectType, prevFramework)
        const untouched =
          s.agent.role === prev.role &&
          s.agent.principles === prev.principles &&
          s.agent.verificationCommands === prev.verificationCommands &&
          s.agent.definitionOfDone === prev.definitionOfDone
        if (untouched) next.agent = { ...getAgentPreset(next.idea.projectType, nextFramework) }
      }
      // The default stack is a web preset. If it's still untouched when the user
      // leaves full-application, drop it so Qt/script packs don't claim Zod,
      // Vitest, or Vercel; restore it if they come back with nothing selected.
      if (typeChanged) {
        const defaultSelected = JSON.stringify(DEFAULT_STATE.stack.selected)
        if (p.projectType !== "full-application" && JSON.stringify(s.stack.selected) === defaultSelected) {
          next.stack = { ...s.stack, selected: [] }
        } else if (p.projectType === "full-application" && s.stack.selected.length === 0) {
          next.stack = { ...s.stack, selected: JSON.parse(defaultSelected) }
        }
      }
      return next
    })

  const completed: Record<SectionId, boolean> = {
    idea: !!state.idea.projectName.trim() && !!state.idea.pitch.trim(),
    mermaid: !!state.mermaid.code.trim(),
    features: state.features.mvpFeatures.some((f) => f.name.trim()),
    data: state.dataModel.entities.some((entity) => entity.name.trim()),
    stack: Array.isArray(state.stack?.selected) && state.stack.selected.length > 0,
    look: !!state.look.brandAdjectives.trim(),
    context: Object.values(state.contextTools ?? {}).some(Boolean),
    agent: !!state.agent.role.trim(),
    export: false,
  }

  const safeActive = enabledSections.some((s) => s.id === active) ? active : enabledSections[0].id
  const idx = enabledSections.findIndex((s) => s.id === safeActive)
  const prev = enabledSections[idx - 1]
  const next = enabledSections[idx + 1]

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <Sidebar
        active={safeActive}
        onSelect={setActive}
        completed={completed}
        disabledSteps={disabledSteps}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:justify-between md:px-10">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Generates 10 AI-ready context files. No AI calls - everything is built from your inputs.
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl bg-transparent md:flex-none"
                onClick={saveDraft}
              >
                <Download className="mr-2 h-4 w-4" /> Save draft
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl bg-transparent md:flex-none"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Import draft
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                aria-label="Import draft file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void importDraft(file)
                  e.target.value = ""
                }}
              />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 md:px-10">
          {safeActive === "idea" && <IdeaSection data={state.idea} onChange={patchIdea} />}
          {safeActive === "mermaid" && (
            <MermaidSection
              data={state.mermaid}
              onChange={patch("mermaid")}
              starterCode={starterDiagram(state)}
            />
          )}
          {safeActive === "features" && (
            <FeaturesSection data={state.features} onChange={patch("features")} />
          )}
          {safeActive === "data" && (
            <DataModelSection
              data={state.dataModel}
              projectType={state.idea?.projectType ?? "full-application"}
              onChange={patch("dataModel")}
              preview={generateFiles(state).find((f) => f.name === "data-model.md")?.content}
            />
          )}
          {safeActive === "stack" && <StackSection data={state.stack} onChange={patch("stack")} projectType={state.idea?.projectType ?? "full-application"} />}
          {safeActive === "look" && showUI && (
            <LookSection data={state.look} onChange={patch("look")} />
          )}
          {safeActive === "context" && (
            <ContextToolsSection data={state.contextTools} onChange={patch("contextTools")} />
          )}
          {safeActive === "agent" && (
            <AgentSection
              data={state.agent}
              onChange={patch("agent")}
              projectType={state.idea?.projectType ?? "full-application"}
              framework={
                state.idea?.typeDetails.kind === "desktop-application"
                  ? state.idea.typeDetails.details.framework
                  : undefined
              }
            />
          )}
          {safeActive === "export" && (
            <ExportSection state={state} overrides={overrides} setOverrides={setOverrides} />
          )}
        </main>

        <footer className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4 md:px-10">
            <Button
              variant="outline"
              className="rounded-xl bg-transparent"
              disabled={!prev}
              onClick={() => prev && setActive(prev.id)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <span className="text-sm text-muted-foreground">
              Step {idx + 1} of {enabledSections.length}
            </span>
            <Button
              className="rounded-xl"
              disabled={!next}
              onClick={() => next && setActive(next.id)}
            >
              {next?.id === "export" ? "Generate files" : "Continue"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
