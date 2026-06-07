---
name: playwright-test-planner
description: Creates a scoped feature plan and test-design inputs for one known feature, page, or flow using Playwright CLI evidence. Use after the target scope is known. Do not use for service-wide exploration or technique-based test design.
---

# Playwright Test Planner

Use this skill to create a Markdown plan for one known feature, page, or flow.

The planner defines what should be designed and why. It must not perform full technique-based test design; that belongs to `playwright-test-designer`.

## Use when

- a feature candidate from service mapping is ready for planning
- the user specifies one target page, feature, or flow
- design inputs are needed before technique-based test design

## Do not use when

- the request is to explore the whole service
- the user asks to apply test techniques or produce final test cases
- the user asks to generate code from a design
- the user asks to repair failing tests

## Minimal workflow

1. Confirm the feature slug and run ID.
2. Read relevant handoff files and service-mapping artifacts.
3. Use `playwright-cli` for focused exploration and evidence capture.
4. Write `specs/<feature>.plan.md`.
5. Write planner artifacts under `artifacts/<feature>/runs/<run-id>/01_planner/`.
6. Update the feature-level handoff files.
7. Recommend `playwright-test-designer` as the next skill.

## Plan requirements

The plan must include scope, entry point, setup assumptions, roles/permissions/data assumptions, evidence references, behavior inventory, risk assessment, and test design inputs. Unverified behavior must be marked `Unverified`.

The plan should not contain the final test-case set. Detailed technique application, final independent cases, excluded cases, and technique-specific tables belong in `specs/<feature>.test-design.md`.

See `references/plan-format.md`, `docs/artifact-conventions.md`, and `docs/handoff-conventions.md`.
