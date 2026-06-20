# Release QA Cockpit implementation plan

This document defines the recommended PR sequence for implementing Release QA Cockpit.

Do not implement the full app in a single large PR. The app is intentionally complex enough to test QA agents, so it must be built in reviewable slices.

## PR-1: App skeleton and deterministic data foundation

### Scope

- create `demo-apps/release-qa-cockpit/`
- add Vite, React, TypeScript setup
- add app-level `README.md` under `demo-apps/release-qa-cockpit/`
- add routing shell and global layout
- add IndexedDB wrapper and schema
- add seed data factory
- add Demo Data Reset flow
- add basic role switch
- add pure `calculateReadinessFromSnapshot` support for the default seed state
- add minimal `calculatePersistedReadiness` support that loads seed-derived data and delegates to `calculateReadinessFromSnapshot`
- add a minimal Dashboard that shows active release and persisted readiness

### PR-1 minimal readiness requirements

PR-1 must not hard-code the default Not Ready label for the seeded release.

The minimal readiness implementation must evaluate at least these seed-relevant blockers:

- required test execution `fail` -> Not Ready
- Critical or High unresolved blocking defect -> Not Ready
- High impact risk in `draft`, `pendingApproval`, or `rejected` -> Not Ready
- missing Test Result evidence -> Not Ready
- missing QA completion comment -> Not Ready

The implementation may leave non-seed Ready / At Risk branches incomplete until PR-2, but it must not hard-code release ID, release title, or readiness label.

### Acceptance criteria

- `npm install` works inside the app directory
- app starts locally
- first load creates deterministic seed data
- app-level `README.md` documents install, dev, check, reset behavior, and links to the canonical design docs
- Demo Data Reset restores deterministic business seed data as defined in `seed-scenarios.md`
- Demo Data Reset may update runtime-only fields such as `appSettings.lastResetAt`, and tests do not depend on exact runtime timestamps
- current user defaults to QA Lead
- current release defaults to `Weekly Release 2026-06`
- persisted readiness initially shows Not Ready
- the initial Not Ready result is produced by domain logic, not hard-coded UI text
- no out-of-scope stores are created

### Required tests

- unit test for seed factory
- unit test for default seed readiness returning Not Ready through `calculateReadinessFromSnapshot`
- adapter test for `calculatePersistedReadiness` loading seed-derived data if the IndexedDB wrapper is available
- unit test for reset behavior if isolated service is available
- smoke E2E that opens the app, selects QA Lead, resets data, and sees Not Ready

## PR-2: Complete readiness domain logic

### Scope

- complete `calculateReadinessFromSnapshot` for all Ready / At Risk / Not Ready rules
- complete `calculatePersistedReadiness` for all Ready / At Risk / Not Ready rules
- implement `calculateReadinessPreview`
- implement condition IDs
- implement deterministic clock handling using `appSettings.demoNow`
- implement decision save validation helpers
- keep readiness logic outside React components

### Acceptance criteria

- Ready, At Risk, and Not Ready are all reachable in unit tests
- blocker conditions win over warning conditions
- preview calculation uses draft QA completion comment
- persisted calculation does not use unsaved draft input
- Manual Note or External Reference evidence does not satisfy Test Result evidence requirement
- `qa-period-overdue` uses `appSettings.demoNow` when present

### Required tests

- full readiness unit test matrix from `readiness-rules.md` against `calculateReadinessFromSnapshot`
- preview versus persisted adapter test
- deterministic clock / overdue test
- decision save validation tests

## PR-3: Core release screens

### Scope

- Dashboard
- Releases
- Release Overview
- navigation links
- persisted readiness display
- summary cards or tables for tests, defects, risks, and latest decision

### Acceptance criteria

- user can open active release from Dashboard
- user can open release from Releases
- Release Overview shows persisted readiness conditions
- operational links navigate to test, defect, risk, decision, and export screens
- accessibility names follow `testability-rules.md`

### Required tests

- UI or E2E navigation test
- persisted readiness badge test
- release list / overview display test

## PR-4: QA operation screens

### Scope

- Test Execution screen
- Defect Triage screen
- Risk Review screen
- state transition domain handlers
- role restrictions for operational mutations
- activity log creation for successful transitions

### Acceptance criteria

