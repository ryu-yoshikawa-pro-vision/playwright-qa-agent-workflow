# Release QA Cockpit seed scenarios

This document defines deterministic seed data for the MVP.

Seed data must support repeatable Playwright E2E tests, service mapping, and manual exploration.

## Seed scenario identity

| Field                        | Value                             |
| ---------------------------- | --------------------------------- |
| Scenario ID                  | `scenario-weekly-release-at-risk` |
| Scenario name                | `Weekly Release At Risk Demo`     |
| Initial readiness            | `notReady`                        |
| Target final smoke readiness | `atRisk`                          |

## Deterministic time values

Use fixed ISO strings in seed data.

```text
createdAt: 2026-06-01T09:00:00.000Z
updatedAt: 2026-06-01T09:00:00.000Z
plannedStartDate: 2026-06-01T00:00:00.000Z
plannedEndDate: 2026-06-30T23:59:59.000Z
appSettings.demoNow: 2026-06-15T12:00:00.000Z
```

Runtime updates may use current time for audit fields, but readiness schedule checks must use `appSettings.demoNow` when present.

The default seed scenario must not trigger `qa-period-overdue`. Overdue behavior should be covered by a separate scenario or unit test that sets `demoNow` after `plannedEndDate`.

## Users

| ID                     | Name            | Role             | Active |
| ---------------------- | --------------- | ---------------- | ------ |
| `user-qa-lead`         | QA Lead         | `qaLead`         | true   |
| `user-qa-member`       | QA Member       | `qaMember`       | true   |
| `user-release-manager` | Release Manager | `releaseManager` | true   |
| `user-viewer`          | Viewer          | `viewer`         | true   |

## Session

| Field              | Value                |
| ------------------ | -------------------- |
| `id`               | `session-default`    |
| `currentUserId`    | `user-qa-lead`       |
| `currentReleaseId` | `rel-weekly-2026-06` |

## Release

| Field              | Value                      |
| ------------------ | -------------------------- |
| `id`               | `rel-weekly-2026-06`       |
| `name`             | `Weekly Release 2026-06`   |
| `version`          | `2026.06.1`                |
| `status`           | `inQa`                     |
| `plannedStartDate` | `2026-06-01T00:00:00.000Z` |
| `plannedEndDate`   | `2026-06-30T23:59:59.000Z` |

## Release scope

| ID                      | Title                   | Area               | In scope |
| ----------------------- | ----------------------- | ------------------ | -------- |
| `scope-recording-core`  | Recording core workflow | Recording          | true     |
| `scope-export-evidence` | Evidence Pack export    | Reporting          | true     |
| `scope-risk-review`     | Release risk review     | Release Management | true     |

## Test items

| ID                        | Title                                                | Area        | Priority   | Required |
| ------------------------- | ---------------------------------------------------- | ----------- | ---------- | -------- |
| `test-recording-playback` | Recording playback is available after processing     | Recording   | `critical` | true     |
| `test-evidence-export`    | Evidence Pack Markdown includes QA summary           | Reporting   | `high`     | true     |
| `test-viewer-readonly`    | Viewer can inspect release without mutation controls | Permissions | `medium`   | true     |

## Test executions

| ID                        | Test item                 | Initial status | Assignee         | Linked defect                     |
| ------------------------- | ------------------------- | -------------- | ---------------- | --------------------------------- |
| `exec-recording-playback` | `test-recording-playback` | `fail`         | `user-qa-member` | `defect-recording-playback-fails` |
| `exec-evidence-export`    | `test-evidence-export`    | `pass`         | `user-qa-member` | none                              |
| `exec-viewer-readonly`    | `test-viewer-readonly`    | `pass`         | `user-qa-member` | none                              |

The initial failed required test is required so the initial readiness is Not Ready.

## Defects

| ID                                | Title                                     | Severity | Status | Impacts release decision | Linked test execution     |
| --------------------------------- | ----------------------------------------- | -------- | ------ | ------------------------ | ------------------------- |
| `defect-recording-playback-fails` | Recording playback fails after processing | `high`   | `open` | true                     | `exec-recording-playback` |

This defect must be resolvable through the smoke transition chain:

```text
open -> triaged -> inProgress -> fixed -> readyForRetest -> closed
```

