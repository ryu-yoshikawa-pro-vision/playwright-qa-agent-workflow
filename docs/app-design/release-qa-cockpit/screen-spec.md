# Release QA Cockpit screen specification

This document defines the MVP user-visible screens, routes, operations, validation, and side effects.

UI implementation may choose component structure freely, but it must preserve these user-visible behaviors and accessible names.

## Global layout

Every authenticated app screen must include:

- app title: `Release QA Cockpit`
- current user and role
- current release when selected
- navigation links:
  - `Dashboard`
  - `Releases`
  - `Activity Log`
  - `Demo Controls`
- role switch control

The global role switch is allowed in the header so tests can change roles without real authentication.

## Screen: Login / Role Switch

### Route

`/login`

A global role switch in the app header is also required after login.

### Purpose

Select a deterministic seeded user role for exploration and tests.

### Visible elements

- page heading: `Select role`
- role buttons:
  - `Continue as QA Lead`
  - `Continue as QA Member`
  - `Continue as Release Manager`
  - `Continue as Viewer`
- current role indicator after selection

### Actions

| Action                 | Result                                              |
| ---------------------- | --------------------------------------------------- |
| Select QA Lead         | Set current session user to `user-qa-lead`.         |
| Select QA Member       | Set current session user to `user-qa-member`.       |
| Select Release Manager | Set current session user to `user-release-manager`. |
| Select Viewer          | Set current session user to `user-viewer`.          |

### Side effects

- updates `sessions.currentUserId`
- creates `activityLogs` entry with action `role.changed`

### Empty and error states

- If no users exist, show `Demo data is missing` and a `Reset demo data` action.

## Screen: Dashboard

### Route

`/`

### Purpose

Show the current release overview and quick links into operational screens.

### Visible elements

- page heading: `Dashboard`
- active release card
- persisted readiness badge
- required test count
- passed test count
- failed or blocked test count
- unresolved blocking defect count
- active risk count
- latest decision summary
- links:
  - `Open Release Overview`
  - `Open Test Execution`
  - `Open Defect Triage`
  - `Open Risk Review`
  - `Open Release Decision`
  - `Export Evidence Pack`

### Actions

| Action                | Result                                            |
| --------------------- | ------------------------------------------------- |
| Open active release   | Navigate to `/releases/:releaseId`.               |
| Open Test Execution   | Navigate to `/releases/:releaseId/tests`.         |
| Open Defect Triage    | Navigate to `/releases/:releaseId/defects`.       |
| Open Risk Review      | Navigate to `/releases/:releaseId/risks`.         |
| Open Release Decision | Navigate to `/releases/:releaseId/decision`.      |
| Export Evidence Pack  | Navigate to `/releases/:releaseId/evidence-pack`. |

### Validation

Dashboard must use `calculatePersistedReadiness`.

It must not use unsaved Release Decision form input.

## Screen: Releases

### Route

`/releases`

### Purpose

List releases and allow the user to open a release.

### Visible elements

- page heading: `Releases`
- release list or table
- release name
- version
- status
- planned QA dates
- persisted readiness badge
- action link or button: `View release <release name>`

### Actions

| Action       | Result                                                      |
| ------------ | ----------------------------------------------------------- |
| View release | Set current release and navigate to `/releases/:releaseId`. |

### Side effects

- updates `sessions.currentReleaseId`
- creates `activityLogs` entry with action `release.selected`

## Screen: Release Overview

### Route

`/releases/:releaseId`

### Purpose

Show release-level summary and operational navigation.

### Visible elements

- page heading with release name
- version
- release status
- planned start and end date
- persisted readiness badge
- readiness blocker panel
- readiness warning panel
- release scope list
- test execution summary
- defect summary
- risk summary
- latest decision summary
- operational links:
  - `Open Test Execution`
  - `Open Defect Triage`
  - `Open Risk Review`
  - `Open Release Decision`
  - `Export Evidence Pack`

### Validation

The readiness blocker and warning panels must use condition output from `calculatePersistedReadiness`.

## Screen: Test Execution

### Route

`/releases/:releaseId/tests`

### Purpose

Update QA execution status for release test items.

### Visible elements

