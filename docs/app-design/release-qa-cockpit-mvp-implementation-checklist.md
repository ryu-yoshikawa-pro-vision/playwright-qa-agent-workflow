# Release QA Cockpit MVP implementation checklist

> Implementation source of truth: `docs/app-design/release-qa-cockpit-implementation-source-of-truth.md`
>
> If this checklist conflicts with the implementation source of truth, use the implementation source of truth. This checklist is the implementation scope checklist; the source of truth is the decision-rule authority.

## 1. Purpose

This checklist defines the minimum implementation scope for the first executable `Release QA Cockpit` demo app. It exists to prevent the implementation PR from either under-building the MVP or reintroducing out-of-scope Phase 2 features.

## 2. Implementation directory

The implementation must live in the following directory:

```text
demo-apps/release-qa-cockpit/
```

Do not use `examples/release-qa-cockpit/` for app code, generated tests, target profile, storage state, or documentation.

Minimum directory shape:

```text
demo-apps/release-qa-cockpit/
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  src/
    app/
    components/
    data/
    db/
    features/
    lib/
    routes/
    test-target/
  tests/
  docs/
```

## 3. Required screens

The MVP must include these screens or routes:

| Screen | Required purpose |
| --- | --- |
| Login / Role Switch | Select a seeded user role without external authentication. |
| Dashboard | Show current release readiness, unresolved blocker count, test progress, and latest activity. |
| Releases | List seeded releases and allow opening a release detail. |
| Release Overview | Show release summary, readiness state, test progress, defects, risks, and evidence status. |
| Test Execution | Update seeded scenario execution status and attach Test Result evidence. |
| Defect Triage | Move defects through the required lifecycle and link them to test executions. |
| Risk Review | Review impact and approval status of release risks. |
| Release Decision | Preview and save Ready / At Risk / Not Ready decision. |
| Evidence Pack Export | Generate current-state Markdown evidence pack for a release. |
| Activity Log | Show important release, test, defect, risk, and decision events. |
| Demo Controls | Seed demo data and reset IndexedDB to a known state. |

## 4. Required IndexedDB stores

The MVP must define only these stores unless the implementation source of truth is updated:

```text
users
releases
testScenarios
testExecutions
defects
risks
decisions
evidence
activityLogs
settings
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

Evidence Pack Markdown is generated from the current IndexedDB state on demand. It is not stored as report history in MVP.

## 5. Required seeded demo data

Demo Mode must seed enough deterministic data to exercise the full smoke flow.

Minimum seed set:

- At least 3 users: QA lead, QA member, developer.
- At least 1 active release.
- At least 1 required smoke or regression test scenario.
- At least 1 failing or blocked test execution linked to a Critical or High defect.
- At least 1 Critical or High defect in a blocking status.
- At least 1 High impact risk that can be accepted to produce At Risk rather than Ready.
- At least 1 initial activity log entry.

Seed data must be deterministic. Running Data Reset must restore the same known state.

## 6. Role model

The MVP does not use external authentication. It must use a seeded local role switcher.

Minimum roles:

| Role | Required capabilities |
| --- | --- |
| QA Lead | Save release decisions, accept risks, reset demo data, export evidence pack. |
| QA Member | Update test executions, attach Test Result evidence, update defect retest results. |
| Developer | Move defects through development statuses such as in progress and fixed. |
| Viewer | Read-only access to dashboard, release overview, and evidence pack. |

Role restrictions should be visible in the UI. A disabled action is acceptable for MVP if the reason is visible to the user.

## 7. Readiness calculation

The implementation must separate persisted calculation and preview calculation.

Required functions or equivalent module boundaries:

```ts
calculatePersistedReadiness(releaseId): ReadinessResult;

calculateReadinessPreview(
  releaseId,
  draftInput: ReadinessDraftInput,
): ReadinessResult;
```

Use the source-of-truth file for the final Ready / At Risk / Not Ready rules.

Required behavior:

- Not Ready has highest priority.
- At Risk is used only when no Not Ready condition remains and at least one warning condition exists.
- Ready is used only when no unmet condition and no warning condition remains.
- Reasoned `skipped` required tests are At Risk, not Ready.
- High impact accepted risks are At Risk, not Ready.
- Low impact draft and accepted risks do not block Ready.
- Low impact pending approval and rejected risks produce At Risk.
- Manual Note or External Reference evidence alone does not satisfy the Test Result evidence requirement.

## 8. Release Decision save behavior

Saving a release decision must create or update all of the following:

- A `decision` record.
- Release Decision evidence.
- An activity log entry.

Ready or At Risk save must require:

- No unmet conditions.
- QA completion comment.
- At least one Test Result evidence record.

Ready additionally requires no warning conditions. At Risk requires at least one warning condition.

## 9. Evidence Pack Export

MVP Evidence Pack Export must generate Markdown from the current IndexedDB state.

The generated Markdown must include:

- Release summary.
- Current readiness.
- Saved release decision, if present.
- QA completion comment, if present.
- Test execution summary.
- Test Result evidence summary.
- Defect summary.
- Risk summary.
- Activity log summary.

MVP may support copy or download. It must not persist generated report history.

## 10. Data Reset

The MVP must include a visible reset control that clears and reseeds the local IndexedDB database.

Reset behavior:

- Clears all MVP stores.
- Restores deterministic Demo Mode seed data.
- Shows completion feedback.
- Leaves no dependency on external services.

## 11. First smoke E2E flow

The first Playwright smoke test should cover this end-to-end flow:

1. Open the demo app.
2. Select QA Lead or equivalent privileged role.
3. Reset demo data.
4. Open Dashboard and confirm release is Not Ready.
5. Open the active release.
6. Move the blocking defect through development and retest statuses.
7. Update the linked test execution to pass.
8. Attach or create at least one Test Result evidence record.
9. Accept the High impact risk.
10. Open Release Decision.
11. Confirm readiness preview becomes At Risk, not Ready.
12. Enter QA completion comment.
13. Save At Risk decision.
14. Confirm Release Decision evidence is created.
15. Generate Evidence Pack Markdown.
16. Confirm Evidence Pack includes release, decision, test, defect, risk, and activity sections.
17. Reset demo data.
18. Confirm the release returns to the initial Not Ready state.

## 12. MVP out of scope

The implementation must not add these features in the MVP unless a later design PR changes the source of truth:

- External authentication.
- External API calls.
- Remote database or server persistence.
- Report history persistence.
- `reportExports`, `reports`, `reportHistory`, or `comments` stores.
- Binary attachment persistence.
- Jira / GitHub / Slack integrations.
- Multi-tenant organization management.
- Real approval workflow beyond seeded local states.
- Full visual design system beyond the minimum needed for usable QA workflows.

## 13. Acceptance criteria

The MVP implementation is acceptable when all of the following are true:

- App runs locally from `demo-apps/release-qa-cockpit/`.
- Demo reset produces deterministic seed data.
- Readiness calculation follows the source-of-truth file.
- Release Decision save creates decision, decision evidence, and activity log.
- Evidence Pack Export generates Markdown without report history persistence.
- First smoke E2E flow can be automated with Playwright.
- No code, test, or documentation path uses `examples/release-qa-cockpit/` as the implementation target.
