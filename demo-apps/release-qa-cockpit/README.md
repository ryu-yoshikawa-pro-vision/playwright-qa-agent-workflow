# Release QA Cockpit

Local-first SaaS-style demo application for validating the Playwright QA Agent Workflow.

## Quick start

```bash
cd demo-apps/release-qa-cockpit
npm install
npm run dev
```

Open `http://localhost:5173` and select a role to begin.

## Commands

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start Vite dev server                             |
| `npm run build`     | TypeScript check + Vite build                     |
| `npm run test`      | Run Vitest unit tests                             |
| `npm run test:e2e`  | Run Playwright E2E tests                          |
| `npm run lint`      | Run ESLint                                        |
| `npm run typecheck` | Run TypeScript type check                         |
| `npm run check`     | Full quality gate (lint + typecheck + test + e2e) |

## Reset behavior

Use the Demo Controls screen to restore deterministic seed data.

After reset, the active release readiness returns to Not Ready.

## Design documents

Canonical design docs are in `docs/app-design/release-qa-cockpit/` at the repository root.
