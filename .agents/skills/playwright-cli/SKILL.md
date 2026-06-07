---
name: playwright-cli
description: Runs only playwright-cli commands for browser exploration, UI interaction, snapshots, screenshots, tracing, storage state, evidence capture, and ad hoc browser verification. Do not use for project test-suite runner commands.
---

# Playwright CLI

Use this skill as the browser-operation helper for the Playwright skill set.

This skill is for commands that start with `playwright-cli` only.

## Use when

- browser exploration is needed
- UI interaction is needed through refs or coordinates
- a snapshot, screenshot, PDF, trace, console log, network log, or storage state is needed
- another Playwright skill needs browser evidence
- ad hoc browser verification can be performed by driving the browser with `playwright-cli`

## Do not use when

- the task is only to run a project-defined test suite or test runner command
- the task is pure document review and needs no browser interaction
- the task can be answered from existing artifacts without new browser evidence

Project test-suite runner commands are outside this skill. Generator and healer may use a project-defined test command, but that command is not documented here. Ad hoc browser verification through `playwright-cli` is in scope.

## Required capability

The agent must be able to run shell commands.

Expected command family:

```bash
playwright-cli --help
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
playwright-cli click <ref>
playwright-cli fill <ref> <value>
```

If Playwright CLI is unavailable, browser exploration, UI evidence capture, tracing, and live browser verification are `BLOCKED`. Do not fabricate results.

## Rules

- Save evidence under paths defined in `docs/artifact-conventions.md`.
- Use snapshots for locator and accessibility information.
- Use screenshots and traces for visual behavior.
- Use the relevant use-case file from `.agents/skills/playwright-cli/references/use-cases.md` before choosing commands for exploration, evidence capture, tracing, session handling, debugging, or visual/coordinate-based work.
- Avoid destructive actions unless explicitly approved.
- Do not log or expose secrets, cookies, tokens, or credentials.

See:

- `references/commands.md`
- `references/use-cases.md`
- `docs/playwright-cli.md`
- `.agents/skills/playwright-cli/references/use-cases.md`
