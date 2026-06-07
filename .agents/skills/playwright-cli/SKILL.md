---
name: playwright-cli
description: Runs Playwright CLI commands for browser exploration, snapshots, screenshots, tracing, and Playwright Test execution. Use as the browser-operation helper for other Playwright skills.
---

# Playwright CLI

Use this skill as the browser-operation helper for the Playwright skill set.

## Use when

- browser exploration is needed
- a snapshot, screenshot, or trace is needed
- a Playwright test must be executed
- another Playwright skill needs command evidence

## Required capability

The agent must be able to run shell commands.

Expected commands:

```bash
playwright-cli --help
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
playwright-cli click <ref>
playwright-cli fill <ref> <value>
npx playwright test
npx playwright test <test-file> --trace=retain-on-failure
```

If Playwright CLI is unavailable, report `BLOCKED` and do not fabricate results.

## Rules

- Save evidence under paths defined in `docs/artifact-conventions.md`.
- Use snapshots for locator and accessibility information.
- Use screenshots and traces for visual behavior.
- Avoid destructive actions unless explicitly approved.
- Do not log or expose secrets, cookies, tokens, or credentials.

See `references/commands.md`.

