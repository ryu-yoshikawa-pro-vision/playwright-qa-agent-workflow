# AGENTS.md

## Purpose

This repository provides common Playwright CLI based skills for AI coding agents.

The workflow is designed for QA work where an agent explores a web application, creates test plans, validates those plans, generates Playwright tests, and safely heals failing tests.

## Primary rule

Use **Playwright CLI** as the primary browser operation method.

## Tool roles

- Use `playwright-cli` for exploration, UI interaction, snapshots, screenshots, traces, and evidence capture.
- Use `npx playwright test` for executing generated or existing Playwright Test suites.

This repository does not require editor-specific integration. Use shell commands and Playwright CLI as the shared execution layer.

Expected command family:

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

If Playwright CLI is unavailable, browser exploration, screenshots, snapshots, traces, live verification, generation from live browser behavior, and live healing must be marked `BLOCKED`. Do not fabricate results.

For login-required exploration, follow `docs/playwright-cli.md#authentication-and-session-persistence`.

## Skills

| Skill | Use when | Do not use when |
|---|---|---|
| `playwright-cli` | Browser operation, snapshots, screenshots, tracing, and Playwright Test command execution are needed | The task is pure document review and needs no browser or test command |
| `playwright-service-mapper` | The request is to explore the whole service, all screens, or the entire application | The scope is already one known feature, page, or flow |
| `playwright-test-planner` | One feature, page, or flow is known and needs a test plan | The request is service-wide exploration |
| `playwright-test-plan-validator` | A Markdown plan must be validated before generation | The user asks to generate code directly from an unvalidated plan |
| `playwright-test-generator` | A plan has passed validation and tests should be generated | The plan has no PASS validation report |
| `playwright-test-healer` | Existing Playwright tests are failing and need diagnosis or safe repair | There is no failing test, trace, screenshot, log, or test output to inspect |

## Required workflow

Use the staged workflow unless the user explicitly asks for a narrower task.

```text
service-wide request
  -> playwright-service-mapper
  -> FEATURE_BACKLOG.md
  -> playwright-test-planner for one feature
  -> playwright-test-plan-validator
  -> playwright-test-generator when PASS
  -> playwright-test-healer when generated or existing tests fail
```

Feature-only request:

```text
playwright-test-planner
  -> playwright-test-plan-validator
  -> PASS: playwright-test-generator
  -> FAIL: playwright-test-planner revises and validator runs again
  -> failing tests: playwright-test-healer
```

Do not collapse mapping, planning, validation, generation, and healing into one vague task. These are separate quality gates.

## Repository conventions

Follow:

- `docs/workflow.md`
- `docs/playwright-cli.md`
- `docs/artifact-conventions.md`
- `docs/handoff-conventions.md`
- `docs/git-management.md`
- `docs/automatic-runtime-logging.md`

Important paths:

```text
specs/<feature>.plan.md
specs/_reviews/<feature>.validation.md
tests/<feature>.spec.ts
artifacts/<scope-or-feature>/HANDOFF.md
artifacts/<scope-or-feature>/OPEN_QUESTIONS.md
artifacts/<scope-or-feature>/FINDINGS.md
artifacts/<scope-or-feature>/DECISIONS.md
artifacts/service-exploration/FEATURE_BACKLOG.md
artifacts/<scope-or-feature>/runs/<run-id>/99_handoff.md
```

## Artifact and handoff rule

Detailed run artifacts prove what happened during one execution. Scope-level handoff files preserve what the next agent must read first.

A skill execution is not complete until it updates:

- run-level `99_handoff.md`
- scope-level `HANDOFF.md`
- `OPEN_QUESTIONS.md` when unresolved questions exist
- `FINDINGS.md` when reusable findings were discovered
- `DECISIONS.md` when meaningful decisions were made
- `FEATURE_BACKLOG.md` for service-wide feature candidates

Do not leave durable findings, open questions, decisions, or next actions only inside run-local logs.

## Visual evidence rule

Use snapshots and screenshots together.

- Use snapshots for accessible names, roles, labels, text structure, and locator candidates.
- Use screenshots and traces for layout, visibility, disabled states, modals, drawers, loading states, validation states, empty states, responsive layout, and visual regressions.

Do not mark a screen or state as fully explored when only snapshot text was checked and the claim depends on visual behavior.

## Safety rules

- Do not log or expose passwords, access tokens, refresh tokens, cookies, API keys, or credentials.
- Do not silently delete, skip, or weaken tests to make a run pass.
- Do not add `test.skip()` or `test.fixme()` unless the user explicitly asks.
- If behavior is not verified, mark it as `Unverified`.
- If an application defect is suspected, report it instead of changing the test to match broken behavior.

## Automatic runtime logging

Codex hooks and the OpenCode plugin may record supported prompt, tool, and session events to `.agent-logs/` automatically. Do not spend model tokens writing runtime logs manually. Keep `.agent-logs/` local by default.

## Git management

Git should track lightweight durable artifacts and not track heavy evidence or runtime logs. See `docs/git-management.md`.

## Automated structure checks

After modifying skills, artifact templates, validation reports, or runtime logging behavior, run:

```bash
npm run check:evals
```

Use narrower checks when appropriate:

```bash
npm run check:artifacts
npm run check:validation
npm run check:logs
```

These checks validate structure only. They do not prove that the explored application was fully covered or that generated tests are semantically correct.
