"use client"

import type { LookData, ColorMode } from "@/lib/types"
import { SectionHeader, TextField, AreaField, Field } from "@/components/form-field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const HEX_RE = /^#[0-9a-fA-F]{6}$/

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const isValidHex = HEX_RE.test(value.trim())
  return (
    <Field
      label={label}
      hint={isValidHex ? undefined : "Use a 6-digit hex value like #2563eb."}
    >
      <div className="flex items-center gap-3 rounded-xl border border-input bg-card p-1.5">
        <input
          type="color"
          value={isValidHex ? value.trim() : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
          aria-label={`${label} color picker`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} hex value`}
          aria-invalid={!isValidHex}
          className="h-9 border-0 bg-transparent font-mono text-sm shadow-none focus-visible:ring-0"
        />
      </div>
    </Field>
  )
}

export function LookSection({
  data,
  onChange,
}: {
  data: LookData
  onChange: (patch: Partial<LookData>) => void
}) {
  return (
    <div className="flex flex-col gap-7">
      <SectionHeader
        title="Look"
        description="Visual direction and design tokens. Produces ui-tokens.md and ui-rules.md."
      />
      <AreaField
        label="Brand adjectives"
        value={data.brandAdjectives}
        onChange={(v) => onChange({ brandAdjectives: v })}
        placeholder="calm, precise, useful, restrained, trustworthy"
        rows={2}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ColorField label="primary" value={data.primary} onChange={(v) => onChange({ primary: v })} />
        <ColorField label="background" value={data.background} onChange={(v) => onChange({ background: v })} />
        <ColorField label="surface" value={data.surface} onChange={(v) => onChange({ surface: v })} />
        <ColorField label="text" value={data.text} onChange={(v) => onChange({ text: v })} />
        <ColorField label="success" value={data.success} onChange={(v) => onChange({ success: v })} />
        <ColorField label="error" value={data.error} onChange={(v) => onChange({ error: v })} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <TextField label="Display font" value={data.displayFont} onChange={(v) => onChange({ displayFont: v })} />
        <TextField label="Body font" value={data.bodyFont} onChange={(v) => onChange({ bodyFont: v })} />
        <TextField label="Mono font" value={data.monoFont} onChange={(v) => onChange({ monoFont: v })} />
      </div>

      <Field label="Color mode">
        <Select
          value={data.colorMode}
          onValueChange={(v) => onChange({ colorMode: v as ColorMode })}
        >
          <SelectTrigger className="h-11 rounded-xl bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Light">Light</SelectItem>
            <SelectItem value="Dark">Dark</SelectItem>
            <SelectItem value="System">System</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <AreaField
        label="Design notes"
        value={data.designNotes}
        onChange={(v) => onChange({ designNotes: v })}
        rows={5}
      />
    </div>
  )
}
