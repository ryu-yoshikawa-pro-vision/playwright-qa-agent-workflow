---
name: playwright-test-plan-validator
description: Validates a Markdown feature plan and technique-based test design before Playwright test generation. Use after planning/design and before generation to decide PASS, FAIL, or BLOCKED.
---

# Playwright Test Plan Validator

Use this skill as the quality gate between planning/design and generation.

## Use when

- `specs/<feature>.plan.md` and `specs/<feature>.test-design.md` need validation
- the generator is about to run
- a previous validation failed and the planner or designer revised the source files

## Do not use when

- there is no plan to validate
- there is no test design to validate
- the user asks to generate tests directly
- the task is service-wide exploration

## Gate decisions

Return exactly one:

- `PASS`: generator may proceed
- `FAIL`: planner or designer must refine or re-explore
- `BLOCKED`: validation cannot complete due to missing inputs

## Minimal workflow

1. Read the plan, test design, related artifacts, visual evidence, and handoff files.
2. Check plan scope clarity, exploration evidence, setup assumptions, and handoff completeness.
3. Check test-design technique selection, technique application, final cases, excluded cases, independence, and evidence traceability.
4. Apply `references/semantic-quality-gate.md` and `references/test-design-quality-gate.md`.
5. Calculate current SHA-256 values for both `specs/<feature>.plan.md` and `specs/<feature>.test-design.md`.
6. Write `specs/_reviews/<feature>.validation.md` with both source hashes and replace every decision placeholder with exactly one of `PASS`, `FAIL`, or `BLOCKED`.
7. Update feature-level `HANDOFF.md` and `DECISIONS.md`.
8. If `FAIL`, provide concrete planner/designer refinement instructions.

See `docs/validation-gate.md`, `references/quality-gate.md`, `references/semantic-quality-gate.md`, and `references/test-design-quality-gate.md`.
