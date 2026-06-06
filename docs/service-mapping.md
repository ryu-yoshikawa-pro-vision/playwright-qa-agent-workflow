# Service Mapping Workflow

Use service mapping when the user asks to explore the whole service, all screens, all pages, or the entire application.

## Why service mapping exists

A whole service is too broad to treat as one feature. If an agent creates one giant full-service test plan, the result is usually shallow and difficult to generate into stable Playwright tests.

Service mapping solves this by separating discovery from feature-level planning.

```text
service-mapper -> feature inventory -> planner -> validator -> generator -> healer
```

## Role responsibility

`playwright-service-mapper` should:

- discover screens and routes
- record navigation paths
- identify major areas and flows
- identify available roles and permission differences
- create a feature inventory
- recommend the order in which feature-level plans should be created

It should not:

- create a giant `full-service.plan.md`
- generate Playwright tests
- claim full coverage without evidence
- execute destructive final confirmations without explicit approval

## Output location

```text
artifacts/service-exploration/runs/<run-id>/01_service_mapper/
```

Required outputs:

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


## Visual evidence during service mapping

Service mapping must combine screenshots and snapshots.

For each discovered screen or major UI state:

1. Capture or reference a screenshot when available.
2. Capture or reference a snapshot when available.
3. Link both records from `evidence-index.md`.
4. Link the relevant evidence from `screen-inventory.md`, `navigation-map.md`, and `coverage-matrix.md`.

Do not mark a screen as fully explored if the only evidence is a snapshot and the screen has visual complexity such as modals, drawers, tables, filters, disabled states, loading states, or validation messages.

If visual evidence cannot be captured, record the blocker and lower the confidence value in `coverage-matrix.md`.

## Handoff to planner

After mapping, choose one feature from `feature-inventory.md` and ask `playwright-test-planner` to create a feature-level plan.

The handoff should include:

- feature slug
- related screen IDs
- related flow IDs
- service mapping run path
- known gaps
- unverified assumptions

Example:

```text
Use playwright-test-planner to create a plan for `conversation-detail`.
Reference `artifacts/service-exploration/runs/20260607-013000/01_service_mapper/`.
Include screens SCR-004 and SCR-005 and flow FLW-003.
```

The planner then produces:

```text
specs/conversation-detail.plan.md
```

Then the validator reviews that feature plan before the generator runs.
