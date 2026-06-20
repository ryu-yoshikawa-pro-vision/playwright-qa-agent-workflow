# Release QA Cockpit state transitions

This document defines valid MVP status transitions.

The UI may present transitions as buttons, menus, or forms, but domain action handlers must reject invalid transitions.

## TestExecution transitions

| From | To | Allowed | Required input | Notes |
| --- | --- | --- | --- | --- |
| `notStarted` | `inProgress` | yes | none | Start execution. |
| `notStarted` | `skipped` | yes | `skipReason` | Reasoned skip becomes At Risk if no blockers remain. |
| `inProgress` | `pass` | yes | optional `resultNote` | Completed successfully. |
| `inProgress` | `fail` | yes | optional `resultNote` | May link or create defect. |
| `inProgress` | `blocked` | yes | `blockedReason` | Blocking required tests are Not Ready. |
| `fail` | `retest` | yes | none | Used after linked defect reaches retest state. |
| `blocked` | `inProgress` | yes | optional `resultNote` | Blocker cleared and work resumes. |
| `retest` | `pass` | yes | optional `resultNote` | Retest passed. |
| `retest` | `fail` | yes | optional `resultNote` | Linked defect may be reopened. |
| `skipped` | `inProgress` | yes | none | Reopen skipped test for execution. |
| `pass` | `retest` | no | none | Passing tests should not move to retest without a new test execution record. |
| `pass` | `fail` | no | none | Use a new execution or reset seed data. |

## TestExecution invalid transition behavior

When the user attempts an invalid transition:

- do not mutate `testExecutions`
- do not create `activityLogs`
- show a user-facing validation message
- keep the user on the current screen

## Defect transitions

| From | To | Allowed | Required input | Notes |
| --- | --- | --- | --- | --- |
| `open` | `triaged` | yes | none | Initial triage. |
| `open` | `duplicate` | yes | `resolutionNote` | Terminal non-blocking status. |
| `open` | `wontFix` | yes | `resolutionNote` | Terminal non-blocking status. |
| `triaged` | `inProgress` | yes | none | Fix started. |
| `triaged` | `wontFix` | yes | `resolutionNote` | Accepted non-fix outcome. |
| `inProgress` | `fixed` | yes | none | Developer fix completed. |
| `fixed` | `readyForRetest` | yes | none | QA may retest. |
| `readyForRetest` | `closed` | yes | optional `resolutionNote` | Retest passed. |
| `readyForRetest` | `reopened` | yes | optional `resolutionNote` | Retest failed. |
| `reopened` | `inProgress` | yes | none | Fix restarted. |
| `fixed` | `reopened` | yes | optional `resolutionNote` | Fix rejected before formal retest. |
| `closed` | `reopened` | yes | `resolutionNote` | Regression found after closure. |
| `wontFix` | `reopened` | yes | `resolutionNote` | Decision reversed. |
| `duplicate` | `reopened` | yes | `resolutionNote` | Duplicate decision reversed. |

## Defect blocking behavior

These statuses are unresolved blocking statuses:

```text
open
triaged
inProgress
fixed
readyForRetest
reopened
```

These statuses are terminal non-blocking statuses:

```text
closed
wontFix
duplicate
```

A `wontFix` defect can still create an At Risk condition when it has a linked accepted risk.

## Risk transitions

| From | To | Allowed | Required input | Notes |
| --- | --- | --- | --- | --- |
| `draft` | `pendingApproval` | yes | none | Submit for review. |
| `draft` | `mitigated` | yes | `mitigationNote` | Risk reduced before approval. |
| `pendingApproval` | `accepted` | yes | `acceptedReason` | Accepted risk can make readiness At Risk. |
| `pendingApproval` | `rejected` | yes | `rejectedReason` | Rejected High risk is Not Ready. |
| `accepted` | `closed` | yes | optional `mitigationNote` | Risk no longer affects release. |
| `accepted` | `mitigated` | yes | `mitigationNote` | Mitigation applied after acceptance. |
| `rejected` | `pendingApproval` | yes | optional `mitigationNote` | Rework and resubmit. |
| `mitigated` | `closed` | yes | optional `mitigationNote` | Risk resolved. |
| `closed` | `pendingApproval` | no | none | Closed risk should not reopen in MVP. |

## Release status transitions

| From | To | Allowed | Notes |
| --- | --- | --- | --- |
| `draft` | `inQa` | yes | QA starts. |
| `inQa` | `decisionPending` | yes | QA execution mostly complete. |
| `decisionPending` | `decided` | yes | Decision saved. |
| `inQa` | `decided` | yes | MVP may save decision directly. |
| `decided` | `archived` | yes | Historical state. |
| `archived` | `inQa` | no | Archived release is read-only in MVP. |

The MVP may keep the seeded release in `inQa` until a release decision is saved.

Saving a release decision may update release status to `decided`.

## Role restrictions

| Transition area | QA Lead | QA Member | Release Manager | Viewer |
| --- | --- | --- | --- | --- |
| TestExecution | all allowed test transitions | all allowed test transitions | view only | view only |
| Defect | all allowed defect transitions | `open` -> `triaged`, `triaged` -> `inProgress`, `inProgress` -> `fixed`, `fixed` -> `readyForRetest`, `readyForRetest` -> `reopened` | view only | view only |
| Risk | all allowed risk transitions | `draft` -> `pendingApproval` only | accept, reject, close, mitigate | view only |
| Release decision | save all decision types | view only | save all decision types | view only |

Role restrictions must be enforced by domain action handlers, not only by hidden buttons.

## Activity log requirements

Every successful transition must create one activity log entry.

The activity log summary must include:

- entity type
- entity title when available
- old status
- new status
- actor name or role

Example summary:

```text
QA Lead moved defect "Recording export fails" from readyForRetest to closed.
```

Invalid transitions must not create activity log entries.

## E2E-relevant transition chain

The first smoke E2E should be able to perform this chain from seed data:

```text
Defect:
open -> triaged -> inProgress -> fixed -> readyForRetest -> closed

TestExecution:
fail -> retest -> pass

Risk:
draft -> pendingApproval -> accepted

Release Decision:
preview Not Ready -> preview At Risk -> save At Risk
```

## Completion criteria

State transition implementation is complete when:

- domain action handlers reject invalid transitions
- UI disables or explains unavailable transitions
- required reason fields are validated
- role restrictions are enforced
- activity logs are created only for successful transitions
- readiness updates reflect status changes without page reload requirements
