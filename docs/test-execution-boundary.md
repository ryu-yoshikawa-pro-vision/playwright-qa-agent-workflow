# Test Execution Boundary

This repository separates browser exploration from test execution.

## Browser exploration, evidence, and ad hoc verification

Use `playwright-cli` commands for:

- opening and navigating pages
- snapshots and refs
- screenshots and visual evidence
- tracing browser flows
- console and network diagnostics
- storage state and session handling
- attaching to existing browser sessions
- ad hoc browser verification performed by interacting with the live UI

## Test execution

Executing generated or existing project test suites is outside the `playwright-cli` skill.

When generator or healer needs to run tests, use the target project's own documented test command. Discover it from the target project profile, the target project's README, package scripts, CI config, or existing developer workflow.

Do not document generic project test-runner commands inside the Playwright CLI skill or Playwright CLI references.

## Generator and healer rule

- Generator may produce test code, mapping artifacts, and instructions for how to run tests according to the target project.
- Healer may run or inspect the smallest relevant test scope when a project test command is available.
- If no project test command is available, mark live test execution as `BLOCKED` but continue with static review, plan review, trace review, screenshot review, or log review when available.
- If a target project profile exists and its test command, data policy, role, or environment constraints conflict with inferred project files, follow the profile and record the conflict in handoff or open questions.

## Why this boundary exists

`playwright-cli` is the agent-facing browser operation and ad hoc verification tool. Project test-suite execution belongs to the target project's test runner setup. Keeping these separate prevents agents from confusing browser-driven verification commands with project test-runner commands.
