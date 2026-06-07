# Playwright CLI Usage

This repository uses Playwright CLI as the primary browser automation and evidence collection interface for AI agents.

## Tool roles

Use two command families for different purposes:

| Command family | Purpose |
|---|---|
| `playwright-cli ...` | browser exploration, interaction, snapshots, screenshots, tracing, evidence capture |
| `npx playwright test ...` | executing generated or existing Playwright Test suites |

Do not confuse the two. `playwright-cli` is the exploration and evidence tool. `npx playwright test` is the test runner.

## Prerequisites

The execution environment needs:

- Node.js
- shell command execution
- Playwright CLI available as `playwright-cli`
- Playwright Test available in the target project when running generated tests

Check availability:

```bash
playwright-cli --help
npx playwright test --version
```

If `playwright-cli` is not available, the browser-exploration phase is `BLOCKED`.

If `npx playwright test` is not available, test execution and healing from live test output are `BLOCKED`, but document review and plan validation may still proceed.

## Typical commands

Exploration and evidence:

```bash
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
playwright-cli click <ref>
playwright-cli fill <ref> <value>
```

Test execution:

```bash
npx playwright test
npx playwright test <test-file> --trace=retain-on-failure
npx playwright show-report
```

## Authentication and session persistence

When exploration requires login state, prefer a named Playwright CLI session or saved browser state. Keep authentication state out of Git.

Examples:

```bash
PLAYWRIGHT_CLI_SESSION=<scope-or-feature> playwright-cli open <url>
playwright-cli state-save artifacts/<scope-or-feature>/auth/state.json
playwright-cli state-load artifacts/<scope-or-feature>/auth/state.json
```

Rules:

- Do not commit saved authentication state.
- Do not log passwords, tokens, cookies, session storage values, or local storage values.
- If the required role or login state is unavailable, mark the exploration or healing phase as `BLOCKED`.
- Record only the fact that a role/session was used, not the secret material behind it.

## Evidence policy

Use snapshots for locator and accessibility information.

Use screenshots and traces for visual behavior.

Do not claim that a screen or UI state was fully explored if only a snapshot was checked and the behavior depends on visual layout, visibility, disabled state, modals, drawers, loading states, validation messages, or responsive layout.

## Failure policy

If the necessary command is unavailable, report `BLOCKED`.

Do not fabricate:

- exploration results
- screenshots
- snapshots
- traces
- command outputs
- test execution results
