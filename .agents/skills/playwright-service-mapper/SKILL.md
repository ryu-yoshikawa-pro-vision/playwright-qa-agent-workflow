---
name: playwright-service-mapper
description: Maps an entire web service with Playwright CLI before feature-level planning. Use for service-wide exploration, screen inventory, navigation mapping, and feature backlog creation. Do not use for a single feature test plan.
---

# Playwright Service Mapper

Use this skill for service-wide exploration.

## Use when

- the user asks to explore the whole service, all pages, all screens, or the full application
- the target feature is not yet known
- a feature backlog must be created before detailed test planning

## Do not use when

- the target is already one feature, page, or flow
- the user asks to generate Playwright Test code
- the user asks to heal an existing failing test

## Minimal workflow

1. Establish scope, target URL, account/role, and run ID.
2. Use `playwright-cli` to explore screens, navigation paths, and major states.
3. Capture snapshot and screenshot evidence for discovered screens and important states.
4. Write service maps and inventories under `artifacts/service-exploration/runs/<run-id>/01_service_mapper/` using the required formats in `references/output-formats.md`.
5. Promote durable findings, questions, decisions, and feature candidates to the scope-level handoff files.
6. Recommend the next feature for `playwright-test-planner`.

## Required outputs

See `references/outputs.md` and `references/output-formats.md`.

## Completion condition

This skill is not complete until `artifacts/service-exploration/HANDOFF.md` and `FEATURE_BACKLOG.md` are updated.

See also:

- `docs/service-mapping.md`
- `docs/artifact-conventions.md`
- `docs/handoff-conventions.md`

