---
name: playwright-test-generator
description: Generates Playwright Test code from a validated technique-based test design. Use only after the plan-validator returns PASS for both plan and test design.
---

# Playwright Test Generator

Use this skill to generate Playwright Test code from a PASS-validated test design.

## Preconditions

- `specs/<feature>.plan.md` exists
- `specs/<feature>.test-design.md` exists
- `specs/_reviews/<feature>.validation.md` exists
- validation decision is `PASS`
- validation report Plan SHA-256 matches the current plan
- validation report Test design SHA-256 matches the current test design
- semantic review decision is `PASS`
- test design review decision is `PASS`
- no semantic quality subsection is `FAIL` or `BLOCKED`
- no test design quality subsection is `FAIL` or `BLOCKED`

If these are not true, stop and report `BLOCKED`.

## Minimal workflow

1. Read the test design, plan, and validation report.
2. Read related evidence and handoff files.
3. Treat `specs/<feature>.test-design.md` as the primary source for generated cases.
4. Use `specs/<feature>.plan.md` as background for scope, setup, evidence, and risk.
5. Generate tests under `tests/` unless another path is requested.
6. Preserve traceability with comments linking test-design cases, source plan, validation, and evidence.
7. Write `test-mapping.md` and generation artifacts.
8. Update feature-level handoff files.

## Rules

- Do not invent behavior not in the validated test design.
- Do not implement excluded cases unless the user explicitly requests it.
- Prefer user-facing locators.
- Do not weaken assertions for convenience.
- Record unimplemented cases and reasons.

See `references/generation-rules.md`.

## Test execution boundary

When live project test-suite execution is required, use the target project's documented command. Do not put Playwright Test runner commands into the `playwright-cli` skill or references.
