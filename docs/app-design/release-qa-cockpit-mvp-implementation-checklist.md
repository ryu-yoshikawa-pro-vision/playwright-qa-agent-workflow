# Release QA Cockpit MVP implementation checklist

> Implementation source of truth: `docs/app-design/release-qa-cockpit-implementation-source-of-truth.md`.
>
> If this checklist conflicts with the source of truth, use the source of truth. This file defines MVP implementation scope; the source of truth defines final decision rules.

## Required implementation path

Use only this app path:

```text
demo-apps/release-qa-cockpit/
```

Do not use `examples/release-qa-cockpit/` for app code, generated tests, target profile, storage state, or documentation.

## Required app skeleton

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

## Required screens

The MVP must include these user-visible areas:

- Login / Role Switch
- Dashboard
- Releases
- Release Overview
- Test Execution
- Defect Triage
- Risk Review
- Release Decision
- Evidence Pack Export
- Activity Log
- Demo Controls / Data Reset

## Required IndexedDB stores

The MVP store list must match the implementation source of truth:

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

Do not create these stores in MVP:

```text
reportExports
reports
reportHistory
comments
remoteSync
integrations
attachmentsBinary
```

## Required seeded demo data

Demo Mode must seed deterministic data that supports the first smoke flow:

- QA lead, QA member, and developer users.
- One active release.
- One release scope.
- One required smoke or regression test item.
- One failing or blocked test execution linked to a Critical or High defect.
- One Critical or High defect in a blocking status.
- One High impact risk that can be accepted and produce At Risk.
- One initial activity log entry.

Data Reset must clear all MVP stores and restore the same known seed state.

## Required readiness behavior

The implementation must separate persisted calculation and preview calculation:

```ts
calculatePersistedReadiness(releaseId): ReadinessResult;
calculateReadinessPreview(releaseId, draftInput: ReadinessDraftInput): ReadinessResult;
```

Readiness behavior must follow the source of truth:

- Not Ready has highest priority.
- At Risk applies only when no Not Ready condition remains and at least one warning condition exists.
- Ready applies only when no unmet condition and no warning condition remains.
- Reasoned `skipped` required tests are At Risk, not Ready.
- High impact accepted risks are At Risk, not Ready.
- Manual Note or External Reference evidence alone does not satisfy the Test Result evidence requirement.

## Required Release Decision save behavior

Saving a release decision must create:

- One `decisions` record.
- One Release Decision entry in `evidenceItems`.
- One `activityLogs` entry.

Ready or At Risk save must require:

- No unmet conditions.
- QA completion comment.
- At least one Test Result evidence item.

## Required Evidence Pack Export behavior

Evidence Pack Export must generate Markdown from the current IndexedDB state.

It must include release, readiness, decision, test execution, Test Result evidence, defect, risk, and activity log sections.

It must not persist report history in MVP.

## First smoke E2E flow

The first Playwright smoke test should cover:

1. Open the demo app.
2. Select QA Lead or equivalent privileged role.
3. Reset demo data.
4. Confirm the active release is Not Ready.
5. Resolve the blocking defect through development and retest states.
6. Update the linked test execution to pass.
7. Create at least one Test Result evidence item.
8. Accept the High impact risk.
9. Open Release Decision.
10. Confirm readiness preview becomes At Risk, not Ready.
11. Enter QA completion comment.
12. Save At Risk decision.
13. Confirm Release Decision evidence is created.
14. Generate Evidence Pack Markdown.
15. Reset demo data and confirm the initial Not Ready state returns.

## MVP out of scope

Do not add these in MVP:

- External authentication.
- External API calls.
- Remote database or server persistence.
- Report history persistence.
- `reportExports`, `reports`, `reportHistory`, or `comments` stores.
- Binary attachment persistence.
- Jira / GitHub / Slack integrations.
- Multi-tenant organization management.
