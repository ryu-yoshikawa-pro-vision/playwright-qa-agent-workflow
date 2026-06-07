# Artifact Structure Eval

## Purpose

Verify that the repository contains the durable artifact structure required by the common Playwright CLI skill workflow.

This eval is backed by:

```bash
npm run check:artifacts
```

## What it checks

- Required common skills exist under `.agents/skills/`.
- Required docs exist under `docs/`.
- Required templates exist under `artifacts/_templates/`.
- Service-wide handoff files exist under `artifacts/service-exploration/`.
- Evaluation files exist under `evals/`.
- Optional feature-level scopes under `artifacts/<feature>/` have handoff files when present.

## Pass criteria

- The command exits with code `0`.
- No required file or directory is missing.
- Empty required files are reported and fixed.

## Failure examples

- `artifacts/service-exploration/HANDOFF.md` is missing.
- `artifacts/_templates/99_handoff.md` is missing.
- `playwright-test-plan-validator/SKILL.md` is missing.
- A feature scope has `HANDOFF.md` but no `OPEN_QUESTIONS.md`.

## Optional strict mode

Use strict mode when warnings should fail the check:

```bash
node scripts/validate-artifact-structure.mjs --strict
```
