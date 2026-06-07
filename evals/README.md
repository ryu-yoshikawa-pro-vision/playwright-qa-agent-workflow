# Evals

This directory contains lightweight evaluation scenarios and structure checks for the common Playwright CLI skill set.

The goal is not to score AI quality. The goal is to catch workflow-breaking mistakes early:

- the wrong skill is selected
- required artifacts are missing
- handoff files are stale or absent
- validation reports do not match current plans
- runtime logs are malformed or contain unredacted secret-like keys

## Manual evals

Use these files for human review of skill behavior:

| File | Purpose |
|---|---|
| `skill-routing.md` | Confirm prompts route to the expected skill |
| `service-mapper-cases.md` | Confirm service-wide exploration outputs are complete |
| `planner-validator-loop.md` | Confirm planner and validator loop behavior |
| `generator-healer-loop.md` | Confirm generation and healing safety |

## Automated structure checks

Use these commands for repeatable checks:

```bash
npm run check:artifacts
npm run check:validation
npm run check:logs
npm run check:evals
```

| Command | Backing script | Purpose |
|---|---|---|
| `npm run check:artifacts` | `scripts/validate-artifact-structure.mjs` | Required skills, docs, templates, and handoff files exist |
| `npm run check:validation` | `scripts/validate-plan-validation-hash.mjs` | Plan SHA-256 in validation reports matches current plan files |
| `npm run check:logs` | `scripts/validate-runtime-logs.mjs` | JSONL runtime logs are parseable and minimally safe |
| `npm run check:evals` | all of the above | Run the full lightweight check suite |

## Scope of these checks

These checks do not verify:

- whether a real web application was fully explored
- whether generated tests are semantically correct
- whether screenshots visually match expectations
- whether Playwright tests pass against a real environment

They only verify the structure and safety prerequisites needed for reliable handoff and generation.
