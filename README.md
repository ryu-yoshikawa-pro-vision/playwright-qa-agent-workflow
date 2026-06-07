# Playwright Test Agents Compatibility Template

This repository contains Playwright Test Agent definitions and a common compatibility layer for using the same workflow across AI coding agents.

It is not a full Playwright test project by itself. It is a template layer for agents that can map, plan, validate, generate, and heal Playwright tests. The common workflow now defaults to Playwright CLI shell commands for browser automation, with Playwright Test MCP kept as an optional integration path.

## What this repository provides

| Area | Files | Purpose |
|---|---|---|
| Common agent layer | `AGENTS.md`, `.agents/skills/`, `docs/` | Shared workflow used by Codex, OpenCode, and other shell-capable coding agents |
| Playwright CLI browser automation | `.agents/skills/playwright-cli/SKILL.md`, `docs/playwright-cli.md` | Default browser automation path without requiring MCP client setup |
| Codex optional config | `.codex/config.toml` | Optional Codex project config, including optional Playwright Test MCP configuration |
| Other MCP clients | `.mcp.json`, `.vscode/mcp.json` | Reference MCP configuration only; not required for the common Playwright CLI workflow |

Future customizations should usually be made in the common agent layer. Do not add Claude Code / GitHub Copilot / OpenCode-specific prompt files unless explicitly requested.

## Agent workflow

The common workflow has five roles.

### 1. Service Mapper

Explores the whole service and creates service-level discovery artifacts.

Use when:

- the user asks to explore the whole service
- all screens/pages need to be discovered
- the application must be mapped before feature-level test planning
- feature candidates need to be identified and prioritized

Outputs are written under:

```text
artifacts/service-exploration/runs/<run-id>/
```

The service mapper does not create one giant service-wide test plan. It creates a screen inventory, navigation map, service map, and feature inventory.

### 2. Planner

Explores one feature, page, or flow and writes a Markdown test plan under `specs/`.

Use when:

- there is no feature-level test plan yet
- the UI needs to be explored for one target feature
- test scenarios need to be designed before code generation

### 3. Plan Validator

Reviews the planner output before generation.

Use immediately after the planner creates or updates a plan.

The validator returns one decision:

- `PASS`: the plan is ready for generation
- `FAIL`: the planner must re-explore or revise the plan
- `BLOCKED`: required inputs are missing or inaccessible

Validation reports are saved under:

```text
specs/_reviews/<feature>.validation.md
```

### 4. Generator

Converts a validated Markdown test plan into Playwright Test code.

Use only when:

- a plan exists under `specs/`
- the matching validation report exists under `specs/_reviews/`
- the validation decision is `PASS`

### 5. Healer

Runs, diagnoses, and safely repairs failing Playwright tests.

Use when:

- existing tests fail
- selectors or assertions need repair
- a trace/debug session needs analysis

The healer must not hide failures by skipping tests unless explicitly approved.

## Quality gate loop

Use this loop for whole-service discovery:

```text
service-mapper -> planner -> plan-validator -> PASS -> generator -> healer, if tests fail
```

Use this loop for one known feature:

```text
planner -> plan-validator -> PASS -> generator -> healer, if tests fail
```

Use this loop when planning quality is insufficient:

```text
planner -> plan-validator -> FAIL -> planner refinement -> plan-validator again
```

Do not ask the generator to create tests from an unvalidated plan. The validator exists to prevent shallow, generic, or invented plans from becoming brittle Playwright tests.



## Browser automation mode

The common workflow defaults to Playwright CLI. This means OpenCode or another shell-first agent can use the repository without an OpenCode-specific MCP configuration.

Use:

```bash
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
playwright-cli click <ref>
playwright-cli fill <ref> <text>
```

Fallback:

```bash
npx playwright-cli <command>
```

Use the standard Playwright Test CLI for test execution:

```bash
npx playwright test tests/<feature>.spec.ts --trace=retain-on-failure
```

