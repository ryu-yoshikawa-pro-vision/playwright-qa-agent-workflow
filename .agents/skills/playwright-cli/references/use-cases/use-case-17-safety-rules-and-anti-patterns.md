# Use Case 17: Safety rules and anti-patterns

This page is part of the Playwright CLI use-case reference. It intentionally documents only `playwright-cli ...` commands.

### Do

- use `playwright-cli --help` for current syntax
- combine snapshot and screenshot for important states
- re-snapshot after meaningful UI changes
- save visual evidence with meaningful filenames
- update handoff files after findings, questions, or decisions

### Do not

- treat `playwright-cli` as a test runner
- add Playwright Test runner commands to the Playwright CLI skill or references
- use stale refs after navigation or state changes
- claim visual coverage from snapshot-only evidence
- commit auth state, cookies, localStorage, traces with secrets, or runtime logs
- use coordinates when stable refs are available
- hide product failures by weakening tests