- page heading: `Test Execution`
- test execution list or table
- test title
- area
- priority
- required flag
- current status
- assignee
- result note field
- blocked reason field when status is `blocked`
- skip reason field when status is `skipped`
- linked defect indicator
- action buttons:
  - `Start test <test title>`
  - `Mark test <test title> as passed`
  - `Mark test <test title> as failed`
  - `Block test <test title>`
  - `Skip test <test title>`
  - `Move test <test title> to retest`
  - `Create Test Result evidence for <test title>`

### Actions

| Action                                 | Result                                                      |
| -------------------------------------- | ----------------------------------------------------------- |
| Start test                             | `notStarted` -> `inProgress`.                               |
| Mark as passed                         | Valid active status -> `pass`.                              |
| Mark as failed                         | Valid active status -> `fail`.                              |
| Block test                             | Valid active status -> `blocked`, requires reason.          |
| Skip test                              | `notStarted` or `inProgress` -> `skipped`, requires reason. |
| Move to retest                         | `fail` -> `retest`.                                         |
| Create Test Result evidence for a test | Creates `evidenceItems` record of type `testResult`.        |

### Validation

- `blocked` requires blocked reason.
- `skipped` requires skip reason.
- Viewer cannot mutate status or create evidence.
- QA Member and QA Lead can update test execution.
- Release Manager can view but should not update test execution in MVP.

### Side effects

Status updates create `activityLogs` entries.

Creating Test Result evidence creates both:

- `evidenceItems` record
- `activityLogs` entry

## Screen: Defect Triage

### Route

`/releases/:releaseId/defects`

### Purpose

Review release defects and move them through valid triage states.

### Visible elements

- page heading: `Defect Triage`
- defect list or table
- title
- severity
- status
- release decision impact flag
- linked test execution
- resolution note field when moving to terminal status
- status action buttons:
  - `Move defect <defect title> to Triaged`
  - `Move defect <defect title> to In Progress`
  - `Move defect <defect title> to Fixed`
  - `Move defect <defect title> to Ready for Retest`
  - `Close defect <defect title>`
  - `Reopen defect <defect title>`
  - `Mark defect <defect title> as Won't Fix`
  - `Mark defect <defect title> as Duplicate`

### Actions

Actions must follow `state-transitions.md`.

### Validation

- Invalid transitions must be disabled or show a clear validation message.
- `wontFix` requires resolution note.
- `duplicate` requires resolution note.
- Viewer cannot change status.
- QA Lead can close, reopen, mark Won't Fix, and mark Duplicate.
- QA Member can move operational statuses up to Ready for Retest.

### Side effects

- updates `defects`
- may update linked `testExecutions` when moving to retest is part of the user action
- creates `activityLogs` entry

## Screen: Risk Review

### Route

`/releases/:releaseId/risks`

### Purpose

Review release risks and record acceptance, rejection, mitigation, or closure.

### Visible elements

- page heading: `Risk Review`
- risk list or table
- title
- impact
- status
- linked defect indicator
- accepted reason field
- rejected reason field
- mitigation note field
- action buttons:
  - `Submit risk <risk title> for approval`
  - `Accept risk <risk title>`
  - `Reject risk <risk title>`
  - `Mitigate risk <risk title>`
  - `Close risk <risk title>`

### Actions

Actions must follow `state-transitions.md`.

### Validation

- `accepted` requires accepted reason.
- `rejected` requires rejected reason.
- `mitigated` requires mitigation note.
- Viewer cannot change status.
- QA Lead and Release Manager can accept or reject risk.
- QA Member can draft or submit risk changes but cannot accept final risk in MVP.

### Side effects

- updates `risks`
- creates `activityLogs` entry

## Screen: Release Decision

### Route

`/releases/:releaseId/decision`

### Purpose

Preview and save release decision state.

### Visible elements

- page heading: `Release Decision`
- persisted readiness badge
- preview readiness badge
- unmet conditions panel
- warning conditions panel
- QA completion comment textarea
- decision comment textarea
- latest decision summary
- buttons:
  - `Save Ready decision`
  - `Save At Risk decision`
  - `Save Not Ready decision`

### Actions

