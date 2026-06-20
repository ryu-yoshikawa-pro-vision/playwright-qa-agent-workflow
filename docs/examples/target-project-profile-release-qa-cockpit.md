# Target Project Profile: Release QA Cockpit

This is the target project profile example for the built-in Release QA Cockpit demo app.

Use it when asking agents to explore, plan, design, generate tests, or heal tests against Release QA Cockpit.

## Application

| Field             | Value                                                   |
| ----------------- | ------------------------------------------------------- |
| Application name  | Release QA Cockpit                                      |
| Purpose           | Demo target app for Playwright QA Agent Workflow        |
| Target repository | `ryu-yoshikawa-pro-vision/playwright-qa-agent-workflow` |
| App path          | `demo-apps/release-qa-cockpit/`                         |
| Design docs       | `docs/app-design/release-qa-cockpit/`                   |
| Environment       | local                                                   |
| Default base URL  | `http://localhost:5173`                                 |

## Install and setup

Run inside the app directory:

```bash
cd demo-apps/release-qa-cockpit
npm install
```

## Local start

```bash
npm run dev
```

Expected local URL:

```text
http://localhost:5173
```

If the Vite port differs, record the actual URL in the run handoff.

## Authentication and roles

The MVP does not use real authentication.

Use the app's role switch UI:

- `Continue as QA Lead`
- `Continue as QA Member`
- `Continue as Release Manager`
- `Continue as Viewer`

Default seed user:

```text
user-qa-lead
```

Do not create or store passwords, cookies, tokens, or browser storage state in Git.

## Data policy

Release QA Cockpit uses local IndexedDB only.

The app must provide deterministic reset through the UI:

1. Open `Demo Controls`.
2. Click `Reset demo data`.
3. Click `Confirm reset demo data`.
4. Wait for `Demo data reset complete`.
5. Confirm `Readiness: Not Ready`.

Data Reset is a safe operation in this demo app.

## Seed scenario

Canonical seed behavior is defined in:

```text
docs/app-design/release-qa-cockpit/seed-scenarios.md
```

Default active release:

```text
Weekly Release 2026-06
```

Initial readiness:

```text
Not Ready
```

## Playwright CLI policy

Use Playwright CLI for:

- service-wide exploration
- accessibility snapshot inspection
- screenshots
- ad hoc UI verification
- evidence collection

Do not treat Playwright CLI as the app's test-suite runner.

## Project test commands

Run inside `demo-apps/release-qa-cockpit/` when implemented:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run check
```

If these commands do not exist yet, record that as a blocker instead of inventing substitute commands.

## Generated test path

Generated Playwright tests for the demo app should be placed under the target app unless a later implementation document says otherwise:

```text
demo-apps/release-qa-cockpit/tests/
```

Feature-level workflow artifacts in this repository still belong under:

```text
specs/<feature>.plan.md
specs/<feature>.test-design.md
specs/<feature>.coverage.md
specs/_reviews/<feature>.validation.md
artifacts/<feature>/
```

## Locator policy

Use the rules in:

```text
docs/app-design/release-qa-cockpit/testability-rules.md
```

Selector priority:

1. role
2. label
3. text
4. placeholder
5. `data-testid` only when allowed

## Safe operations

Agents may perform these without additional approval:

- switch demo role
- navigate screens
- reset demo data
- update seeded test execution statuses
- move seeded defects through valid states
- move seeded risks through valid states
- save a release decision in the demo app
- generate Evidence Pack Markdown

## Approval-required operations

The following require explicit user approval:

- changing canonical design docs
- changing seed IDs or seed titles
- changing readiness rules
- changing app dependency stack
- changing generated test location
- adding out-of-scope stores or integrations

## Prohibited operations

Agents must not:

- add real credentials
- add external API calls for MVP
- add remote persistence for MVP
- save browser auth state in Git
- create `comments`, `reportExports`, `reports`, or `reportHistory` stores in MVP
- use `examples/release-qa-cockpit/` as implementation path

## First recommended exploration target

Start service mapping from the Dashboard and active release.

The first focused feature for planning and design should be:

```text
release-decision
```

Reason: it exercises readiness rules, unsaved preview behavior, evidence requirements, At Risk save behavior, and activity log side effects.

## Known blockers before implementation

Until the app is implemented, browser exploration and test execution are blocked.

Agents should still be able to use the design docs to create implementation plans and review PRs.

## Change history

| Date       | Change                                           |
| ---------- | ------------------------------------------------ |
| 2026-06-20 | Added Release QA Cockpit target profile example. |