MCP remains optional. Use MCP only when the selected agent/client is already configured for it or the user explicitly requests it. See `docs/playwright-cli.md`.

## Visual evidence policy

Exploration and healing must not rely on Playwright snapshots alone.

Use both evidence types when tooling allows it:

- snapshots for roles, labels, accessible names, locator candidates, and DOM-accessible text
- screenshots for actual visual state, layout, visibility, modal/drawer state, loading/empty/error states, and UI overlap or clipping

A discovered screen or major UI state should not be marked as fully explored unless it has screenshot or trace evidence, or the missing visual evidence is explicitly explained.

The common evidence index format is defined in `docs/artifact-conventions.md`.

## Artifact locations

See `docs/artifact-conventions.md` for the complete convention.

Important paths:

```text
# Service-wide exploration
artifacts/service-exploration/runs/<run-id>/

# Feature plan
specs/<feature>.plan.md

# Feature-level planning evidence
artifacts/<feature>/runs/<run-id>/01_planner/

# Validation
specs/_reviews/<feature>.validation.md
artifacts/<feature>/runs/<run-id>/02_validator/

# Generated tests
tests/<feature>.spec.ts
artifacts/<feature>/runs/<run-id>/03_generator/

# Healing evidence
artifacts/<feature>/runs/<run-id>/04_healer/
```

## Optional Playwright Test MCP server

The common workflow does not require MCP. If MCP is explicitly requested, the Playwright Test MCP server can be started with:

```bash
npx playwright run-test-mcp-server
```

The existing MCP configurations are reference examples only:

- `.mcp.json`
- `.vscode/mcp.json`
- `.codex/config.toml`

## Using with Codex or common agents

Common support is implemented through:

```text
AGENTS.md
.codex/config.toml
.agents/skills/playwright-cli/SKILL.md
.agents/skills/playwright-service-mapper/SKILL.md
.agents/skills/playwright-test-planner/SKILL.md
.agents/skills/playwright-test-plan-validator/SKILL.md
.agents/skills/playwright-test-generator/SKILL.md
.agents/skills/playwright-test-healer/SKILL.md
```

Recommended usage examples:

```text
Use the playwright-service-mapper skill to explore the whole service and create service mapping artifacts.
```

```text
Use the playwright-test-planner skill to create a feature-level test plan for `conversation-detail` using the latest service mapping run.
```

```text
Use the playwright-test-plan-validator skill to validate specs/<feature>.plan.md. If it fails, send the refinement request back to the planner instead of generating tests.
```

```text
Use the playwright-test-generator skill to generate Playwright tests from specs/<feature>.plan.md after validation passes.
```

```text
Use the playwright-test-healer skill to diagnose and fix the failing Playwright tests.
```

Codex loads project-scoped config from `.codex/config.toml` only for trusted projects. Machine-local provider, auth, and profile settings should stay in `~/.codex/config.toml`.

## Using with other agents

For shell-capable agents such as OpenCode, use the `playwright-cli` skill and shell commands. MCP setup is not required.

For MCP-capable agents where MCP is explicitly desired, configure an MCP server with:

```json
{
  "command": "npx",
  "args": ["playwright", "run-test-mcp-server"]
}
```

Then provide the role instructions from either:

- `AGENTS.md`
- `.agents/skills/*/SKILL.md`

See `docs/agent-compatibility.md` for guidance.

## Repository conventions

- Service-wide discovery artifacts go under `artifacts/service-exploration/`.
- Test plans go under `specs/`.
- Validation reports go under `specs/_reviews/`.
- Generated tests should go under `tests/` unless another path is specified.
- `seed.spec.ts` is the default seed test.
- Generated tests should preserve traceability to their source plan and validation report.
- Compatibility additions should usually be made in `AGENTS.md`, `.agents/skills/`, or `docs/`.

## Important limitation

This repository does not currently include:

- `package.json`
- `playwright.config.ts`
- real application fixtures
- real generated test suites

If you want this to become a runnable Playwright project, add those files separately.
