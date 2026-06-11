"use client"

import { useId } from "react"
import type { FeaturesData, MvpFeature } from "@/lib/types"
import { SectionHeader, AreaField, Field } from "@/components/form-field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"

export function FeaturesSection({
  data,
  onChange,
}: {
  data: FeaturesData
  onChange: (patch: Partial<FeaturesData>) => void
}) {
  const idBase = useId()
  const setFeature = (i: number, patch: Partial<MvpFeature>) => {
    const next = [...data.mvpFeatures]
    next[i] = { ...next[i], ...patch }
    onChange({ mvpFeatures: next })
  }
  const addFeature = () =>
    onChange({ mvpFeatures: [...data.mvpFeatures, { name: "", description: "" }] })
  const removeLast = () => {
    if (data.mvpFeatures.length <= 1) return
    onChange({ mvpFeatures: data.mvpFeatures.slice(0, -1) })
  }

  return (
    <div className="flex flex-col gap-7">
      <SectionHeader
        title="Features"
        description="Define MVP scope, what's out of scope, and known risks. Feeds build-plan.md and progress-tracker.md."
      />

      <div className="flex flex-col gap-5">
        {data.mvpFeatures.map((f, i) => (
          <Field key={i} label={`MVP feature ${i + 1}`} htmlFor={`${idBase}-${i}`}>
            <div className="flex flex-col gap-2">
              <Input
                id={`${idBase}-${i}`}
                value={f.name}
                onChange={(e) => setFeature(i, { name: e.target.value })}
                placeholder="Describe a core feature..."
                className="h-11 rounded-xl bg-card"
              />
              <Input
                value={f.description}
                onChange={(e) => setFeature(i, { description: e.target.value })}
                placeholder="One line: what does done look like for this feature? (optional)"
                aria-label={`MVP feature ${i + 1} description`}
                className="h-9 rounded-lg border-border/60 bg-card/60 text-sm"
              />
            </div>
          </Field>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={addFeature} className="rounded-xl bg-transparent">
          <Plus className="mr-1 h-4 w-4" /> Add feature
        </Button>
        <Button
          variant="outline"
          onClick={removeLast}
          disabled={data.mvpFeatures.length <= 1}
          className="rounded-xl bg-transparent text-destructive hover:text-destructive"
        >
          <Minus className="mr-1 h-4 w-4" /> Remove last
        </Button>
      </div>

      <AreaField
        label="Later / out of scope"
        value={data.outOfScope}
        onChange={(v) => onChange({ outOfScope: v })}
        placeholder={"One item per line\nAutomatic cloud API integration\nAI recommendation engine"}
        hint="One per line."
        rows={5}
      />
      <AreaField
        label="Known risks"
        value={data.knownRisks}
        onChange={(v) => onChange({ knownRisks: v })}
        placeholder={"One risk per line\nCloud billing formats differ between providers - normalize imports by provider"}
        hint="One per line. Optionally write: risk - mitigation."
        rows={5}
      />
    </div>
  )
}
