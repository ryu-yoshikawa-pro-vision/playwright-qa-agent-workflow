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
3. Decide whether the cause is selector drift, timing, assertion mismatch, test data, environment, application behavior change, or unknown.
4. Apply the smallest safe fix.
5. Rerun the smallest relevant test scope.
6. Write failure analysis, healing report, patch log, and handoff updates.

## Safety rules

- Do not hide product failures.
- Do not remove assertions without an equivalent or stronger replacement.
- Do not add arbitrary sleeps as the primary fix.
- Do not add `test.skip()` or `test.fixme()` unless explicitly approved.

See `references/healing-rules.md`.

## Test execution boundary

When live project test-suite execution is required, use the target project's documented test command. Use `playwright-cli` for browser-state evidence, ad hoc reproduction, screenshots, snapshots, traces, console, and network diagnostics. See `docs/test-execution-boundary.md`.
