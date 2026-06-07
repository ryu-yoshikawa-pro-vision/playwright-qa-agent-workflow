# Service Mapper Outputs

Required run-local outputs:

- `exploration-log.md`
- `service-map.md`
- `screen-inventory.md`
- `navigation-map.md`
- `feature-inventory.md`
- `role-permission-map.md`
- `coverage-matrix.md`
- `open-questions.md`
- `evidence-index.md`
- `service-mapper-summary.md`
- `99_handoff.md`

Required scope-level outputs:

- `artifacts/service-exploration/HANDOFF.md`
- `artifacts/service-exploration/OPEN_QUESTIONS.md`
- `artifacts/service-exploration/FINDINGS.md`
- `artifacts/service-exploration/DECISIONS.md`
- `artifacts/service-exploration/FEATURE_BACKLOG.md`

Durable shared specification outputs, when reusable facts are discovered or refined:

- `artifacts/spec-catalog/INDEX.md`
- `artifacts/spec-catalog/OPEN_QUESTIONS.md`
- `artifacts/spec-catalog/DECISIONS.md`
- `artifacts/spec-catalog/terminology.md`
- entries under `artifacts/spec-catalog/screens/`, `features/`, `flows/`, `data/`, `roles/`, or `rules/`

## Required format rule

Run-local outputs must follow `output-formats.md`. Stable IDs such as `SCR-001`, `NAV-001`, `FEAT-001`, and `EV-001` are required so the planner can cite exact screens, flows, features, and evidence without guessing.

Durable specification entries must follow `docs/spec-catalog.md`. Do not make `screen-inventory.md` or `specs/<feature>.plan.md` the canonical specification when a reusable catalog entry exists.

## Template hints

Reusable starter templates are available under `artifacts/_templates/service-mapper/` for every required run-local mapper output except the generic `99_handoff.md`, which uses `artifacts/_templates/99_handoff.md`:

- `exploration-log.md`
- `service-map.md`
- `screen-inventory.md`
- `navigation-map.md`
- `feature-inventory.md`
- `role-permission-map.md`
- `coverage-matrix.md`
- `open-questions.md`
- `evidence-index.md`
- `service-mapper-summary.md`

## Spec-catalog provenance reminder

When promoting or relying on reusable catalog entries, include both `Evidence IDs` and `Source artifacts` so local evidence IDs can be traced back to the run-local evidence index or focused exploration artifact that defines them.
