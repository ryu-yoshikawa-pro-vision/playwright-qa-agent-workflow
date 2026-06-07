# Service Mapper Output Formats

Use these formats for run-local files under `artifacts/service-exploration/runs/<run-id>/01_service_mapper/`.

The mapper may add columns when useful, but must not remove the required columns. Use stable IDs so feature-level planners can reference screens, flows, evidence, and gaps precisely.

## `exploration-log.md`

Purpose: chronological record of exploration work.

Required columns:

| Time | Action | Location | Evidence ID | Result | Follow-up |
| ---- | ------ | -------- | ----------- | ------ | --------- |

Rules:

- Record meaningful exploration steps, not every low-level click.
- Link to evidence IDs from `evidence-index.md`.
- Mark failed or skipped paths explicitly.

## `service-map.md`

Purpose: high-level service model.

Required sections:

```markdown
# Service Map

## Scope

## Account / role used

## Primary areas

| Area ID | Area name | Purpose | Entry point | Related screen IDs | Confidence |
| ------- | --------- | ------- | ----------- | ------------------ | ---------- |

## Major cross-area flows

| Flow ID | Name | Start | End | Related screen IDs | Evidence IDs | Confidence |
| ------- | ---- | ----- | --- | ------------------ | ------------ | ---------- |

## Known exclusions

## Unverified areas
```

## `screen-inventory.md`

Purpose: list discovered screens and important states.

Required columns:

| Screen ID | Screen name | URL / route | Entry path | Main purpose | Key UI elements | States observed | Evidence IDs | Confidence | Notes |
| --------- | ----------- | ----------- | ---------- | ------------ | --------------- | --------------- | ------------ | ---------- | ----- |

Rules:

- Use IDs such as `SCR-001`.
- Separate materially different states when they affect test design, such as empty, populated, error, loading, permission-limited, or modal-open.
- Do not mark a screen as high confidence without evidence.

## `navigation-map.md`

Purpose: map how users move through the service.

Required columns:

| Nav ID | From screen | Trigger / control | To screen / state | Preconditions | Expected transition | Evidence IDs | Status |
| ------ | ----------- | ----------------- | ----------------- | ------------- | ------------------- | ------------ | ------ |

Status values:

- `Confirmed`
- `Partially confirmed`
- `Unverified`
- `Blocked`

Rules:

- Use IDs such as `NAV-001`.
- Include important non-navigation state changes, such as opening a modal or drawer.
- Mark inaccessible or permission-limited paths as `Blocked` with the reason.

## `feature-inventory.md`

Purpose: convert screens and flows into candidate feature-level planning scopes.

Required columns:

| Feature ID | Feature slug | Feature name | User goal | Related screens | Related flows | Risk | Suggested priority | Evidence IDs | Known gaps | Recommended next action |
| ---------- | ------------ | ------------ | --------- | --------------- | ------------- | ---- | ------------------ | ------------ | ---------- | ----------------------- |

Risk values:

- `High`
- `Medium`
- `Low`
- `Unknown`

Rules:

- Use IDs such as `FEAT-001`.
- Prefer planning scopes that are small enough for one feature-level plan.
- Do not combine unrelated screens into one large feature just because they were discovered in one session.

## `role-permission-map.md`

Purpose: summarize role-specific access and behavior.

Required columns:

| Role / account | Screen or feature | Access observed | Allowed actions | Blocked actions | Evidence IDs | Confidence | Notes |
| -------------- | ----------------- | --------------- | --------------- | --------------- | ------------ | ---------- | ----- |

Rules:

- Mark permission claims as `Unverified` unless the role/account was actually observed.
- Do not infer admin/user differences from UI labels alone.

## `coverage-matrix.md`

Purpose: show what was explored, partially explored, blocked, or not explored.

Required columns:

| Area / feature | Screens covered | Flows covered | States covered | Evidence IDs | Coverage status | Gaps | Planner readiness |
| -------------- | --------------- | ------------- | -------------- | ------------ | --------------- | ---- | ----------------- |

Coverage status values:

- `Explored`
- `Partially explored`
- `Not explored`
- `Blocked`

Planner readiness values:

- `Ready`
- `Needs more exploration`
- `Blocked`

## `open-questions.md`

Purpose: run-local questions that may need promotion to scope-level `OPEN_QUESTIONS.md`.

Required columns:

| Question ID | Question | Related screen / feature | Why it matters | Evidence IDs | Owner | Status | Promote to scope-level? |
| ----------- | -------- | ------------------------ | -------------- | ------------ | ----- | ------ | ----------------------- |

Rules:

- Use IDs such as `Q-001`.
- Promote unresolved questions that affect future planning.

## `evidence-index.md`

Purpose: central index of screenshots, snapshots, traces, console logs, network logs, and notes.

Required columns:

| Evidence ID | Type | Path / reference | Captured at | Related screen / flow | What it proves | Limitations |
| ----------- | ---- | ---------------- | ----------- | --------------------- | -------------- | ----------- |

Evidence types:

- `snapshot`
- `screenshot`
- `trace`
- `console`
- `network`
- `manual-note`

Rules:

- Use IDs such as `EV-001`.
- Do not claim that evidence proves more than it actually shows.
- For visual claims, prefer screenshots or traces over snapshots alone.

## `service-mapper-summary.md`

Purpose: short summary for humans and the next agent.

Required sections:

```markdown
# Service Mapper Summary

## Run metadata

## What was explored

## What was not explored

## Key findings

## Main risks and gaps

## Recommended feature planning candidates

| Priority | Feature ID | Feature slug | Reason | Required follow-up |
| -------- | ---------- | ------------ | ------ | ------------------ |

## Recommended next action
```

## `99_handoff.md`

Purpose: run-specific handoff for the next agent.

Use `artifacts/_templates/99_handoff.md` and include:

- current state
- files produced
- promoted findings/questions/decisions
- known gaps
- recommended next feature for planning
- exact evidence IDs the planner should read first

## Promotion rules

Before completing service mapping, promote durable content into scope-level files:

- findings to `artifacts/service-exploration/FINDINGS.md`
- unresolved questions to `artifacts/service-exploration/OPEN_QUESTIONS.md`
- decisions to `artifacts/service-exploration/DECISIONS.md`
- feature candidates to `artifacts/service-exploration/FEATURE_BACKLOG.md`
- summary and next action to `artifacts/service-exploration/HANDOFF.md`

Also promote reusable specification knowledge into `artifacts/spec-catalog/` when it is useful beyond the current run. Examples include stable screen purpose, entry paths, cross-screen flows, feature behavior, data lifecycle rules, role/permission facts, validation rules, and terminology.

Do not promote every discovered row mechanically. Promote catalog entries when they help future planning or test design. Mark uncertain catalog content as `Partial` or `Unverified`, and add cross-cutting catalog questions to `artifacts/spec-catalog/OPEN_QUESTIONS.md`.

## Spec-catalog provenance reminder

When promoting or relying on reusable catalog entries, include both `Evidence IDs` and `Source artifacts` so local evidence IDs can be traced back to the run-local evidence index or focused exploration artifact that defines them.
