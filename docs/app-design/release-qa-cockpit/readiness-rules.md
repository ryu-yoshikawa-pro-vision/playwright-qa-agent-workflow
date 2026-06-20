# Release QA Cockpit readiness rules

This document defines the canonical Ready / At Risk / Not Ready calculation.

Do not duplicate incompatible readiness rules in screen components. UI code must call the domain calculation functions.

## Public functions

```ts
export function calculatePersistedReadiness(releaseId: string): Promise<ReadinessResult>;

export function calculateReadinessPreview(
  releaseId: string,
  draftInput: ReadinessDraftInput,
): Promise<ReadinessResult>;
```

## Persisted versus preview calculation

| Function                      | Inputs                                 | Used by                       | Behavior                                                   |
| ----------------------------- | -------------------------------------- | ----------------------------- | ---------------------------------------------------------- |
| `calculatePersistedReadiness` | Stored IndexedDB state only            | Dashboard, Releases, Overview | Shows current saved release state.                         |
| `calculateReadinessPreview`   | Stored state plus draft decision input | Release Decision screen       | Shows what the readiness would be with unsaved form input. |

Draft input must not mutate IndexedDB.

## Deterministic clock source

Schedule-based readiness checks must use this clock order:

1. `appSettings.demoNow` when present.
2. Host system time only when `appSettings.demoNow` is absent.

The default seed scenario must set `appSettings.demoNow` so `qa-period-overdue` does not change based on the day the E2E test runs.

## Priority

Evaluate in this order:

1. If any Not Ready condition exists, readiness is `notReady`.
2. If no Not Ready condition exists and any At Risk condition exists, readiness is `atRisk`.
3. If no Not Ready or At Risk condition exists, readiness is `ready`.

Not Ready always wins over At Risk.

## Unresolved blocking defect statuses

```ts
export const unresolvedBlockingDefectStatuses = [
  'open',
  'triaged',
  'inProgress',
  'fixed',
  'readyForRetest',
  'reopened',
] as const;
```

These statuses are not unresolved blocking statuses:

```text
closed
wontFix
duplicate
```

## Not Ready conditions

The result must include a blocker condition for each matched item.

| Condition ID                           | Source          | Rule                                                                                             |
| -------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| `required-test-not-started`            | `testExecution` | A required test execution is `notStarted`.                                                       |
| `required-test-in-progress`            | `testExecution` | A required test execution is `inProgress`.                                                       |
| `required-test-failed`                 | `testExecution` | A required test execution is `fail`.                                                             |
| `required-test-blocked`                | `testExecution` | A required test execution is `blocked`.                                                          |
| `required-test-skipped-without-reason` | `testExecution` | A required test execution is `skipped` and has no `skipReason`.                                  |
| `critical-high-blocking-defect`        | `defect`        | A Critical or High defect is in an unresolved blocking status.                                   |
| `impacting-medium-low-blocking-defect` | `defect`        | A Medium or Low defect is in an unresolved blocking status and `impactsReleaseDecision` is true. |
| `high-risk-unapproved`                 | `risk`          | A High impact risk is `draft`, `pendingApproval`, or `rejected`.                                 |
| `medium-risk-rejected`                 | `risk`          | A Medium impact risk is `rejected`.                                                              |
| `qa-completion-comment-missing`        | `decision`      | QA completion comment is empty in the persisted or preview input being evaluated.                |
| `test-result-evidence-missing`         | `evidence`      | No `EvidenceItem` of type `testResult` exists for the release.                                   |

## At Risk conditions

At Risk conditions are warnings. They matter only when no Not Ready condition exists.

| Condition ID                        | Source          | Rule                                                                                               |
| ----------------------------------- | --------------- | -------------------------------------------------------------------------------------------------- |
| `medium-low-blocking-defect`        | `defect`        | A Medium or Low defect is in an unresolved blocking status, but `impactsReleaseDecision` is false. |
| `high-risk-accepted`                | `risk`          | A High impact risk is `accepted`.                                                                  |
| `medium-risk-open-or-accepted`      | `risk`          | A Medium impact risk is `draft`, `pendingApproval`, or `accepted`.                                 |
| `low-risk-pending-or-rejected`      | `risk`          | A Low impact risk is `pendingApproval` or `rejected`.                                              |
| `required-test-skipped-with-reason` | `testExecution` | A required test execution is `skipped` and has `skipReason`.                                       |
| `qa-period-overdue`                 | `schedule`      | Effective current date is after `Release.plannedEndDate` and release is not decided or archived.   |
| `wont-fix-risk-accepted`            | `risk`          | A `wontFix` defect still has a linked risk in `accepted` status.                                   |

