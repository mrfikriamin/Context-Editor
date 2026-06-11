# Data Model

Script input, output, and intermediate record shapes.

## Data Shapes (Input / Output)

### Note

A single note

| Field / Variable | Type | Required | Notes |
| --- | --- | --- | --- |
| id | uuid | Yes | _—_ |
| title | text | Yes | _—_ |
| body | markdown | No | _—_ |

### Tag

| Field / Variable | Type | Required | Notes |
| --- | --- | --- | --- |
| label | text | Yes | unique |

## Relationships
- Note has many Tag

## Data Rules
- Validate all external input at the boundary.
- Do not invent schemas, payloads, variables, outputs, config shapes, or persisted state.
- Update this file before changing a schema or data contract.
- Record schema decisions in the Decision Log of `progress-tracker.md`.
