# Spec Catalog Index

This catalog is the durable shared specification layer for the target application.

Use it to consolidate reusable facts discovered through service mapping, focused screen exploration, feature planning, and test design. Do not treat run-local exploration files or feature plans as the canonical specification when a catalog entry exists.

## Status values

- `Confirmed`: directly observed with evidence or documented by an authoritative source.
- `Partial`: partly confirmed, but conditions, roles, states, or edge cases remain incomplete.
- `Unverified`: plausible or inferred, but not safe to use as a fact without an open question.
- `Deprecated`: known stale information that must not be used for new planning.

## Catalog sections

| Section     | Purpose                                                                          | Entry examples                   |
| ----------- | -------------------------------------------------------------------------------- | -------------------------------- |
| `screens/`  | Screen-level structure, regions, states, UI elements, and screen-specific notes. | `SCR-001-login.md`               |
| `features/` | Feature-level behavior that may span one or more screens.                        | `FEAT-001-login.md`              |
| `flows/`    | Cross-screen user journeys and stateful workflows.                               | `FLOW-001-login-to-dashboard.md` |
| `data/`     | Data entities, test data assumptions, statuses, and persistence behavior.        | `DATA-001-user-account.md`       |
| `roles/`    | Role and permission behavior.                                                    | `role-permission-matrix.md`      |
| `rules/`    | Business rules, validations, display rules, and state-transition rules.          | `RULE-001-login-validation.md`   |

## Current entries

| ID  | Type | Path | Status | Last updated | Notes |
| --- | ---- | ---- | ------ | ------------ | ----- |
|     |      |      |        |              |       |

## Update rules

1. Add or update catalog entries only when the finding is reusable beyond a single run.
2. Cite evidence IDs, source artifacts, or documented sources for every confirmed claim.
3. Mark uncertain content as `Unverified` or `Partial`; do not silently promote assumptions to facts.
4. Keep run-local evidence in `artifacts/**/runs/` or `artifacts/**/evidence/`; catalog entries should reference evidence, not embed heavy evidence content.
5. When a catalog update affects future planning, add a short note to `DECISIONS.md` or `OPEN_QUESTIONS.md`.
