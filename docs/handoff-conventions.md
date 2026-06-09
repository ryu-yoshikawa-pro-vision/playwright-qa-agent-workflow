# Handoff Conventions

This repository separates run-local artifacts from scope-level handoff artifacts.

Run-local artifacts prove what happened in a single execution. Scope-level handoff artifacts preserve the current state for the next agent, next run, or human reviewer.

## Required files

For service-wide exploration:

```text
artifacts/service-exploration/HANDOFF.md
artifacts/service-exploration/OPEN_QUESTIONS.md
artifacts/service-exploration/FINDINGS.md
artifacts/service-exploration/DECISIONS.md
artifacts/service-exploration/FEATURE_BACKLOG.md
artifacts/service-exploration/runs/<run-id>/99_handoff.md
```

For feature-level work:

```text
artifacts/<feature>/HANDOFF.md
artifacts/<feature>/OPEN_QUESTIONS.md
artifacts/<feature>/FINDINGS.md
artifacts/<feature>/DECISIONS.md
artifacts/<feature>/runs/<run-id>/99_handoff.md
```

## Read order for continuing work

For feature-level work after test generation has started:

1. `specs/<feature>.coverage.md`
2. `specs/<feature>.test-design.md`
3. `tests/<feature>.spec.ts`
4. `artifacts/<feature>/DECISIONS.md`
5. `artifacts/<feature>/OPEN_QUESTIONS.md`
6. `artifacts/<feature>/FINDINGS.md`
7. latest `artifacts/<feature>/runs/<run-id>/99_handoff.md`
8. detailed run-local artifacts only as needed

For service-wide work or feature-level work before test generation:

1. `HANDOFF.md`
2. `OPEN_QUESTIONS.md`
3. `FINDINGS.md`
4. `DECISIONS.md`
5. `FEATURE_BACKLOG.md` for service-wide work
6. latest `runs/<run-id>/99_handoff.md`
7. detailed artifacts only as needed

## Promotion rule

Promote durable information from run-local artifacts into scope-level files before ending a task.

Examples:

- New unanswered question -> `OPEN_QUESTIONS.md`
- Reusable service or feature observation -> `FINDINGS.md`
- Feature split, validation, generation, or healing judgment -> `DECISIONS.md`
- New feature candidate -> `FEATURE_BACKLOG.md`
- Current generator mapping, implemented checks, exclusions, or coverage gaps -> `specs/<feature>.coverage.md`
- Healing change that affects what is asserted or observed -> `specs/<feature>.coverage.md` and, when durable, `DECISIONS.md`
- Healing change that affects expected behavior or design intent -> `specs/<feature>.test-design.md`, then rerun validation

## Status values

Use these values consistently:

- `Open`
- `In progress`
- `Answered`
- `Deferred`
- `Blocked`

## Confidence values

- `High`: directly observed with evidence
- `Medium`: partially observed or inferred from multiple signals
- `Low`: plausible but not confirmed
- `Unverified`: must not be treated as fact

## Completion rule

A skill execution is incomplete if:

- `99_handoff.md` is missing
- `HANDOFF.md` is stale or not updated
- open questions remain only in run-local files
- reusable findings remain only in run-local files
- important decisions remain only in run-local files
- generator output creates or changes tests but `specs/<feature>.coverage.md` is missing or stale
- healer changes assertion policy or observed behavior but `specs/<feature>.coverage.md` is not updated
- healer changes expected behavior or design intent without returning to test design and validation
- the recommended next action is unclear

## Spec catalog promotion

When a reusable specification fact is discovered, update `artifacts/spec-catalog/` instead of leaving it only in a run-local handoff or feature-level plan.

Examples:

- Screen structure or state discovered during service mapping -> `artifacts/spec-catalog/screens/`
- Feature behavior discovered during planning -> `artifacts/spec-catalog/features/`
- Role or permission rule -> `artifacts/spec-catalog/roles/`
- Validation or display rule -> `artifacts/spec-catalog/rules/`

If the reusable fact is uncertain, mark it `Partial` or `Unverified` and add a catalog open question.
