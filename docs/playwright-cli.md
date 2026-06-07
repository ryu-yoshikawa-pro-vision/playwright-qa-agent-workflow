# Playwright CLI Usage

This repository prefers Playwright CLI for common agent browser automation because it works through shell commands and does not require each AI client to support MCP configuration.

## Default browser automation mode

Use this order unless the user explicitly asks otherwise:

1. Playwright CLI through the `playwright-cli` skill
2. Playwright Test CLI for running generated tests
3. Playwright Test MCP only when explicitly configured or requested

## Two different CLIs

There are two command families that should not be mixed up.

### `playwright-cli`

Use for interactive browser automation and evidence capture:

```bash
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
playwright-cli click <ref>
playwright-cli fill <ref> <text>
playwright-cli tracing-start
playwright-cli tracing-stop
```

Fallback:

```bash
npx playwright-cli <command>
```

### `npx playwright test`

Use for running Playwright Test suites:

```bash
npx playwright test
npx playwright test tests/<feature>.spec.ts
npx playwright test tests/<feature>.spec.ts --trace=retain-on-failure
npx playwright test tests/<feature>.spec.ts --debug
```

Do not use `playwright-cli` as a replacement for the Playwright Test runner.

## Installation

Preferred global installation:

```bash
npm install -g @playwright/cli@latest
playwright-cli --help
```

Local npx usage:

```bash
npx playwright-cli --help
```

Install browser when needed:

```bash
playwright-cli install-browser
```

or:

```bash
npx playwright-cli install-browser
```

## Session convention

Use one stable session per run:

```bash
PLAYWRIGHT_CLI_SESSION=<scope-or-feature>-<run-id>
```

Recommended value examples:

```text
service-exploration-20260607-153000
login-20260607-161200
conversation-detail-20260607-170500
```

If environment variables are not preserved, use the `-s=<name>` form when available:

```bash
playwright-cli -s=<scope-or-feature>-<run-id> open <url>
```

## Evidence convention

Save evidence under the existing artifact run directory:

```text
artifacts/<scope-or-feature>/runs/<run-id>/evidence/
  screenshots/
  snapshots/
  traces/
  console/
  network/
  storage/
```

Record every important evidence file in the role's `evidence-index.md`.

## When to prefer Playwright CLI over MCP

Prefer Playwright CLI when:

- using OpenCode or another shell-first coding agent
- avoiding client-specific MCP setup
- working in a large codebase where lower token usage matters
- browser commands can be represented as concise shell commands
- the agent can manage files and logs in the repository

## When MCP may still be better

Use MCP when:

- the chosen client already has a working MCP setup
- the workflow relies on specialized Playwright Test Agent MCP tools
- a long-running specialized agent loop benefits from MCP-managed tool calls
- the user explicitly asks to use MCP

## Blocking rule

If neither `playwright-cli` nor `npx playwright-cli` is available and installation is not allowed, do not fabricate exploration results. Mark the current phase as `BLOCKED` and record the missing capability in the relevant log.
