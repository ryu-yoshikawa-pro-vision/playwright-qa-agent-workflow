# Workflow

This repository uses a staged Playwright CLI based workflow.

## Service-wide workflow

Use this when the user asks to explore the entire application, all screens, all pages, or the whole service.

```text
playwright-service-mapper
  -> artifacts/service-exploration/FEATURE_BACKLOG.md
  -> choose one feature
  -> playwright-test-planner
  -> playwright-test-plan-validator
  -> PASS: playwright-test-generator
  -> failing tests: playwright-test-healer
```

Service mapping must not create one giant full-service test plan. It creates maps, inventories, findings, open questions, and feature candidates.

## Feature-level workflow

Use this when the target feature, page, or flow is already known.

```text
playwright-test-planner
  -> specs/<feature>.plan.md
  -> playwright-test-plan-validator
  -> PASS: playwright-test-generator
  -> FAIL: planner revises and validator reruns
```

## Test generation and healing

Generation is allowed only after validation returns `PASS`.

```text
validated plan
  -> tests/<feature>.spec.ts
  -> run the target project's documented test command when available
  -> failure: playwright-test-healer
```

Project test-suite execution is outside the Playwright CLI skill. Ad hoc browser verification through `playwright-cli` is in scope. Use `docs/test-execution-boundary.md` to keep browser evidence gathering, ad hoc verification, and project test-runner execution separate.

Healing must diagnose before editing. It must not delete tests, remove assertions, or add `test.skip()` / `test.fixme()` unless explicitly approved by the user.

## Handoff timing

Each skill must update the handoff layer before finishing.

Required run-level file:

```text
artifacts/<scope-or-feature>/runs/<run-id>/99_handoff.md
```

Required scope-level files:

```text
artifacts/<scope-or-feature>/HANDOFF.md
artifacts/<scope-or-feature>/OPEN_QUESTIONS.md
artifacts/<scope-or-feature>/FINDINGS.md
artifacts/<scope-or-feature>/DECISIONS.md
```

Service-wide work also updates:

```text
artifacts/service-exploration/FEATURE_BACKLOG.md
```

## Git policy summary

Track handoff summaries, plans, validation reports, docs, templates, and skills. Do not track run-local evidence, screenshots, traces, videos, Playwright reports, or runtime logs by default.

## Automated structure checks

Use the lightweight checks after agent runs or repository maintenance:

```bash
npm run check:artifacts
npm run check:validation
npm run check:logs
npm run check:evals
```

These commands verify artifact structure, validation report hashes, and runtime JSONL format. They are structural checks, not proof of feature coverage or test correctness.
