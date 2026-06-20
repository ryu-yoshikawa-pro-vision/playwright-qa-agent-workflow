# Release QA Cockpit MVP scope

## Required implementation path

Use only:

```text
demo-apps/release-qa-cockpit/
```

Do not use `examples/release-qa-cockpit/` for app code, generated tests, target project profiles, storage state, or documentation.

## Required app skeleton

The MVP must include this app-level structure:

```text
demo-apps/release-qa-cockpit/
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  src/
  tests/
  docs/
```

## Required technology choices

| Area              | Required choice                                |
| ----------------- | ---------------------------------------------- |
| Frontend          | React                                          |
| Language          | TypeScript                                     |
| Build tool        | Vite                                           |
| Persistence       | IndexedDB                                      |
| IndexedDB wrapper | Dexie or an equivalent typed local wrapper     |
| Routing           | React Router or equivalent client-side routing |
| Unit tests        | Vitest or equivalent Vite-friendly runner      |
| E2E tests         | Playwright Test                                |

Do not add a server runtime for the MVP.

## Required screens

The MVP must expose these user-visible screens or screen areas:

| Screen                     | Required route                                         |
| -------------------------- | ------------------------------------------------------ |
| Login / Role Switch        | `/login` or role switch control available globally     |
| Dashboard                  | `/`                                                    |
| Releases                   | `/releases`                                            |
| Release Overview           | `/releases/:releaseId`                                 |
| Test Execution             | `/releases/:releaseId/tests`                           |
| Defect Triage              | `/releases/:releaseId/defects`                         |
| Risk Review                | `/releases/:releaseId/risks`                           |
| Release Decision           | `/releases/:releaseId/decision`                        |
| Evidence Pack Export       | `/releases/:releaseId/evidence-pack`                   |
| Activity Log               | `/activity-log` or `/releases/:releaseId/activity-log` |
| Demo Controls / Data Reset | `/demo-controls` or global reset dialog                |

The exact router library can vary, but the user-visible navigation names must match the screen names above.

## Required domain features

| Feature               | Required behavior                                                                  |
| --------------------- | ---------------------------------------------------------------------------------- |
| Role switching        | Allows deterministic switching between seeded users.                               |
| Release selection     | Allows opening the active seeded release.                                          |
| Readiness calculation | Calculates persisted and preview readiness separately.                             |
| Test execution update | Allows status update for seeded test executions.                                   |
| Defect triage         | Allows valid defect status transitions.                                            |
| Risk review           | Allows valid risk status transitions with required reason fields.                  |
| Release decision save | Creates decision, Release Decision evidence, and activity log.                     |
| Test Result evidence  | Allows creating at least one evidence item of type `testResult`.                   |
| Evidence Pack export  | Generates Markdown from current IndexedDB state without persisting report history. |
| Activity log          | Records user-visible domain mutations.                                             |
| Demo data reset       | Clears MVP stores and restores deterministic seed data.                            |

## Required IndexedDB stores

The MVP must create exactly these domain stores:

```text
users
sessions
releases
releaseScopes
testItems
testExecutions
defects
risks
decisions
evidenceItems
activityLogs
demoScenarios
appSettings
```

## Stores explicitly out of scope

Do not create these stores in the MVP:

```text
comments
reportExports
reports
reportHistory
remoteSync
integrations
attachmentsBinary
```

If a future design needs any of these stores, it must be added after the MVP as a separate design and implementation change.

## Required seeded state

Demo Mode must seed deterministic data that supports the first smoke flow:

- QA Lead, QA Member, Release Manager, and Viewer users
- one active release
- one release scope
- at least three test items
- at least one required failing or blocked test execution
- one Critical or High defect in a blocking status linked to the failing or blocked test execution
- one High impact risk that can be accepted and produce At Risk
- no initial Test Result evidence
- no initial QA completion comment
- one initial activity log entry

The initial readiness must be Not Ready.

## Required readiness behavior

The implementation must separate persisted calculation and preview calculation:

```ts
calculatePersistedReadiness(releaseId: string): Promise<ReadinessResult>;

calculateReadinessPreview(
  releaseId: string,
  draftInput: ReadinessDraftInput
): Promise<ReadinessResult>;
```

Readiness behavior must follow `readiness-rules.md`.

## Required Release Decision save behavior

Saving a release decision must create:

- one `decisions` record
- one Release Decision entry in `evidenceItems`
- one `activityLogs` entry

Ready or At Risk save must require:

- no unmet conditions
- QA completion comment
- at least one Test Result evidence item

Not Ready save may be allowed with unmet conditions, but it still requires a decision comment explaining the known blockers.

## Required Evidence Pack behavior

Evidence Pack Export must generate Markdown from the current IndexedDB state.

It must include these sections:

- release summary
- current readiness
- latest decision
- test execution summary
- Test Result evidence
- defects
- risks
- activity logs

It must not persist report history in the MVP.

## MVP out of scope

Do not add these in the MVP:

- external authentication
- external API calls
- remote database or server persistence
- report history persistence
- binary attachment persistence
- Jira, GitHub, Slack, or email integrations
- multi-tenant organization management
- background jobs
- access tokens, API keys, cookies, or saved browser auth state in Git

## MVP acceptance criteria

The MVP is complete only when:

- the app starts locally from `demo-apps/release-qa-cockpit/`
- seed data loads deterministically
- Demo Data Reset restores the initial Not Ready state
- all required screens are reachable
- readiness unit tests cover Ready, At Risk, and Not Ready
- the first smoke E2E flow passes locally
- Evidence Pack Markdown includes all required sections
- primary controls are accessible through role, label, or accessible name selectors
