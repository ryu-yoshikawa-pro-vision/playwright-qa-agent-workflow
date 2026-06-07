# AGENTS.md

## Purpose

This repository packages a Playwright Test Agents workflow that can be reused by Codex and other common AI coding agents.

The common workflow has five roles:

1. **Service Mapper**: explores the whole service and creates a service map, screen inventory, navigation map, and feature inventory.
2. **Planner**: explores one feature, page, or flow and writes a Markdown test plan under `specs/`.
3. **Plan Validator**: reviews the planner output and decides whether it is ready for generation.
4. **Generator**: converts a validated test plan into Playwright Test files.
5. **Healer**: runs failing Playwright tests, diagnoses failures, and proposes safe fixes.

The repository-level common compatibility layer is kept under:

- `AGENTS.md`
- `.agents/skills/`
- `docs/`
- `.codex/config.toml` when Codex-specific configuration is needed

Prefer implementing future workflow changes in the common layer. Do not add tool-specific agent prompts unless the user explicitly asks for them.


## Browser automation mode

Default to **Playwright CLI** for browser automation in common-agent workflows. Use the `playwright-cli` skill whenever service mapping, feature planning, generation, or healing needs live browser interaction, snapshots, screenshots, tracing, console logs, network logs, storage state, or focused test execution.

Preferred browser automation order:

1. `playwright-cli` skill and shell commands
2. standard Playwright Test CLI, `npx playwright test`, for running test suites
3. Playwright Test MCP only when explicitly configured or requested

Do not require VS Code, OpenCode MCP configuration, or any other MCP client to run the common workflow. MCP is optional.

Key commands:

```bash
playwright-cli --help
npx playwright-cli --help
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
npx playwright test tests/<feature>.spec.ts --trace=retain-on-failure
```

See `docs/playwright-cli.md` and `.agents/skills/playwright-cli/SKILL.md`.

## Required workflow

Use the roles in this order unless the user explicitly asks for a narrower task:

```text
service-mapper -> planner -> plan-validator -> PASS -> generator -> healer, if tests fail
planner -> plan-validator -> PASS -> generator -> healer, if tests fail
planner -> plan-validator -> FAIL -> planner refinement -> plan-validator again
```

Use **service-mapper** before planner when the user asks for service-wide exploration, all screens, all pages, whole application discovery, or broad product understanding.

Use **planner** directly when the user asks for a specific feature, page, or flow.

Do not collapse these responsibilities into one vague task. Service discovery, feature planning, validation, generation, and healing are separate quality gates.

## Service mapping workflow

Service-wide exploration is not a feature plan.

When the user asks to explore the entire service, do not create a giant `full-service.plan.md`. Instead, run `playwright-service-mapper` and write service-level artifacts under:

```text
artifacts/service-exploration/runs/<run-id>/
```

Required service mapping outputs:

```text
00_request.md
01_service_mapper/exploration-log.md
01_service_mapper/service-map.md
01_service_mapper/screen-inventory.md
01_service_mapper/navigation-map.md
01_service_mapper/feature-inventory.md
01_service_mapper/role-permission-map.md
01_service_mapper/coverage-matrix.md
01_service_mapper/open-questions.md
01_service_mapper/evidence-index.md
01_service_mapper/service-mapper-summary.md
```

After service mapping, choose one feature from `feature-inventory.md` and hand it to `playwright-test-planner`.

## Planner / validator loop

The validator is the gatekeeper between planning and generation.

- If validation returns `PASS`, hand the plan and validation report to `playwright-test-generator`.
- If validation returns `FAIL`, do not run the generator. Send the validator's planner refinement request back to `playwright-test-planner`, then validate again.
- If validation returns `BLOCKED`, resolve the missing file/context/repository issue before continuing.

Validation reports should be saved under:

```text
specs/_reviews/<feature>.validation.md
```

## Artifact conventions

Follow `docs/artifact-conventions.md`.

## Visual evidence policy

Use snapshots and screenshots together when exploring, validating, generating, or healing UI behavior.

