# Agent Compatibility Guide

This repository is intended to be maintained as a common-agent layer.

The default browser automation path is Playwright CLI, not MCP. This lets Codex, OpenCode, Cursor, and other shell-capable coding agents use the same workflow without client-specific MCP configuration.

## Level 1: Common shell-capable agents

Use this layer for Codex, OpenCode, Cursor, and similar coding agents:

| Purpose | Files |
|---|---|
| Repo instructions | `AGENTS.md` |
| Browser automation skill | `.agents/skills/playwright-cli/SKILL.md` |
| Reusable QA workflow skills | `.agents/skills/*/SKILL.md` |
| Workflow documentation | `docs/` |
| Optional Codex config | `.codex/config.toml` |

Common skills:

- `playwright-cli`
- `playwright-service-mapper`
- `playwright-test-planner`
- `playwright-test-plan-validator`
- `playwright-test-generator`
- `playwright-test-healer`

Prefer maintaining this layer instead of adding tool-specific prompt files.

## Level 2: Optional Playwright Test MCP support

MCP is optional. Use it only when the user explicitly requests MCP or the chosen agent already has a working MCP setup.

Reference MCP server definition:

```json
{
  "mcpServers": {
    "playwright-test": {
      "command": "npx",
      "args": ["playwright", "run-test-mcp-server"]
    }
  }
}
```

If the agent uses a different schema, preserve the command and args:

```text
command: npx
args: playwright run-test-mcp-server
```

Do not require VS Code or OpenCode MCP setup for the common workflow.

## Level 3: Agents without shell execution

Agents that cannot run shell commands and cannot use MCP can still review artifacts, but they should not be expected to perform live UI exploration.

Use them only for:

- reviewing service mapping artifacts
- reviewing test plans
- improving scenario wording
- validating planner output from existing artifacts
- reviewing generated Playwright code
- proposing locator/assertion improvements from provided traces or screenshots

Do not expect shell-free and MCP-free agents to discover the live UI accurately.

## Required role order for all agents

For whole-service discovery:

```text
playwright-cli -> service-mapper -> planner -> plan-validator -> generator -> healer
```

For a known feature:

```text
playwright-cli -> planner -> plan-validator -> generator -> healer
```

Generation is allowed only after validation returns `PASS`.

If validation returns `FAIL`, the next action is not generation. The next action is planner refinement using the validation report.

If validation returns `BLOCKED`, resolve missing context or missing browser automation capability before continuing.

## Recommended maintenance policy

Keep the workflow source of truth simple:

- cross-agent instructions live in `AGENTS.md`
- common reusable workflows live in `.agents/skills/`
- setup and compatibility notes live in `docs/`
- service mapping artifacts live in `artifacts/service-exploration/`
- feature plans live in `specs/`
- validation reports live in `specs/_reviews/`

Do not add or maintain Claude Code / GitHub Copilot / OpenCode-specific agent prompt files unless the user explicitly asks.
