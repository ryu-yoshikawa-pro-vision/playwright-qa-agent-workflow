# Workflow Harness

The workflow harness is a thin operational layer for feature-level agent work. It does not run an LLM, does not operate Playwright CLI, and does not assume that a target project already has Playwright installed.

Its purpose is to keep humans and agents aligned on:

- where artifacts should be written
- which workflow phase is complete
- which skill should run next
- whether generation is blocked by missing or stale validation

## Commands

| Command                                                  | Purpose                                              | Writes files? |
| -------------------------------------------------------- | ---------------------------------------------------- | ------------- |
| `npm run agent:init -- --feature <slug> --request "..."` | Create the feature workspace and a new run directory | Yes           |
| `npm run agent:status -- --feature <slug>`               | Show current plan/design/validation status           | No            |
| `npm run agent:next -- --feature <slug>`                 | Show the next recommended skill                      | No            |
| `npm run agent:gate -- --feature <slug> --for generator` | Check whether generator may run                      | No            |

## Feature slug rules

Feature slugs must use lowercase ASCII kebab-case:

```text
[a-z0-9]+(?:-[a-z0-9]+)*
```

Examples:

```text
login
conversation-detail
user-management
```

Invalid examples:

```text
../login
Login Screen
login_screen
login/test
login-
login--test
```

## Initialize a feature run

```bash
npm run agent:init -- --feature login --request "Design login tests"
```

This creates the feature-level workspace if missing and always creates a new run directory:

```text
artifacts/login/
  HANDOFF.md
  OPEN_QUESTIONS.md
  FINDINGS.md
  DECISIONS.md
  runs/<run-id>/
    00_request.md
    01_planner/
    02_test_designer/
    03_validator/
    04_generator/
    05_healer/
    evidence/
      screenshots/
      traces/
      snapshots/
      console/
      network/
    99_handoff.md
```

Existing scope-level files are not overwritten.

## Check current status

```bash
npm run agent:status -- --feature login
```

The status command reports:

- whether `specs/<feature>.plan.md` exists
- whether `specs/<feature>.test-design.md` exists
- whether `specs/_reviews/<feature>.validation.md` exists
- whether the generator gate is ready
- which skill should run next

The command is read-only.

## Get the next skill

```bash
npm run agent:next -- --feature login
```

The next-step rule is intentionally simple:

| State                                                                           | Next skill                                                                                |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Artifact scope missing                                                          | `agent:init`, then `playwright-test-planner`                                              |
| Plan missing                                                                    | `playwright-test-planner`                                                                 |
| Plan exists, test design missing                                                | `playwright-test-designer`                                                                |
| Plan and test design exist, validation missing                                  | `playwright-test-plan-validator`                                                          |
| Validation exists but is stale, missing decisions, non-PASS, or hash-mismatched | `playwright-test-plan-validator` or revise the source file named by the validation report |
| Validation gate passes                                                          | `playwright-test-generator`                                                               |

The harness does not inspect generated Playwright test files yet because the target project test layout is intentionally not fixed at this stage.

## Check the generator gate

```bash
npm run agent:gate -- --feature login --for generator
```

The generator gate passes only when:

- `specs/<feature>.plan.md` exists
- `specs/<feature>.test-design.md` exists
- `specs/_reviews/<feature>.validation.md` exists
- `Plan SHA-256` matches the current plan file
- `Test design SHA-256` matches the current test-design file
- overall `Decision` is `PASS`
- `Semantic Review Decision` is `PASS`
- `Test Design Review Decision` is `PASS`
- review subsection decisions are all `PASS`
- unresolved `PASS | FAIL | BLOCKED` placeholders are absent

This command reuses the same validation logic as `npm run check:validation`, but it is the command to use for generator readiness. `check:validation` is a repository consistency check and may report structural success for non-PASS validation states; `agent:gate` treats any non-PASS readiness state as blocked.

## Relationship to check commands

`check:*` commands validate repository structure and gate consistency.

`agent:*` commands support one feature workflow.

Use `agent:*` while progressing a feature. Use `agent:gate` before allowing generation. Use `check:*` before packaging or reviewing the repository.

## Out of scope

The harness intentionally does not do the following yet:

- call an LLM automatically
- operate Playwright CLI directly
- run target-project tests
- decide generated test file paths
- configure target project commands
- auto-heal failing tests
