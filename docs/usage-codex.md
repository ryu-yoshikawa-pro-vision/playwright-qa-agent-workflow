# Using Playwright CLI Skills with Codex

Codex can use this repository through common `.agents/skills/` and `AGENTS.md` instructions. No editor-specific integration is required.

## Required capability

Codex must be able to run shell commands.

Browser exploration and test execution should use Playwright CLI and Playwright Test CLI commands.

## Recommended prompts

Service mapping:

```text
Use the playwright-service-mapper skill and Playwright CLI to explore the whole service. Save artifacts under artifacts/service-exploration/ and update the handoff files.
```

Feature planning:

```text
Use the playwright-test-planner skill to create specs/<feature>.plan.md for the selected feature.
```

Validation:

```text
Use the playwright-test-plan-validator skill to validate specs/<feature>.plan.md before generation.
```

Generation:

```text
Use the playwright-test-generator skill to generate Playwright tests from a PASS-validated plan.
```

Healing:

```text
Use the playwright-test-healer skill to diagnose and safely fix the failing Playwright test.
```

## Operational rule

Do not ask Codex to explore and generate everything in one step for serious QA work. Use staged mapping, planning, validation, generation, and healing.
