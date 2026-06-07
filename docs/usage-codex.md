# Using This Workflow with Codex

This repository supports Codex through the common-agent layer. The default browser automation path is Playwright CLI shell commands. MCP is optional.

## Files used by Codex

```text
AGENTS.md
.agents/skills/playwright-cli/SKILL.md
.agents/skills/playwright-service-mapper/SKILL.md
.agents/skills/playwright-test-planner/SKILL.md
.agents/skills/playwright-test-plan-validator/SKILL.md
.agents/skills/playwright-test-generator/SKILL.md
.agents/skills/playwright-test-healer/SKILL.md
.codex/config.toml  # optional MCP config
```

## Default browser automation

Use Playwright CLI first:

```bash
playwright-cli --help
npx playwright-cli --help
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
```

Run generated tests with the standard Playwright Test CLI:

```bash
npx playwright test tests/<feature>.spec.ts --trace=retain-on-failure
```

## Optional MCP server

`.codex/config.toml` contains optional MCP configuration:

```toml
[mcp_servers.playwright-test]
command = "npx"
args = ["playwright", "run-test-mcp-server"]
startup_timeout_sec = 30
tool_timeout_sec = 120
enabled = true
required = false
default_tools_approval_mode = "prompt"
```

Codex loads `.codex/config.toml` only when the project is trusted. If MCP is not available, continue with the `playwright-cli` skill instead of blocking the workflow.

## Recommended prompts

Service mapping:

```text
Use the playwright-service-mapper skill and the playwright-cli skill to explore the whole service. Write service mapping artifacts under artifacts/service-exploration/runs/<run-id>/.
```

Feature planning:

```text
Use the playwright-test-planner skill and the playwright-cli skill to create a feature-level test plan for `<feature>` under specs/. Reference the latest service mapping run if relevant.
```

Validation:

```text
Use the playwright-test-plan-validator skill to validate specs/<feature>.plan.md. If validation returns FAIL, do not generate tests. Send the refinement request back to the planner and re-run validation after the plan is updated.
```

Generation:

```text
Use the playwright-test-generator skill to generate Playwright tests from specs/<feature>.plan.md after the matching validation report under specs/_reviews/ returns PASS. Use playwright-cli for any live UI verification needed during generation.
```

Healing:

```text
Use the playwright-test-healer skill to run the failing tests, diagnose the root cause, and apply only safe minimal fixes. Use npx playwright test for test execution and playwright-cli for browser evidence.
```

## Operational rule

Do not ask Codex to “explore and generate everything” in one instruction for serious QA work.

Use the five-stage workflow for whole-service work:

1. Map the service
2. Plan one feature
3. Validate the feature plan
4. Generate tests
5. Heal failures

Use the four-stage workflow when the target feature is already known:

1. Plan
2. Validate
3. Generate
4. Heal

This keeps discovery, planning, and generation reviewable and reduces the risk of shallow or invented coverage.

## Service mapper / planner handoff

After service mapping, pick one row from `feature-inventory.md` and pass it to the planner.

Example:

```text
Use playwright-test-planner to create a plan for `conversation-detail`.
Reference artifacts/service-exploration/runs/20260607-013000/01_service_mapper/.
Use screens SCR-004 and SCR-005 and flow FLW-003.
```

The planner should create:

```text
specs/conversation-detail.plan.md
artifacts/conversation-detail/runs/<run-id>/01_planner/
```

## Planner / validator loop

The validator is intentionally strict. A failed validation is not a failure of the process; it is the mechanism that forces the planner to collect better evidence.

Use this loop:

```text
planner creates specs/<feature>.plan.md
validator creates specs/_reviews/<feature>.validation.md

if PASS:
  generator creates tests

if FAIL:
  planner reads the validation report
  planner re-explores or revises
  validator runs again
```
