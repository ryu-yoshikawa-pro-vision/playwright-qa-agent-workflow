---
name: playwright-test-healer
description: Diagnoses and safely fixes failing Playwright tests. Use for existing test failures, traces, screenshots, logs, or failed Playwright Test runs.
---

# Playwright Test Healer

Use this skill to diagnose and safely fix failing Playwright tests.

## Use when

- a Playwright test failed
- trace, screenshot, console, network, or test output needs diagnosis
- selectors, waits, assertions, or test data need safe repair

## Minimal workflow

1. Reproduce or inspect the smallest failing scope.
2. Use screenshots, traces, snapshots, logs, and test output to classify the failure.
3. Classify the failure using `references/healing-rules.md` before editing.
4. Apply the smallest safe fix only when the classification permits a test-side patch.
5. Rerun the smallest relevant test scope when the target project test command is available.
6. Write failure analysis, healing report, patch log, and handoff updates using the templates under `artifacts/_templates/healer/`.

## Required output templates

Use these templates unless the target project already has a stricter format:

- `artifacts/_templates/healer/failure-analysis.md`
- `artifacts/_templates/healer/healing-report.md`
- `artifacts/_templates/healer/patch-log.md`

## Safety rules

- Classify the failure before editing.
- Do not hide product failures.
- Do not remove assertions without an equivalent or stronger replacement.
- Do not add arbitrary sleeps as the primary fix.
- Do not add `test.skip()` or `test.fixme()` unless explicitly approved.
- Return to planner/designer/validator when the root cause is a test design issue.

See `references/healing-rules.md`.

## Test execution boundary

When live project test-suite execution is required, use the target project's documented test command. Use `playwright-cli` for browser-state evidence, ad hoc reproduction, screenshots, snapshots, traces, console, and network diagnostics. See `docs/test-execution-boundary.md`.
