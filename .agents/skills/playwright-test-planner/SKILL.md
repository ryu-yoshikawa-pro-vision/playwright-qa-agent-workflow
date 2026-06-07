---
name: playwright-test-planner
description: Creates a test plan for one known feature, page, or flow using Playwright CLI evidence. Use after the target scope is known. Do not use for service-wide exploration.
---

# Playwright Test Planner

Use this skill to create a Markdown test plan for one known feature, page, or flow.

## Use when

- a feature candidate from service mapping is ready for planning
- the user specifies one target page, feature, or flow
- a plan is needed before Playwright test generation

## Do not use when

- the request is to explore the whole service
- the user asks to generate code from a plan
- the user asks to repair failing tests

## Minimal workflow

1. Confirm the feature slug and run ID.
2. Read relevant handoff files and service-mapping artifacts.
3. Use `playwright-cli` for focused exploration and evidence capture.
4. Write `specs/<feature>.plan.md`.
5. Write planner artifacts under `artifacts/<feature>/runs/<run-id>/01_planner/`.
6. Update the feature-level handoff files.
7. Recommend `playwright-test-plan-validator` as the next skill.

## Plan requirements

The plan must include independent scenarios with starting state, test data, steps, expected results, and failure indicators. Unverified behavior must be marked `Unverified`.

See `references/plan-format.md`, `docs/artifact-conventions.md`, and `docs/handoff-conventions.md`.

