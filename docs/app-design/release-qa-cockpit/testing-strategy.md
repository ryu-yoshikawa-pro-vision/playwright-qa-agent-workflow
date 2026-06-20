# Release QA Cockpit testing strategy

This document defines the MVP testing strategy for the demo app.

The app is itself a Playwright QA Agent Workflow target, but it still needs its own quality gate. A broken demo app cannot fairly evaluate agent skills.

## Test layers

| Layer | Purpose | Required |
| --- | --- | --- |
| Unit tests | Validate deterministic domain logic. | yes |
| UI tests | Validate isolated UI behavior when practical. | recommended |
| E2E tests | Validate user-visible workflows with Playwright. | yes |
| Accessibility-oriented checks | Keep selectors and page structure stable. | yes |

## Unit test targets

Unit tests must cover:

- seed data factory
- demo reset service
- readiness calculation
- readiness preview calculation
- decision save validation
- test execution transition validation
- defect transition validation
- risk transition validation
- Evidence Pack Markdown generation

## Required readiness unit tests

Use the matrix from `readiness-rules.md`.

The most important cases are:

- blocker conditions win over warning conditions
- accepted High impact risk produces At Risk, not Ready
- reasoned skipped required test produces At Risk, not Ready
- Manual Note evidence alone does not satisfy the Test Result evidence requirement
- preview input affects preview readiness only

## Required E2E scenarios

### E2E-001: demo reset smoke

1. Open the app.
2. Continue as QA Lead.
3. Open Demo Controls.
4. Reset demo data.
5. Confirm `Demo data reset complete`.
6. Confirm `Readiness: Not Ready`.

### E2E-002: first release decision smoke

1. Reset demo data.
2. Open `Weekly Release 2026-06`.
3. Confirm persisted readiness is Not Ready.
4. Close the seeded High defect through valid transitions.
5. Move the linked test execution to retest.
6. Mark the linked test execution as passed.
7. Create Test Result evidence.
8. Submit and accept the seeded High risk.
9. Open Release Decision.
10. Enter QA completion comment.
11. Confirm preview readiness is At Risk.
12. Enter decision comment.
13. Save At Risk decision.
14. Confirm Release Decision evidence exists.
15. Generate Evidence Pack Markdown.
16. Confirm required Markdown sections exist.
17. Reset demo data.
18. Confirm readiness returns to Not Ready.

### E2E-003: viewer read-only behavior

1. Reset demo data.
2. Switch to Viewer.
3. Open Test Execution.
4. Confirm operational update controls are unavailable or show a read-only reason.
5. Open Release Decision.
6. Confirm decision save controls are unavailable or show a read-only reason.

### E2E-004: Ready blocked by accepted High risk

1. Resolve test and defect blockers.
2. Create Test Result evidence.
3. Accept the High risk.
4. Enter QA completion comment.
5. Confirm Ready save is unavailable.
6. Confirm At Risk save is available.

## Selector policy

E2E tests should use role and label selectors for primary operations:

```ts
page.getByRole('button', { name: 'Reset demo data' });
page.getByRole('button', { name: 'Confirm reset demo data' });
page.getByRole('heading', { name: 'Dashboard' });
page.getByLabel('QA completion comment');
```

Avoid CSS selectors for primary actions.

Allowed `data-testid` usage is defined in `testability-rules.md`.

## Test data isolation

Every E2E test must start from deterministic data.

Preferred setup:

```ts
await page.goto('/');
await page.getByRole('link', { name: 'Demo Controls' }).click();
await page.getByRole('button', { name: 'Reset demo data' }).click();
await page.getByRole('button', { name: 'Confirm reset demo data' }).click();
await expect(page.getByText('Demo data reset complete')).toBeVisible();
```

A lower-level helper may be introduced later, but the UI reset flow must remain covered.

## Suggested app commands

Inside `demo-apps/release-qa-cockpit/`:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run check
```

`npm run check` should run the local app quality gate.

## CI expectation

The app should eventually be checked independently from root workflow checks.

Recommended CI shape:

```yaml
- name: Install Release QA Cockpit
  run: npm ci
  working-directory: demo-apps/release-qa-cockpit

- name: Install Playwright browsers
  run: npx playwright install --with-deps
  working-directory: demo-apps/release-qa-cockpit

- name: Check Release QA Cockpit
  run: npm run check
  working-directory: demo-apps/release-qa-cockpit
```

Do not claim that root `npm run check` validates the demo app until CI is actually wired.

## Done definition

Testing is sufficient for MVP when:

- readiness unit test matrix passes
- transition validator tests pass
- Evidence Pack Markdown generation tests pass
- first smoke E2E passes from a clean browser context
- viewer read-only E2E passes
- tests use accessible selectors for primary operations
- Demo Data Reset is covered by E2E
- app-level `npm run check` exists and passes locally
