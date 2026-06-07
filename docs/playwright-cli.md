# Playwright CLI Usage

This repository uses **Playwright CLI** as the primary browser automation and evidence collection interface for AI agents.

This document is intentionally limited to commands that start with `playwright-cli`.

## Boundary

| Area                        | In scope for this document                       | Out of scope for this document     |
| --------------------------- | ------------------------------------------------ | ---------------------------------- |
| Browser exploration         | `playwright-cli` commands                        | Playwright Test runner commands    |
| Evidence capture            | snapshots, screenshots, traces, console, network | test runner reports                |
| Session/auth state          | `playwright-cli` sessions and state files        | project-specific test fixtures     |
| Ad hoc browser verification | `playwright-cli` browser operations              | project test-suite runner commands |

Do not use this document as a project test-runner reference. Generator and healer may execute a project-defined test command, but that command must be discovered from the target project and is not part of the Playwright CLI skill. Ad hoc verification by driving the browser with `playwright-cli` is in scope.

## Prerequisites

The execution environment needs:

- Node.js
- shell command execution
- Playwright CLI available as `playwright-cli`
- permission to open the target application in a browser

Check availability:

```bash
playwright-cli --help
```

If `playwright-cli` is not available, browser exploration, UI evidence capture, tracing, and live browser verification are `BLOCKED`.

## Installation guidance

Recommended for local agent work:

```bash
npm install -g @playwright/cli@latest
playwright-cli --help
```

A project-local installation is also acceptable when the target project manages agent tooling locally. In that case, use the command form documented by the target project.

## Command discovery rule

Do not maintain a full static command list in this repository.

Before using an unfamiliar command or option, check current help:

```bash
playwright-cli --help
playwright-cli <command> --help
```

Use this repository for workflow guidance and QA-specific command selection, not exhaustive CLI documentation.

## Typical browser-operation commands

```bash
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
playwright-cli click <ref>
playwright-cli fill <ref> <value>
```

For use-case-specific guidance, start from the Playwright CLI skill reference map: `.agents/skills/playwright-cli/references/use-cases.md`. Open only the relevant `.agents/skills/playwright-cli/references/use-cases/use-case-*.md` file.

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
- If the required role or login state is unavailable, mark the exploration or browser-dependent healing phase as `BLOCKED`.
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
- browser states