- **Snapshot evidence** is for roles, labels, accessible names, locator candidates, text, inputs, buttons, and DOM-accessible structure.
- **Screenshot evidence** is for actual visual state: layout, visibility, overlap, disabled-looking controls, modals, drawers, loading indicators, validation messages, empty states, responsive layout, clipping, and user-perceivable UI.
- A screen, modal, drawer, menu, table state, form state, validation state, or loading/empty/error state should not be marked as fully explored from snapshot evidence alone.
- For every discovered screen or major UI state, capture or reference both a snapshot and a screenshot when tooling allows it.
- If screenshot capture is unavailable or blocked, record the reason in the relevant `evidence-index.md`, `coverage-matrix.md`, or `coverage-map.md`.
- Do not make visual claims such as "visible", "hidden", "disabled", "overlapped", "shown in the modal", or "error appears on screen" without screenshot or trace evidence.
- When using screenshots, record what the image proves. Do not store an image without linking it to a screen, state, flow, or assertion.


Important paths:

```text
# Service-wide exploration
artifacts/service-exploration/runs/<run-id>/

# Feature planning
specs/<feature>.plan.md
artifacts/<feature>/runs/<run-id>/01_planner/

# Plan validation
specs/_reviews/<feature>.validation.md
artifacts/<feature>/runs/<run-id>/02_validator/

# Test generation
tests/<feature>.spec.ts
artifacts/<feature>/runs/<run-id>/03_generator/

# Healing
artifacts/<feature>/runs/<run-id>/04_healer/
```

A reviewer should be able to trace a generated test back to:

- the user request
- the exploration evidence
- the feature plan
- the validation decision
- the generator mapping
- any healer patch rationale

## Optional Playwright Test MCP server

The common workflow no longer requires MCP. Use Playwright CLI first.

If the user explicitly asks to use MCP, the expected MCP server name is `playwright-test` and it is started with:

```bash
npx playwright run-test-mcp-server
```

When using Codex, the project-scoped MCP configuration lives in `.codex/config.toml`. Treat MCP as optional unless the user or environment requires it.

## Repository conventions

- Service-wide discovery artifacts belong under `artifacts/service-exploration/`.
- Feature plans belong under `specs/`.
- Plan validation reports belong under `specs/_reviews/`.
- Generated Playwright tests should belong under `tests/` unless the user specifies another location.
- `seed.spec.ts` is the default seed/reference test file.
- Preserve links between generated tests and their source plans with comments such as:
  - `// spec: specs/<feature>.plan.md`
  - `// validation: specs/_reviews/<feature>.validation.md`
  - `// seed: seed.spec.ts`
- Prefer explicit, user-facing locators and resilient assertions.
- Do not silently delete, skip, or weaken tests to make a run pass.
- If behavior is not verified, mark it as `Unverified` instead of presenting it as fact.

## Safety rules for service mapping

The service mapper must not pretend it has full coverage without evidence.

- Record visited screens, navigation paths, and evidence.
- Record inaccessible or unverified areas explicitly.
- Avoid destructive final confirmations unless the user explicitly approves them.
- Split the service into feature candidates instead of producing one giant test plan.
- Recommend a feature-planning order based on risk, priority, and coverage confidence.

## Safety rules for plan validation

The validator must be strict enough to prevent shallow plans from becoming brittle tests.

- Do not allow the generator to run on a plan that lacks starting states, test data, steps, or observable expected results.
- Do not pass plans that read like generic QA advice instead of target-specific exploration output.
- Do not pass plans that invent behavior or hide uncertainty.
- Do not rewrite the plan as a substitute for planner refinement unless the user explicitly asks.
- On failure, provide exact planner actions: what to re-explore, what to clarify, what to mark as `Unverified`, and what evidence to add.

## Safety rules for test healing

The healer must not hide real failures.

- Do not add `test.skip()`, `test.fixme()`, or remove assertions unless the user explicitly asks for that action.
- If the application appears broken, report the suspected application issue instead of changing the test to match broken behavior.
- Prefer minimal, evidence-backed fixes.
- After any code change, rerun the smallest relevant test scope.
- If the issue cannot be fixed safely, produce a diagnostic report with:
  - failing test name
  - error summary
  - observed behavior
  - expected behavior
  - evidence used
  - recommended next action

## Updating this repository

For future changes, prefer adding or editing common guidance in:

- `AGENTS.md`
- `.agents/skills/`
- `docs/`

Do not add or maintain Claude Code / GitHub Copilot / OpenCode-specific agent prompt files unless the user explicitly asks.