- test execution status can follow allowed transitions
- defect can follow the smoke transition chain to closed
- risk can move from draft to pendingApproval to accepted
- invalid transitions do not mutate state
- Viewer cannot mutate operational data
- required reason fields are enforced

### Required tests

- unit tests for transition validators
- UI tests or E2E tests for one successful transition per area
- negative tests for invalid transition and missing reason
- role restriction tests

## PR-5: Release Decision

### Scope

- Release Decision screen
- persisted readiness badge
- preview readiness badge
- QA completion comment
- decision comment
- decision save actions
- Release Decision evidence creation
- activity log creation

### Acceptance criteria

- preview readiness changes with draft QA completion comment
- persisted readiness does not change before save
- Ready save is blocked while warnings exist
- At Risk save is blocked while unmet conditions exist
- At Risk save succeeds after blockers are resolved and warnings remain
- saving creates `decisions`, `evidenceItems`, and `activityLogs`

### Required tests

- preview versus persisted UI test
- At Risk save success test
- Ready blocked by accepted High risk test
- missing QA completion comment validation test

## PR-6: Evidence Pack Export

### Scope

- Evidence Pack Export screen
- Markdown generation service
- Markdown preview
- copy and optional download actions
- activity log creation

### Acceptance criteria

- Markdown is generated from current persisted IndexedDB state
- Markdown includes all required sections
- export does not persist report history
- export action creates activity log
- export action does not create an `EvidenceItem` unless a future design explicitly changes `data-model.md`
- Evidence Pack uses latest persisted decision, not unsaved preview input

### Required tests

- unit test for Markdown generator
- UI test for required sections
- E2E export generation test

## PR-7: First smoke E2E and workflow target profile

### Scope

- complete first smoke E2E scenario
- update app README under `demo-apps/release-qa-cockpit/` with final commands and test coverage notes
- add optional detailed docs under `demo-apps/release-qa-cockpit/docs/` if needed
- add target project profile artifact or example
- document local commands
- integrate app check into CI or document pending CI task

### Acceptance criteria

- E2E covers reset -> resolve blockers -> pass test -> create evidence -> accept risk -> save At Risk -> export Markdown -> reset
- E2E uses accessible selectors as primary strategy
- target profile documents base URL, commands, data policy, generation path, and reset flow
- app check commands are documented

### Required tests

- full first smoke E2E
- at least one role restriction E2E or UI test
- app check command passes locally

## Optional PR-8: Hardening and additional scenarios

### Scope

- responsive layout polish
- additional seed scenarios
- additional negative E2E tests
- coverage ledger examples
- service mapping artifacts using Release QA Cockpit as target

### Acceptance criteria

- no MVP behavior changes without updated docs
- additional scenarios do not break default seed determinism

## Implementation order rules

- Build deterministic seed and reset before broad E2E.
- Build enough domain readiness logic in PR-1 to avoid hard-coded readiness UI.
- Introduce `calculateReadinessFromSnapshot` before expanding UI-dependent readiness behavior.
- Complete readiness domain rules before complex operational UI.
- Do not generate tests from an unvalidated design.
- Do not weaken readiness rules to make E2E pass.
- Do not add out-of-scope stores for convenience.
- Do not hide invalid operations without enforcing domain validation.

## Suggested app scripts

Inside `demo-apps/release-qa-cockpit/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check": "npm run lint && npm run typecheck && npm run test && npm run test:e2e"
  }
}
```

The exact lint command may vary, but the app must expose a single `npm run check` command.

## CI integration expectation

The demo app may be integrated into root CI in a later implementation PR, but the plan must not pretend root `npm run check` already validates the app until that integration exists.

Recommended CI shape:

```yaml
- name: Install Release QA Cockpit
  run: npm ci
  working-directory: demo-apps/release-qa-cockpit

- name: Check Release QA Cockpit
  run: npm run check
  working-directory: demo-apps/release-qa-cockpit
```

## Completion criteria for the full MVP

The MVP implementation is complete when:

- all PR-1 through PR-7 acceptance criteria are satisfied
- all canonical docs remain consistent with implementation
- the first smoke E2E passes from a clean browser context
- the app can be used by `playwright-service-mapper` as a service-wide target
- generated tests can rely on accessible selectors defined in `testability-rules.md`
- Demo Data Reset provides repeatable starting state for future agent runs
