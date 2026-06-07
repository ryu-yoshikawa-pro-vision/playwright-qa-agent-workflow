---
name: playwright-test-plan-validator
description: Validates a Markdown test plan before Playwright test generation. Use after planning and before generation to decide PASS, FAIL, or BLOCKED.
---

# Playwright Test Plan Validator

Use this skill as the quality gate between planning and generation.

## Use when

- a Markdown plan under `specs/` needs validation
- the generator is about to run
- a previous validation failed and the planner revised the plan

## Do not use when

- there is no plan to validate
- the user asks to generate tests directly
- the task is service-wide exploration

## Gate decisions

Return exactly one:

- `PASS`: generator may proceed
- `FAIL`: planner must refine or re-explore
- `BLOCKED`: validation cannot complete due to missing inputs

## Minimal workflow

1. Read the plan, related artifacts, visual evidence, and handoff files.
2. Check scope clarity, exploration evidence, scenario independence, coverage, generator readiness, and handoff completeness.
3. Calculate the current plan SHA-256.
4. Write `specs/_reviews/<feature>.validation.md` with source metadata including `Plan SHA-256`.
5. Update feature-level `HANDOFF.md` and `DECISIONS.md`.
6. If `FAIL`, provide concrete planner refinement instructions.

See `docs/validation-gate.md` and `references/quality-gate.md`.

