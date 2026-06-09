# Target Project Profile

A target project profile records the target application's connection, execution, authentication, data, and generation rules before an agent performs browser exploration, test generation, or healing against a real project.

This repository provides common Playwright CLI and QA workflow rules. It does not own the target application's local startup, environment variables, test command, accounts, data policy, or CI setup. Record those project-specific details in a target project profile instead of asking the agent to infer them repeatedly.

## When to create one

Create or update a target project profile when:

- a new target application is introduced
- service-wide mapping needs a base URL, account, role, or environment
- feature planning depends on specific setup, seed data, or permissions
- the generator needs to know where tests should be written
- the healer needs to run or inspect the target project's test command
- destructive operations, shared data, integrations, or role-specific behavior need explicit boundaries

## Recommended location

For work managed from this repository, use a scope-level artifact:

```text
artifacts/<scope-or-feature>/TARGET_PROJECT_PROFILE.md
```

For service-wide exploration, the default location is:

```text
artifacts/service-exploration/TARGET_PROJECT_PROFILE.md
```

If the target project has its own QA documentation, keeping a copy there is also acceptable, for example:

```text
docs/qa/target-project-profile.md
```

When both locations exist, treat the target project's own profile as the source of truth and keep the local artifact profile as a referenced copy or handoff summary.

## Template

Start from:

```text
artifacts/_templates/target-project-profile.md
```

Do not leave important fields as `TBD` when the missing value affects exploration, generation, or healing. If a value is intentionally unknown, state the impact and next action in the blockers section.

## Required content

A useful profile should include:

- application name, target repository, branch, local path, environment, and base URL
- install, setup, and local start commands
- authentication method, role/account availability, and saved-state policy
- Playwright CLI session or attach policy
- full-suite, single-spec, debug, CI, and report commands when available
- data setup, cleanup, isolation, and shared-data restrictions
- safe operations, approval-required operations, and prohibited operations
- generated test path, helper/POM policy, locator policy, assertion policy, and cleanup policy
- known constraints, blockers, and change history

## Rules for agents

- Read the target project profile before browser exploration, generation, or healing when it exists.
- If the base URL, account/role, test command, or data policy is missing and the task depends on it, mark the affected operation as `BLOCKED` instead of guessing.
- Do not write passwords, tokens, cookies, refresh tokens, API keys, or session storage values in the profile.
- Saved authentication state must stay outside Git.
- Use the target project's documented test command for Playwright Test execution. Do not treat `playwright-cli` as the project test-suite runner.
- Record profile gaps in the relevant `OPEN_QUESTIONS.md` or handoff file when they affect downstream work.

## Relationship to other artifacts

The target project profile is not a feature plan, test design, or spec catalog entry. It describes how to connect to and safely operate the target project.

Use it as input for:

- `playwright-service-mapper`
- `playwright-test-planner`
- `playwright-test-generator`
- `playwright-test-healer`

Reusable product behavior discovered during work belongs in `artifacts/spec-catalog/`. Feature-specific scope, risks, and design inputs belong in `specs/<feature>.plan.md`. Implemented coverage belongs in `specs/<feature>.coverage.md`.
