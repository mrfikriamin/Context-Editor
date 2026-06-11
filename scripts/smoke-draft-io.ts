// Smoke test for draft save/import: build a draft envelope, parse it back,
// and confirm state + overrides survive the round trip. Run with: npx tsx scripts/smoke-draft-io.ts
import { buildDraft, parseDraft, draftFileName } from "../lib/draft-io"
import { DEFAULT_STATE } from "../lib/types"
import type { ContextState } from "../lib/types"

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`)
    process.exit(1)
  }
}

const state: ContextState = structuredClone(DEFAULT_STATE)
state.idea.projectName = "My Test App!"
state.idea.pitch = "A pitch"
state.features.mvpFeatures[0] = { name: "Login", description: "Email login" }
state.dataModel.entities = [
  { name: "User", description: "", fields: [{ name: "id", type: "uuid", required: true, notes: "" }] },
]
const overrides = { "idea.md": "# Edited by hand" }

const json = JSON.stringify(buildDraft(state, overrides), null, 2)
const parsed = parseDraft(json)

assert(parsed.state.idea.projectName === "My Test App!", "projectName survives round trip")
assert(parsed.state.features.mvpFeatures[0].name === "Login", "mvpFeatures survive round trip")
assert(parsed.state.dataModel.entities[0].fields[0].name === "id", "entity fields survive round trip")
assert(parsed.overrides["idea.md"] === "# Edited by hand", "overrides survive round trip")
assert(draftFileName(state) === "my-test-app-draft.json", `filename slug (got ${draftFileName(state)})`)

// Legacy draft: state saved before rejectedLibraries/configVariables existed.
const legacy = buildDraft(state, {})
delete (legacy.state.stack as Partial<ContextState["stack"]>).rejectedLibraries
delete (legacy.state.stack as Partial<ContextState["stack"]>).configVariables
const migrated = parseDraft(JSON.stringify(legacy))
assert(Array.isArray(migrated.state.stack.rejectedLibraries), "legacy draft gets rejectedLibraries")
assert(Array.isArray(migrated.state.stack.configVariables), "legacy draft gets configVariables")

// Invalid inputs must throw readable errors and never return.
for (const [label, bad] of [
  ["not JSON", "{nope"],
  ["wrong app", JSON.stringify({ app: "other", state: {} })],
  ["missing state", JSON.stringify({ app: "context-editor" })],
  ["invalid state shape", JSON.stringify({ app: "context-editor", state: { foo: 1 } })],
] as const) {
  let threw = false
  try {
    parseDraft(bad)
  } catch (e) {
    threw = true
    assert(e instanceof Error && e.message.length > 0, `${label}: readable error message`)
  }
  assert(threw, `${label}: parseDraft throws`)
}

console.log("Draft IO smoke test passed.")
