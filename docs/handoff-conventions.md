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
- the recommended next action is unclear
