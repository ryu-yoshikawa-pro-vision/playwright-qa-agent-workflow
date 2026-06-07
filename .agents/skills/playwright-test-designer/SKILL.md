---
name: playwright-test-designer
description: Applies test design techniques to an approved feature plan and produces a technique-based test design. Use after playwright-test-planner and before validation/generation.
---

# Playwright Test Designer

Use this skill to turn a feature plan into a technique-based test design for Playwright Test generation.

The designer does not explore the whole service and does not generate code. It selects relevant test techniques, applies them to the planned feature, and writes the final test cases that the generator may later implement.

## Use when

- `specs/<feature>.plan.md` exists
- the target feature, page, or flow is already scoped by the planner
- the plan contains enough evidence, risks, roles, data assumptions, and design inputs to select test techniques
- the next output should be `specs/<feature>.test-design.md`

## Do not use when

- the target scope is still unknown
- service-wide exploration is needed
- the user asks to generate Playwright Test code
- the task is to repair failing tests
- the plan has blocking open questions that affect test design

## Inputs

Read, in this order:

1. `specs/<feature>.plan.md`
2. relevant service-mapping artifacts and evidence referenced by the plan
3. relevant `artifacts/spec-catalog/` entries for screens, features, flows, data, roles, and rules
4. `artifacts/<feature>/HANDOFF.md`
5. `artifacts/<feature>/OPEN_QUESTIONS.md`
6. `artifacts/<feature>/FINDINGS.md`
7. `artifacts/<feature>/DECISIONS.md`

If referenced evidence is missing or a central behavior is unverified, do not invent the design. Mark the output `BLOCKED` and state the missing input.

## Minimal workflow

1. Confirm the feature slug and run ID.
2. Read the plan and related handoff/evidence.
3. Identify test design areas from the plan: inputs, conditions, states, roles, data lifecycle, side effects, and risks.
4. Select only relevant test techniques using `references/technique-selection-rules.md`.
5. Explicitly reject non-applicable techniques with reasons. Do not force every technique into every feature.
6. Apply selected techniques and derive concrete test conditions.
7. Write `specs/<feature>.test-design.md` using `references/test-design-format.md`.
8. Write designer artifacts under `artifacts/<feature>/runs/<run-id>/02_test_designer/`.
9. Update feature-level handoff files.
10. Promote reusable design-relevant specification clarifications into `artifacts/spec-catalog/`, or add catalog open questions when reusable behavior remains unresolved.
11. Recommend `playwright-test-plan-validator` as the next skill.

## Output requirements

The main output is:

```text
specs/<feature>.test-design.md
```

The design must include:

- source plan path and current plan SHA-256 placeholder or value
- spec-catalog references used for design decisions
- evidence references used for design decisions
- selected and rejected techniques with reasons
- test conditions
- technique-specific analysis for selected techniques
- final independent test cases
- excluded cases and accepted risk
- blocking and non-blocking open questions

## Blocking conditions

Return or mark `BLOCKED` when:

- the source plan is missing
- the source plan has blocking open questions that affect expected behavior, data, roles, or permissions
- evidence required for a selected technique is missing
- the feature behavior is too ambiguous to derive expected results
- permission, state, or persistence behavior is asserted without evidence

## Rules

- Do not use all techniques mechanically.
- Do not create boundary values unless an input range, length, date, count, or numeric rule exists.
- Do not create state transition tables unless the feature has meaningful states.
- Do not create decision tables unless multiple conditions interact to change outcomes.
- Do not claim role differences unless role or permission evidence exists.
- Do not increase test count for appearance of rigor. Prefer fewer, better-justified cases.
- Keep every final test case independent and automatable unless explicitly marked otherwise.

See `references/test-techniques.md`, `references/technique-selection-rules.md`, `references/test-design-format.md`, `references/anti-patterns.md`, and `docs/spec-catalog.md`.
