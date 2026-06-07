# Validation Hash Eval

## Purpose

Verify that every generated plan has a matching validation report and that the validation report was produced from the current plan content.

This eval is backed by:

```bash
npm run check:validation
```

## What it checks

For each `specs/*.plan.md` file:

- a corresponding `specs/_reviews/<feature>.validation.md` exists
- the validation report includes `Plan SHA-256`
- the recorded hash matches the current plan file
- the validation report includes a `Decision` of `PASS`, `FAIL`, or `BLOCKED`

## Pass criteria

- The command exits with code `0`.
- No plan is missing a validation report.
- No validation report has a stale or missing hash.

## Warning criteria

- A validation report decision is `FAIL` or `BLOCKED`.
- This does not mean the hash check failed, but it means the generator must not proceed.

## Failure examples

- A plan changed after validation and was not revalidated.
- The validation report has no `Plan SHA-256`.
- `specs/login.plan.md` exists but `specs/_reviews/login.validation.md` is missing.

## Feature-specific check

```bash
node scripts/validate-plan-validation-hash.mjs --feature login
```