`Effective current date` means `appSettings.demoNow` when present; otherwise host system time.

## Ready conditions

The result is Ready only when all of the following are true:

- no Not Ready condition exists
- no At Risk condition exists
- all required test executions are `pass`
- no Critical or High defect is in an unresolved blocking status
- QA completion comment is present in the persisted or preview input being evaluated
- at least one `EvidenceItem` of type `testResult` exists for the release

A reasoned skipped required test is not Ready. It is At Risk.

An accepted High impact risk is not Ready. It is At Risk.

Manual Note or External Reference evidence alone does not satisfy the Test Result evidence requirement.

## Decision save validation

### Ready save

Ready save is allowed only when:

- preview readiness is `ready`
- `qaCompletionComment` is present
- no unmet conditions exist
- no warning conditions exist
- at least one Test Result evidence item exists

### At Risk save

At Risk save is allowed only when:

- preview readiness is `atRisk`
- `qaCompletionComment` is present
- `decisionComment` is present
- no unmet conditions exist
- at least one Test Result evidence item exists

### Not Ready save

Not Ready save is allowed when:

- preview readiness is `notReady`
- `decisionComment` is present

QA completion comment is recommended for Not Ready but not required, because the decision may be saved to document known blockers before QA completion.

## Condition output rules

Each condition should include:

```ts
{
  id: string;
  severity: 'blocker' | 'warning';
  message: string;
  sourceType:
    | 'testExecution'
    | 'defect'
    | 'risk'
    | 'decision'
    | 'evidence'
    | 'schedule';
  sourceId?: string;
}
```

Messages must be human-readable and stable enough for UI display.

Do not rely on condition message text for unit test identity. Unit tests should assert condition IDs.

## Required unit test matrix

At minimum, unit tests must cover:

| Case                                                                   | Expected readiness |
| ---------------------------------------------------------------------- | ------------------ |
| Required test not started                                              | `notReady`         |
| Required test failed                                                   | `notReady`         |
| Required test blocked                                                  | `notReady`         |
| Required test skipped without reason                                   | `notReady`         |
| Required test skipped with reason and no blockers                      | `atRisk`           |
| Critical blocking defect                                               | `notReady`         |
| High blocking defect                                                   | `notReady`         |
| Medium impacting blocking defect                                       | `notReady`         |
| Medium non-impacting blocking defect                                   | `atRisk`           |
| High risk draft                                                        | `notReady`         |
| High risk pending approval                                             | `notReady`         |
| High risk rejected                                                     | `notReady`         |
| High risk accepted                                                     | `atRisk`           |
| Medium risk rejected                                                   | `notReady`         |
| Medium risk accepted                                                   | `atRisk`           |
| Missing QA completion comment                                          | `notReady`         |
| Missing Test Result evidence                                           | `notReady`         |
| Manual Note evidence only                                              | `notReady`         |
| QA period overdue with no blockers                                     | `atRisk`           |
| All required tests pass, no blockers, QA comment, Test Result evidence | `ready`            |
| Both blocker and warning exist                                         | `notReady`         |

## Implementation constraints

- Readiness calculation must be implemented as domain logic, not in React components.
- Components may render results but must not reimplement condition rules.
- Schedule-based readiness logic must use the deterministic clock source defined above.
- The Release Decision screen must use preview calculation for unsaved input.
- Dashboard, Releases, and Release Overview must use persisted calculation.
- Saving a decision must snapshot the readiness result at save time.
- Evidence Pack Export must render the current persisted state, not unsaved preview state.

## Completion criteria

Readiness rules are implemented when:

- unit tests cover the required matrix
- condition IDs are stable
- preview and persisted calculation are separated
- Ready, At Risk, and Not Ready are all reachable from seed-derived flows
- UI buttons enforce decision save validation consistently with this document
