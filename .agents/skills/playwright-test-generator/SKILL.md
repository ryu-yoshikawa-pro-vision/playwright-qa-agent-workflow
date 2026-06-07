---
name: playwright-test-generator
description: Generates Playwright Test code from a validated Markdown test plan. Use only after the plan-validator returns PASS.
---

# Playwright Test Generator

Use this skill to generate Playwright Test code from a PASS-validated plan.

## Preconditions

- `specs/<feature>.plan.md` exists
- `specs/_reviews/<feature>.validation.md` exists
- validation decision is `PASS`
- validation report SHA-256 matches the current plan

If these are not true, stop and report `BLOCKED`.

## Minimal workflow

1. Read the plan and validation report.
2. Read related evidence and handoff files.
3. Generate tests under `tests/` unless another path is requested.
4. Preserve traceability with comments linking plan, validation, and seed.
5. Write `test-mapping.md` and generation artifacts.
6. Update feature-level handoff files.

## Rules

- Do not invent behavior not in the plan.
- Prefer user-facing locators.
- Do not weaken assertions for convenience.
- Record unimplemented scenarios and reasons.

See `references/generation-rules.md`.

