# Spec Catalog

`artifacts/spec-catalog/` is the durable shared specification layer for the target application.

Use it to consolidate reusable specification knowledge discovered through:

- service-wide exploration
- focused screen exploration
- feature planning
- technique-based test design
- validation feedback
- human review

The catalog is not a run log and not a test plan. It is the reusable specification reference that future planners and designers should read before creating feature-level outputs.

## Why this exists

Service mapping creates run-local discovery artifacts such as `screen-inventory.md`, `navigation-map.md`, and `feature-inventory.md`. Feature planning creates `specs/<feature>.plan.md`. These files are useful, but they are not a stable shared specification source.

Use the catalog for facts that should survive a single run and be reused across multiple features.

```text
artifacts/service-exploration/runs/<run-id>/...
  discovery from one run

specs/<feature>.plan.md
  one feature's planning input

artifacts/spec-catalog/
  reusable specification knowledge
```

## Directory layout

```text
artifacts/spec-catalog/
  INDEX.md
  OPEN_QUESTIONS.md
  DECISIONS.md
  terminology.md
  screens/
  features/
  flows/
  data/
  roles/
  rules/
```

| Directory   | Purpose                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------- |
| `screens/`  | Screen structure, entry paths, UI elements, states, validations, and screen-specific notes. |
| `features/` | Feature behavior that may span one or more screens.                                         |
| `flows/`    | Cross-screen user journeys and stateful workflows.                                          |
| `data/`     | Data entities, statuses, lifecycle, persistence, and test data assumptions.                 |
| `roles/`    | Role and permission behavior.                                                               |
| `rules/`    | Business rules, validations, display rules, and state-transition rules.                     |

## Status values

Use these values in catalog metadata:

- `Confirmed`: directly observed with evidence or documented by an authoritative source.
- `Partial`: partly confirmed, but conditions, roles, states, or edge cases remain incomplete.
- `Unverified`: plausible or inferred, but not safe to use as a fact without an open question.
- `Deprecated`: known stale information that must not be used for new planning.

## Confidence values

- `High`: directly observed with relevant evidence.
- `Medium`: partially observed or inferred from multiple signals.
- `Low`: plausible but weakly supported.
- `Unverified`: must not be treated as a fact.

## Catalog entry metadata

Every reusable catalog entry template must include enough provenance to locate the evidence behind local evidence IDs. At minimum, keep these metadata fields near the top of each entry:

```text
- Status:
- Last observed run:
- Last updated:
- Evidence IDs:
- Source artifacts:
- Confidence:
```

`Evidence IDs` identify specific evidence rows or observations. `Source artifacts` identifies the run-local files that define those evidence IDs, such as `evidence-index.md`, screenshots, traces, or focused exploration notes. Do not rely on `EV-001` alone because evidence IDs can repeat across runs.

## Evidence rules

Catalog entries must reference evidence; they should not embed heavy evidence content.

Good:

```text
Evidence IDs: EV-001, EV-004
Source artifacts: artifacts/service-exploration/runs/20260607-153000/01_service_mapper/evidence-index.md
```

Avoid:

```text
large screenshots, full snapshots, full trace logs, full console logs
```

Heavy evidence belongs in run-local artifact or evidence directories. Catalog entries should point to it.

## Promotion rules

Promote a finding into `artifacts/spec-catalog/` when it is reusable beyond one run, one test case, or one temporary investigation.

Examples that should be promoted:

- a screen's stable purpose and entry paths
- a reusable feature behavior
- a cross-screen flow
- a role or permission rule
- a validation rule
- a data lifecycle or status rule
- a confirmed terminology decision

Do not promote:

- one-off execution notes
- raw screenshots or traces
- temporary debugging details
- assumptions that are not marked `Unverified`
- generated test implementation details

## Relationship to service mapper

The service mapper discovers screens, navigation paths, feature candidates, and evidence. Before completing a service mapping task, it should promote durable confirmed or partial findings into the spec catalog, or explicitly state that no catalog update was made.

The service mapper should not turn every discovered row into a detailed catalog entry automatically. It should promote reusable entries when they help future planning or design.

## Relationship to planner

The planner must read relevant catalog entries before writing `specs/<feature>.plan.md`.

The planner should use the catalog for:

- screen purpose and entry points
- feature behavior summaries
- known flows
- data assumptions
- role and permission facts
- validation or business rules
- terminology

If the planner discovers reusable facts while focused exploration is performed, it should update the catalog or add a catalog open question.

## Relationship to test designer

The test designer uses the plan as the primary input, but may refer back to the catalog when applying techniques that require stable specification details, such as:

- boundary value analysis
- decision tables
- state transition testing
- role / permission matrices
- CRUD and data lifecycle coverage

If a technique depends on an `Unverified` catalog entry, the design must mark that case as blocked or include an open question instead of treating the entry as confirmed.

## Screen detail sizing

The default screen entry is one file:

```text
artifacts/spec-catalog/screens/SCR-001-login.md
```

If a screen becomes too large or combines many states, tabs, regions, or actions, split it into a directory:

```text
artifacts/spec-catalog/screens/SCR-010-conversation-detail/
  overview.md
  regions.md
  ui-elements.md
  actions.md
  states.md
  validations.md
  open-questions.md
```

Use the split form when a single screen file exceeds roughly 300 to 500 lines, or when separate sections are frequently updated by different tasks.

## Update rules

1. Prefer updating an existing catalog entry over creating duplicate entries.
2. Keep IDs stable once referenced by plans, designs, or validation reports.
3. Mark stale entries as `Deprecated` instead of deleting them when they may still be referenced.
4. Record broad catalog decisions in `DECISIONS.md`.
5. Record cross-cutting unresolved questions in `OPEN_QUESTIONS.md`.
6. Keep `INDEX.md` current when new catalog entries are added.
