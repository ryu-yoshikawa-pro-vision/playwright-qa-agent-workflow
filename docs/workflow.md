# Workflow

This repository uses a staged Playwright CLI based workflow.

## Target project profile

Before an agent performs browser exploration, test generation, or healing against a real target application, read the target project profile when it exists.

```text
target project profile
  -> connection, authentication, test command, data policy, and generation rules
  -> service mapper / planner / generator / healer inputs
```

Use `docs/target-project-profile.md` and `artifacts/_templates/target-project-profile.md` to create one. If the base URL, role/account, test command, or data policy is missing and the current task depends on it, mark the affected operation as `BLOCKED` instead of guessing.

## Shared specification catalog

Reusable specification knowledge belongs in `artifacts/spec-catalog/`. Service mapping, focused planning, and test design may all contribute to it. Planner and designer should read relevant catalog entries before producing feature-level outputs.

```text
service mapper / focused planner / designer
  -> reusable specification finding
  -> artifacts/spec-catalog/
  -> future planner and designer inputs
```

The catalog is not a run log and not a test design. It is the shared specification reference for screens, features, flows, data, roles, and rules. See `docs/spec-catalog.md`.

## Service-wide workflow

Use this when the user asks to explore the entire application, all screens, all pages, or the whole service.

```text
playwright-service-mapper
  -> artifacts/service-exploration/FEATURE_BACKLOG.md
  -> choose one feature
  -> playwright-test-planner
  -> playwright-test-designer
  -> playwright-test-plan-validator
  -> PASS: playwright-test-generator
  -> failing tests: playwright-test-healer
```

Service mapping must not create one giant full-service test plan. It creates maps, inventories, findings, open questions, and feature candidates.

## Feature-level workflow

Use this when the target feature, page, or flow is already known.

```text
playwright-test-planner
  -> specs/<feature>.plan.md
  -> playwright-test-designer
  -> specs/<feature>.test-design.md
  -> playwright-test-plan-validator
  -> PASS: playwright-test-generator
  -> FAIL: planner/designer revises and validator reruns
```

Planner and designer have different responsibilities:

| Skill | Responsibility |
| --- | --- |
| `playwright-test-planner` | Decide what should be designed: scope, evidence, assumptions, behavior inventory, risks, and design inputs. |
| `playwright-test-designer` | Decide how it should be tested: technique selection, technique application, final cases, exclusions, and residual risk. |

## Test generation, coverage, and healing

Generation is allowed only after validation returns `PASS` for both the plan and the test design.

```text
validated test design
  -> tests/<feature>.spec.ts
  -> specs/<feature>.coverage.md
  -> run the target project's documented test command when available
  -> failure: playwright-test-healer
```

`specs/<feature>.coverage.md` is the current feature coverage ledger. It does not replace the test design. It summarizes what is currently implemented, what each test verifies, what is explicitly not covered, what open questions affect coverage, and which run last updated the ledger.

Run-local generator artifacts such as `artifacts/<feature>/runs/<run-id>/04_generator/test-mapping.md` remain history. The generator must promote the currently valid mapping, implemented checks, exclusions, and residual gaps into `specs/<feature>.coverage.md` before finishing.

Project test-suite execution is outside the Playwright CLI skill. Ad hoc browser verification through `playwright-cli` is in scope. Use `docs/test-execution-boundary.md` to keep browser evidence gathering, ad hoc verification, and project test-runner execution separate.

Healing must diagnose and classify before editing. It must not delete tests, remove assertions, weaken expectations, or add `test.skip()` / `test.fixme()` unless explicitly approved by the user. If the root cause is a product defect or test-design issue, the healer must report or route back instead of patching the test to pass.

When healing changes what is observed or asserted, update `specs/<feature>.coverage.md`. When healing changes expected behavior, target scope, or the purpose of a design case, update `specs/<feature>.test-design.md` and rerun validation before treating the repaired test as current.

## Release QA Cockpit demo target workflow

Release QA Cockpit is the built-in demo target application for validating this workflow.

Design docs live under:

```text
docs/app-design/release-qa-cockpit/
```

Implementation path:

```text
demo-apps/release-qa-cockpit/
```

Use Release QA Cockpit to validate the full staged workflow:

```text
implement or run Release QA Cockpit
  -> create target project profile
  -> playwright-service-mapper explores the demo app
  -> reusable findings are promoted into artifacts/spec-catalog/
  -> choose one feature such as release-decision
  -> playwright-test-planner creates specs/release-decision.plan.md
  -> playwright-test-designer creates specs/release-decision.test-design.md
  -> playwright-test-plan-validator creates specs/_reviews/release-decision.validation.md
  -> playwright-test-generator creates Playwright Test
  -> failing tests are handled by playwright-test-healer
```

The demo app must remain deterministic enough that agents can reset data and reproduce the same exploration and E2E flows.

The first recommended target feature is `release-decision`, because it exercises readiness rules, persisted versus preview state, evidence requirements, and At Risk decision save behavior.

## Handoff timing

Each skill must update the handoff layer before finishing.

Required run-level file:

```text
artifacts/<scope-or-feature>/runs/<run-id>/99_handoff.md
```

Required scope-level files:

```text
artifacts/<scope-or-feature>/HANDOFF.md
artifacts/<scope-or-feature>/OPEN_QUESTIONS.md
artifacts/<scope-or-feature>/FINDINGS.md
artifacts/<scope-or-feature>/DECISIONS.md
```

Service-wide work also updates:

```text
artifacts/service-exploration/FEATURE_BACKLOG.md
```

## Git policy summary

Track handoff summaries, plans, test designs, validation reports, docs, templates, and skills. Do not track run-local evidence, screenshots, traces, videos, Playwright reports, or runtime logs by default.

## Automated structure checks

Use the lightweight checks after agent runs or repository maintenance:

```bash
npm run check:artifacts
npm run check:validation
npm run check:coverage
npm run check:logs
npm run check:semantic
npm run check:test-design
npm run check:evals
```

These commands verify artifact structure, validation report hashes, coverage ledger structure, fixture structure, and runtime JSONL format. They are structural checks, not proof of feature correctness. `check:coverage` treats feature tests under `tests/<feature>.spec.ts` as implemented features, except explicit samples such as `tests/example.spec.ts`. It fails when the matching plan, test design, validation report, or coverage ledger is missing; when the validation gate is not `PASS`; when the ledger still contains template placeholders such as `TBD` or `<feature>`; when it references a missing implementation file; when it omits required table rows including `Change history`; when `Last updated by run` or `Change history` lacks a concrete same-feature `artifacts/<feature>/runs/<run-id>/` reference; or when it maps to `TD-*` IDs that are absent from the test design.

## Harness-assisted feature workflow

For feature-level work, initialize and inspect the workflow with the thin harness:

```bash
npm run agent:init -- --feature <feature> --request "<request>"
npm run agent:next -- --feature <feature>
```

Run the skill returned by `agent:next`, then re-run:

```bash
npm run agent:status -- --feature <feature>
```

Before generation, require `agent:gate`; do not use `check:validation` as the generator-readiness decision:

```bash
npm run agent:gate -- --feature <feature> --for generator
```

The harness does not replace the planner, designer, validator, generator, healer, or Playwright CLI skills. It only keeps workflow state and gates explicit.
