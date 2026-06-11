# Library Docs

Approved libraries and guidance for using them.

## Approved Libraries

| Library | Category | Purpose / Notes | Docs |
| --- | --- | --- | --- |
| Next.js App Router + TypeScript | Frontend | UI frameworks and styling | Official docs required before use. |
| Tailwind CSS | Frontend | UI frameworks and styling | Official docs required before use. |
| shadcn/ui | Frontend | UI frameworks and styling | Official docs required before use. |
| Zod | Validation | Input and schema validation | Official docs required before use. |
| Vitest | Testing | Test frameworks and tools | Official docs required before use. |
| Playwright | Testing | Test frameworks and tools | Official docs required before use. |
| Vercel | Deployment | Hosting and CI/CD | Official docs required before use. |

## Installation Notes
Install with the project's standard package manager, pinning versions:

- Next.js App Router + TypeScript
- Tailwind CSS
- shadcn/ui
- Zod
- Vitest
- Playwright

Platforms and services (configured, not installed as packages):

- Vercel

Rules:

- Pin exact or caret-bounded versions; commit the lockfile.
- Record any newly added dependency in this file before using it.

## Usage Rules
- Use only libraries listed in this file; propose additions by updating the Approved Libraries table first.
- Prefer the standard library or existing dependencies over adding new ones.
- Read the official docs for each library before first use; do not guess APIs.

## Rejected Libraries

| Library | Reason Rejected | Alternative |
| --- | --- | --- |
| _None rejected yet_ | _No rejected libraries were specified during planning._ | _—_ |

Do not introduce a rejected library without recording a new decision in `progress-tracker.md`.