| Action                     | Result                                  |
| -------------------------- | --------------------------------------- |
| Edit QA completion comment | Updates preview readiness only.         |
| Edit decision comment      | Updates local draft only.               |
| Save Ready decision        | Saves Ready when validation allows.     |
| Save At Risk decision      | Saves At Risk when validation allows.   |
| Save Not Ready decision    | Saves Not Ready when validation allows. |

### Validation

Use `readiness-rules.md` decision save validation.

Buttons may be disabled, but the UI must expose why the action is unavailable.

### Side effects

Saving creates:

- one `decisions` record
- one `evidenceItems` record of type `releaseDecision`
- one `activityLogs` entry

### Important distinction

The preview readiness badge must change with draft input.

The persisted readiness badge must not change until the decision is saved.

## Screen: Evidence Pack Export

### Route

`/releases/:releaseId/evidence-pack`

### Purpose

Generate a Markdown Evidence Pack from current persisted IndexedDB state.

### Visible elements

- page heading: `Evidence Pack Export`
- export summary
- Markdown preview
- button: `Generate Evidence Pack Markdown`
- button: `Copy Evidence Pack Markdown`
- optional download link or button: `Download Evidence Pack Markdown`

### Markdown sections

The generated Markdown must include:

- release summary
- current persisted readiness
- latest decision
- test execution summary
- Test Result evidence
- defects
- risks
- activity logs

### Side effects

Generating or copying export creates `activityLogs` entry with action `evidencePack.generated` or `evidencePack.copied`.

The MVP must not persist report history.

## Screen: Activity Log

### Route

`/activity-log` or `/releases/:releaseId/activity-log`

### Purpose

Show domain mutations in reverse chronological order.

### Visible elements

- page heading: `Activity Log`
- activity list or table
- timestamp
- actor
- action
- target entity type
- summary
- release filter when using global route

### Actions

Passive viewing only.

## Screen: Demo Controls / Data Reset

### Route

`/demo-controls`

A global reset button may also be available in the header.

### Purpose

Restore deterministic seed data for repeatable Playwright and agent runs.

### Visible elements

- page heading: `Demo Controls`
- current demo scenario name
- last reset timestamp
- button: `Reset demo data`
- confirmation dialog with:
  - heading: `Confirm demo data reset`
  - button: `Confirm reset demo data`
  - button: `Cancel reset demo data`

### Actions

| Action                  | Result                                                  |
| ----------------------- | ------------------------------------------------------- |
| Reset demo data         | Opens confirmation dialog.                              |
| Confirm reset demo data | Clears MVP stores and restores deterministic seed data. |
| Cancel reset demo data  | Closes dialog without mutation.                         |

### Side effects

- clears all MVP stores
- restores seed data from `seed-scenarios.md`
- creates initial activity log entries
- updates `appSettings.lastResetAt`

### Validation

After reset, active release readiness must be Not Ready.

## Error handling

All screens must handle:

| Error                  | Required user-facing behavior                         |
| ---------------------- | ----------------------------------------------------- |
| Release not found      | Show `Release not found` and link to Releases.        |
| Demo data missing      | Show `Demo data is missing` and a reset action.       |
| Invalid transition     | Show validation message and do not mutate state.      |
| Missing required field | Keep user on the screen and show field-level message. |

## Role permissions summary

| Operation                   | QA Lead | QA Member | Release Manager | Viewer |
| --------------------------- | ------- | --------- | --------------- | ------ |
| View screens                | yes     | yes       | yes             | yes    |
| Switch role                 | yes     | yes       | yes             | yes    |
| Update test execution       | yes     | yes       | no              | no     |
| Create Test Result evidence | yes     | yes       | no              | no     |
| Change defect status        | yes     | limited   | no              | no     |
| Accept or reject risk       | yes     | no        | yes             | no     |
| Save release decision       | yes     | no        | yes             | no     |
| Export Evidence Pack        | yes     | yes       | yes             | yes    |
| Reset demo data             | yes     | yes       | yes             | yes    |

Limited defect status changes for QA Member are defined in `state-transitions.md` and UI validation.

## Completion criteria

Screen implementation is complete when:

- every required route is reachable
- every required visible element exists
- every mutation creates an activity log
- validation errors are visible
- disabled actions expose a reason
- role restrictions are enforced in UI and domain action handlers
- screen tests or E2E tests cover the first smoke flow
