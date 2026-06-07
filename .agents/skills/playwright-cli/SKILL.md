---
name: playwright-cli
description: Use Playwright CLI shell commands for browser exploration, snapshots, screenshots, session/state management, tracing, and focused Playwright test execution without requiring an MCP client. Use this as the default browser automation capability for common agents such as Codex, OpenCode, Cursor, or any coding agent that can run shell commands.
---

# Playwright CLI

You are the shared browser automation capability for this repository.

Use `playwright-cli` for browser exploration and UI evidence collection when the agent can run shell commands. This skill is the default browser automation path for the common workflow. MCP may still be used when explicitly configured and requested, but do not require MCP for normal service mapping, planning, generation, or healing.

This skill covers browser interaction and evidence capture. It does not replace the role skills:

- `playwright-service-mapper` decides how to map the whole service.
- `playwright-test-planner` decides how to plan a feature.
- `playwright-test-plan-validator` decides whether a plan can proceed.
- `playwright-test-generator` writes Playwright test code.
- `playwright-test-healer` diagnoses and repairs failing tests.

Use this skill from those roles whenever browser automation, screenshots, snapshots, tracing, storage state, console logs, network inspection, or focused test execution is needed.

## Required capability

The agent must be able to run shell commands in the repository.

Preferred command:

```bash
playwright-cli --help
```

Fallback command:

```bash
npx playwright-cli --help
```

If neither works, do not fabricate browser exploration. Mark the current phase as `BLOCKED` and record the missing capability in the relevant log file.

## Installation guidance

Do not install packages without user permission unless the project already allows dependency/tool installation.

When installation is allowed, prefer one of these:

```bash
npm install -g @playwright/cli@latest
```

or use the local npx form:

```bash
npx playwright-cli --help
```

If browsers are missing and installation is allowed:

```bash
playwright-cli install-browser
```

or:

```bash
npx playwright-cli install-browser
```

## Session naming

Use a stable session name per run so commands operate on the same browser context.

Recommended session name:

```text
<scope-or-feature>-<run-id>
```

Recommended environment variable:

```bash
PLAYWRIGHT_CLI_SESSION=<scope-or-feature>-<run-id>
```

If the shell does not preserve environment variables across commands, pass the session explicitly when supported:

```bash
playwright-cli -s=<scope-or-feature>-<run-id> <command>
```

Use separate sessions for different roles only when isolation is required. Otherwise, keep one session per run so service-mapper, planner, generator, and healer can reuse browser state intentionally.

## Command wrapper convention

Use the shortest available command that works in the environment.

Preferred:

```bash
playwright-cli <command>
```

Fallback:

```bash
npx playwright-cli <command>
```

Record which wrapper was used in:

```text
artifacts/<scope-or-feature>/runs/<run-id>/00_run-metadata.json
```

## Browser opening

Open the target page with:

```bash
playwright-cli open <url>
```

Use headed mode only when it helps debugging or the user needs to watch the browser:

```bash
playwright-cli open <url> --headed
```

Use persistent profile mode only when the task explicitly requires using an existing logged-in browser profile or preserving local state:

```bash
playwright-cli open <url> --persistent --profile=<path>
```

Do not silently use a personal browser profile for destructive or sensitive flows.

## Snapshot and screenshot workflow

After each meaningful navigation or UI state change, capture both structure and visual evidence when possible.

```bash
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
```

Use snapshots for:

- roles
- labels
- accessible names
- locator candidates
- refs for the next command
- DOM-accessible text and controls

Use screenshots for:

- actual layout
- visibility
- overlap
- clipping
- disabled-looking controls
- modal/drawer/menu state
- loading, empty, and error states
- canvas, charts, icons, maps, custom widgets, or other visual-only areas

Save snapshots under:

```text
artifacts/<scope-or-feature>/runs/<run-id>/evidence/snapshots/
```

Save screenshots under:

```text
artifacts/<scope-or-feature>/runs/<run-id>/evidence/screenshots/
```

Record both in the role's `evidence-index.md`.

Do not mark a screen or major UI state as fully explored from snapshot evidence alone unless screenshots are unavailable and the reason is recorded.

## Interaction workflow

Prefer ref-based commands from the latest snapshot:

```bash
playwright-cli click <ref>
playwright-cli fill <ref> <text>
playwright-cli select <ref> <value>
playwright-cli check <ref>
playwright-cli uncheck <ref>
playwright-cli press <key>
```

After an interaction:

1. Capture or inspect the resulting page state.
2. Save screenshot evidence when visual state matters.
3. Save snapshot evidence when refs, labels, or accessible names matter.
4. Record the action and observation in the current role log.

## Vision fallback

Use coordinate-based mouse commands only when snapshot refs cannot cover the UI, such as canvas, map, chart, custom widgets, unlabeled icons, or visual-only controls.

Workflow:

```bash
playwright-cli screenshot --filename=<path>
playwright-cli mousemove <x> <y>
playwright-cli mousedown
playwright-cli mouseup
playwright-cli snapshot
```

Coordinate-based actions are weaker than ref-based actions. Always record:

- why ref-based interaction was not possible
- screenshot used for coordinates
- approximate coordinate target
- verification evidence after the action

## Storage state and authentication

When login state should be reused:

```bash
playwright-cli state-save <path>
playwright-cli state-load <path>
```

Recommended path:

```text
artifacts/<scope-or-feature>/runs/<run-id>/evidence/storage/<state-name>.json
```

Do not log passwords, tokens, cookies, session storage values, or sensitive personal data. If storage files are created, treat them as sensitive and do not commit them unless the user explicitly approves and the contents are safe.

## Console, network, and trace evidence

Use console, network, and tracing commands when behavior cannot be explained by the UI alone or when diagnosing failures.

Typical commands:

```bash
playwright-cli console
playwright-cli network
playwright-cli tracing-start
playwright-cli tracing-stop
```

Save outputs under:

```text
artifacts/<scope-or-feature>/runs/<run-id>/evidence/console/
artifacts/<scope-or-feature>/runs/<run-id>/evidence/network/
artifacts/<scope-or-feature>/runs/<run-id>/evidence/traces/
```

Record each evidence item in `evidence-index.md` and state what it proves.

## Test execution

For running Playwright Test suites, use the standard Playwright Test CLI, not `playwright-cli` browser commands.

Examples:

```bash
npx playwright test
npx playwright test tests/<feature>.spec.ts
npx playwright test tests/<feature>.spec.ts --project=chromium
npx playwright test tests/<feature>.spec.ts --trace=retain-on-failure
npx playwright test tests/<feature>.spec.ts --headed
npx playwright test tests/<feature>.spec.ts --debug
```

Use the smallest relevant test scope first when healing or verifying generated tests.

Record commands and results in:

```text
artifacts/<feature>/runs/<run-id>/03_generator/generation-log.md
artifacts/<feature>/runs/<run-id>/04_healer/healing-report.md
```

## Logging requirements

Every browser command that materially affects the result must be logged in the current role's action log.

Minimum log fields:

```markdown
| Step | Command | Purpose | Observation | Evidence | Next |
|---:|---|---|---|---|---|
```

Do not write raw chain-of-thought. Write concise decision summaries instead:

- what was checked
- what was observed
- what evidence supports it
- what remains unverified
- what next action follows

## Safety rules

- Do not perform destructive final confirmations unless the user explicitly approves them.
- Do not store secrets in logs.
- Do not claim coverage without evidence.
- Do not rely on screenshots alone for locator choices when snapshots are available.
- Do not rely on snapshots alone for visual claims when screenshots or traces are available.
- Do not skip, weaken, or delete tests just to make a run pass.