## Risks

| ID                          | Title                                       | Impact | Initial status | Linked defect                     |
| --------------------------- | ------------------------------------------- | ------ | -------------- | --------------------------------- |
| `risk-recording-regression` | Recording regression risk remains after fix | `high` | `draft`        | `defect-recording-playback-fails` |

This risk must be acceptable through the smoke transition chain:

```text
draft -> pendingApproval -> accepted
```

High impact accepted risk must make readiness At Risk, not Ready.

## Decisions

No decision records should exist initially.

## Evidence items

Initial seed data must not include `testResult` evidence.

This is required so the initial readiness is Not Ready even if test and defect blockers are later resolved before evidence is created.

The implementation may seed one `manualNote` evidence item only if it is clearly labeled as not satisfying the Test Result evidence condition.

Recommended MVP default: no evidence items initially.

## Activity logs

Seed one initial activity log entry:

| Field              | Value                                      |
| ------------------ | ------------------------------------------ |
| `id`               | `log-seed-created`                         |
| `actorUserId`      | `user-qa-lead`                             |
| `action`           | `demo.seeded`                              |
| `targetEntityType` | `demoScenario`                             |
| `targetEntityId`   | `scenario-weekly-release-at-risk`          |
| `summary`          | `Seeded Weekly Release At Risk Demo data.` |

## App settings

| Field           | Value                      |
| --------------- | -------------------------- |
| `id`            | `app-settings`             |
| `demoMode`      | true                       |
| `schemaVersion` | 1                          |
| `demoNow`       | `2026-06-15T12:00:00.000Z` |
| `lastResetAt`   | optional runtime value     |

## Initial readiness explanation

The initial state must evaluate to Not Ready because:

- `exec-recording-playback` is `fail`
- `defect-recording-playback-fails` is High severity and in `open` status
- `risk-recording-regression` is High impact and `draft`
- there is no Test Result evidence
- no QA completion comment has been provided

It must not include `qa-period-overdue` in the default seed because `demoNow` is before `plannedEndDate`.

## First smoke E2E scenario

The first smoke test must be able to follow this path:

1. Open the app.
2. Continue as QA Lead.
3. Reset demo data.
4. Open `Weekly Release 2026-06`.
5. Confirm persisted readiness is Not Ready.
6. Move `Recording playback fails after processing` from `open` to `triaged`.
7. Move it to `inProgress`.
8. Move it to `fixed`.
9. Move it to `readyForRetest`.
10. Move `Recording playback is available after processing` to `retest`.
11. Mark that test execution as `pass`.
12. Close the defect.
13. Create Test Result evidence for the passing test.
14. Submit `Recording regression risk remains after fix` for approval.
15. Accept the High impact risk with an accepted reason.
16. Open Release Decision.
17. Enter QA completion comment.
18. Confirm preview readiness is At Risk, not Ready.
19. Enter decision comment.
20. Save At Risk decision.
21. Confirm Release Decision evidence was created.
22. Generate Evidence Pack Markdown.
23. Confirm Markdown includes release, readiness, decision, tests, evidence, defects, risks, and activity logs.
24. Reset demo data.
25. Confirm the active release returns to Not Ready.

## Reset behavior

Demo Data Reset must:

- clear all MVP stores
- restore all deterministic records in this document
- restore the default session user to QA Lead
- restore the current release to `rel-weekly-2026-06`
- restore `appSettings.demoNow` to `2026-06-15T12:00:00.000Z`
- restore initial readiness to Not Ready
- create the seed activity log entry
- update `appSettings.lastResetAt`

## Determinism rules

- Seed IDs must not change without updating this document and tests.
- Seed titles must remain stable enough for Playwright accessible-name selectors.
- The smoke scenario must not depend on pre-existing browser storage.
- E2E setup may call the UI reset flow or a documented test helper, but the UI reset flow must exist.
- The default seed scenario must not depend on the host system date.

## Completion criteria

Seed behavior is complete when:

- first app load initializes seed data
- Demo Data Reset restores identical deterministic data
- first smoke E2E can start from reset state
- no initial Test Result evidence exists
- initial readiness is Not Ready
- the smoke path can reach At Risk without modifying code or seed fixtures
