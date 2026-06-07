# Playwright CLI Agent Skills

This repository contains common AI-agent skills for Playwright CLI based QA workflows.

It is **Playwright CLI first** for browser exploration, UI interaction, snapshots, screenshots, traces, sessions, diagnostics, and evidence capture. Test execution is a separate target-project concern and is not part of the Playwright CLI skill.

It is not a full Playwright test project by itself. It is a reusable skill, artifact, handoff, test-design, and evaluation template layer for AI coding agents.

## What this repository provides

| Area | Files | Purpose |
|---|---|---|
| Common agent instructions | `AGENTS.md` | Repository-wide workflow rules |
| Common skills | `.agents/skills/` | CLI helper, service mapper, planner, test designer, validator, generator, healer |
| Skill details | `.agents/skills/*/references/` | Skill-specific output, evidence, technique, and workflow references |
| Workflow docs | `docs/workflow.md` | End-to-end flow and phase boundaries |
| Playwright CLI guidance | `docs/playwright-cli.md`, `.agents/skills/playwright-cli/references/commands.md`, `.agents/skills/playwright-cli/references/use-cases.md` | Browser operation, use-case selection, ad hoc verification, and evidence policy |
| Test execution boundary | `docs/test-execution-boundary.md` | Separation between Playwright CLI browser operations and target-project test execution |
| Artifact conventions | `docs/artifact-conventions.md` | Where outputs and evidence are stored |
| Handoff conventions | `docs/handoff-conventions.md` | What future agents must read and update |
| Git management | `docs/git-management.md` | What to track and what to ignore |
| Automatic runtime logging | `.codex/hooks.json`, `.codex/hooks/`, `.opencode/plugins/`, `docs/automatic-runtime-logging.md` | JSONL activity logging outside the model context |
| Evaluations | `evals/` | Skill routing and quality checks |
| Templates | `artifacts/_templates/`, `specs/` | Initial output templates |

## Primary tool

Use Playwright CLI for browser work.

## Tool roles

- `playwright-cli`: exploration, UI interaction, snapshots, screenshots, traces, sessions, diagnostics, and evidence capture.
- Target project test command: executing generated or existing tests when generator/healer requires it. This command is discovered from the target project and is intentionally not documented in the Playwright CLI skill.

## Minimum setup check

```bash
playwright-cli --help
```

Typical Playwright CLI commands:

```bash
playwright-cli --help
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
playwright-cli click <ref>
playwright-cli fill <ref> <value>
```

For test execution, use the target project's documented test command. See `docs/test-execution-boundary.md`.

If Playwright CLI is unavailable, browser exploration and evidence capture must be reported as `BLOCKED`.

For login-required exploration, see `docs/playwright-cli.md#authentication-and-session-persistence`.

## Skill workflow

```text
playwright-cli
  ↓
playwright-service-mapper
  ↓
playwright-test-planner
  ↓
playwright-test-designer
  ↓
playwright-test-plan-validator
  ↓ PASS
playwright-test-generator
  ↓ test failure
playwright-test-healer
```

Use `playwright-service-mapper` only for service-wide exploration. Use `playwright-test-planner` for one known feature, page, or flow. Use `playwright-test-designer` after planning to apply relevant test techniques and produce final test cases.

## Handoff layer

Each run produces detailed artifacts under `runs/<run-id>/`, but durable information must also be promoted to scope-level handoff files.

Service-wide work uses:

```text
artifacts/service-exploration/HANDOFF.md
artifacts/service-exploration/OPEN_QUESTIONS.md
artifacts/service-exploration/FINDINGS.md
artifacts/service-exploration/DECISIONS.md
artifacts/service-exploration/FEATURE_BACKLOG.md
```

Feature-level work uses:

```text
artifacts/<feature>/HANDOFF.md
artifacts/<feature>/OPEN_QUESTIONS.md
artifacts/<feature>/FINDINGS.md
artifacts/<feature>/DECISIONS.md
```

Every skill also writes `runs/<run-id>/99_handoff.md` before completion.

## Key durable outputs

```text
specs/<feature>.plan.md
specs/<feature>.test-design.md
specs/_reviews/<feature>.validation.md
```

The plan defines scope, assumptions, evidence, risks, behavior inventory, and design inputs. The test design selects techniques, applies them, and defines final independent test cases. The validation report records plan/design hashes and quality-gate decisions.

## Automatic runtime logging

Codex hooks and the OpenCode plugin write local JSONL runtime logs under `.agent-logs/` without asking the model to write logs. See `docs/automatic-runtime-logging.md`.

## Evaluation

Use `evals/` to check whether the correct skill is selected and whether the required artifacts are produced.

Minimum checks:

- service-wide request routes to `playwright-service-mapper`
- feature-level planning routes to `playwright-test-planner`
- technique-based design routes to `playwright-test-designer`
- generation is blocked until plan and test design validation returns `PASS`
- healer does not weaken tests to make failures disappear

## Git management

Track durable lightweight artifacts such as plans, test designs, validation reports, handoff files, templates, docs, and skills.

Do not track heavy runtime evidence such as screenshots, traces, videos, Playwright reports, runtime JSONL logs, or `artifacts/**/runs/` directories by default. Promote important findings into scope-level handoff files instead.

See `docs/git-management.md`.

## Known limitations

This repository does not include a full Playwright project setup. A target project still needs its own package setup, Playwright Test dependencies, configuration, authentication strategy, and target URLs.

## Automated structure checks

This repository includes lightweight structure checks for the common Playwright CLI workflow.

```bash
npm run check:artifacts
npm run check:validation
npm run check:semantic
npm run check:test-design
npm run check:logs
npm run check:evals
```

These checks validate required artifact files, validation report hashes, fixtures, and runtime JSONL log structure. They do not replace human QA review or real Playwright test execution.


## Workflow harness

Use the thin workflow harness for feature-level artifact setup and gate checks. It does not run an LLM, does not operate Playwright CLI, and does not assume a target Playwright project layout.

```bash
npm run agent:init -- --feature login --request "Design login tests"
npm run agent:status -- --feature login
npm run agent:next -- --feature login
npm run agent:gate -- --feature login --for generator
```

Use `agent:gate`, not `check:validation`, as the generator-readiness decision. See `docs/workflow-harness.md` for details.
