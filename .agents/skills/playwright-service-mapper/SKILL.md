---
name: playwright-service-mapper
description: Explore an entire web service with Playwright Test MCP and produce a service map, screen inventory, navigation map, and feature inventory before feature-level planning. Use when the user asks to explore the whole service, all screens, all pages, or the overall application.
---

# Playwright Service Mapper

You are the service-wide exploration role in the Playwright Test Agents workflow.

Your job is to explore the application broadly and produce a structured service map. Do not write feature-level test plans and do not generate Playwright test code in this role.

Use this skill when the requested scope is wider than a single feature, page, or flow, for example:

- "Explore the whole service."
- "Find all screens."
- "Map the entire application."
- "Understand the overall product before creating tests."
- "Create a list of features that should later become Playwright test plans."

## Core distinction

Service mapping is not feature planning.

- Service mapping discovers the whole product surface and splits it into feature candidates.
- Feature planning creates executable test scenarios for one chosen feature.
- Test generation converts a validated feature plan into Playwright tests.

Do not create one giant `full-service.plan.md`. That usually produces shallow, ambiguous output. Instead, create service-level inventory artifacts and recommend feature-level planner follow-ups.

## Preconditions

- Use the `playwright-test` MCP server when browser exploration is needed.
- Call the appropriate Playwright Test MCP setup tool before browser exploration, when that tool is available.
- Use `seed.spec.ts` as the default setup reference unless the user provides another seed file.
- If the user provides accounts, roles, URLs, credentials, seed files, or scope constraints, record them in `00_request.md`.
- Avoid destructive operations unless the user explicitly allows them. For destructive or irreversible actions, record the path as discovered but do not execute the final destructive action.

## Naming and artifact location

Use this run structure:

```text
artifacts/service-exploration/runs/<run-id>/
  00_request.md
  01_service_mapper/
    exploration-log.md
    service-map.md
    screen-inventory.md
    navigation-map.md
    feature-inventory.md
    role-permission-map.md
    coverage-matrix.md
    open-questions.md
    evidence-index.md
    service-mapper-summary.md
  evidence/
    screenshots/
    traces/
    snapshots/
    console/
    network/
```

`<run-id>` should use local time in this format:

```text
YYYYMMDD-HHMMSS
```

If file writing is unavailable, return the same artifact contents in the response and clearly say which files should be written.

## Exploration strategy

Explore breadth-first before depth-first.

1. Identify entry points:
   - login/logout
   - default landing page
   - primary navigation
   - side navigation
   - headers/footers
   - menus
   - settings areas
   - admin areas when accessible
2. Build a visited-screen set:
   - URL/route
   - visible title or main heading
   - role/account used
   - entry path
   - evidence reference
3. Traverse navigation deliberately:
   - click visible navigation items
   - inspect menus and tabs
   - follow safe links
   - record disabled or unavailable items
   - avoid destructive final confirmations
4. Record stateful UI:
   - modals
   - drawers
   - dropdowns
   - tabs
   - filters
   - tables
   - pagination
   - empty/loading/error states where observable
5. Identify feature boundaries:
   - group related screens and flows
   - propose stable feature slugs
   - assign priority and next action
6. Mark uncertainty honestly:
   - use `Unverified` for assumptions
   - record blockers and inaccessible areas
   - do not invent permissions, business rules, or hidden screens


## Visual evidence requirements

Do not rely on page snapshots alone. Snapshots and screenshots must be used together when tooling allows it.

For every discovered screen or major UI state:

1. Capture or reference a **snapshot** to understand accessible structure, locator candidates, labels, roles, names, and DOM-visible text.
2. Capture or reference a **screenshot** to confirm the actual user-visible UI, layout, visibility, modal/drawer/menu state, loading/empty/error state, disabled-looking controls, overlap, clipping, and responsive layout.
3. Save or reference screenshot evidence under `evidence/screenshots/` and snapshot evidence under `evidence/snapshots/`.
4. Record both entries in `01_service_mapper/evidence-index.md`.
5. Link relevant evidence from `screen-inventory.md`, `navigation-map.md`, `coverage-matrix.md`, and `exploration-log.md`.

A screen or UI state must not be marked as fully explored from snapshot evidence alone when visual behavior matters.

Use screenshot or trace evidence before making claims such as:

- a message is visible on the screen
- a modal, drawer, dropdown, or menu is open
- a button appears disabled or enabled
- a table, filter, pagination control, or form state is visible
- loading, empty, or error state appears
- an element is overlapped, clipped, sticky, off-screen, or otherwise difficult to interact with

If screenshot capture is unavailable, blocked, or not useful, record the reason in `evidence-index.md` and lower confidence in `coverage-matrix.md`. Do not claim full visual coverage.

## Screen ID and feature slug rules

Assign stable screen IDs:

```text
SCR-001, SCR-002, SCR-003, ...
```

Assign feature slugs using lowercase ASCII kebab-case:

```text
login
conversation-list
conversation-detail
user-management
team-settings
```

If a ticket or business ID is part of the user request, prefix it:

```text
ailead-12428-meeting-bot-invitation
```

Do not rename a feature slug during the same run. If the scope changes substantially, create a new feature slug and explain why.

## Required artifacts

### `00_request.md`

Record the original request and execution assumptions.

```markdown
# Request

## User request

<original request or summary>

## Scope

- Scope type: service-wide exploration
- Target URL:
- Accounts / roles:
- Seed file:
- Explicit exclusions:
- Destructive actions allowed: Yes/No

## Run

- Run ID:
- Started at:
- Agent role: playwright-service-mapper
```

### `exploration-log.md`

Record what was actually done.

```markdown
# Exploration Log

## Summary

- Explored screens:
- Explored routes:
- Explored roles:
- Blockers:

## Action log

| Step | Screen ID | Page / Area | Action | Observation | Evidence |
|---:|---|---|---|---|---|
```

### `service-map.md`

Describe the service at a high level.

```markdown
# Service Map

## Service summary

- Service name:
- Target URL:
- Primary users / roles:
- Main business purpose:

## Main areas

| Area ID | Area | Purpose | Entry point | Priority | Notes |
|---|---|---|---|---:|---|

## Major end-to-end flows

| Flow ID | Flow | Start | End | Screens | Verified | Notes |
|---|---|---|---|---|---|---|
```

### `screen-inventory.md`

List every discovered screen or major UI state.

```markdown
# Screen Inventory

| Screen ID | Screen name | URL / Route | Area | Role | Entry path | Explored | Evidence | Notes |
|---|---|---|---|---|---|---|---|---|
```

A screen can be a page, a modal-heavy workflow, or a distinct application state when it has different test meaning.

### `navigation-map.md`

Record navigation edges.

```markdown
# Navigation Map

| From screen | Action / Link | To screen | Verified | Evidence | Notes |
|---|---|---|---|---|---|
```

### `feature-inventory.md`

Convert the discovered surface into candidate feature plans.

```markdown
# Feature Inventory

| Feature slug | Feature name | Included screens | Primary flows | Priority | Risk | Recommended next step |
|---|---|---|---|---:|---:|---|
```

Use recommended next steps such as:

- `Create feature plan now`
- `Create feature plan later`
- `Needs role/account access`
- `Needs business rule clarification`
- `Out of scope`

### `role-permission-map.md`

Record visible role or permission differences.

```markdown
# Role / Permission Map

| Role / Account | Accessible areas | Restricted areas | Observed differences | Evidence | Notes |
|---|---|---|---|---|---|
```

If only one role is available, say so explicitly and mark other roles as `Unverified`.

### `coverage-matrix.md`

Show what was covered and what remains.

```markdown
# Coverage Matrix

| Area / Feature | Screens covered | Flows covered | States covered | Confidence | Gaps |
|---|---:|---:|---|---|---|
```

Use confidence values:

- `High`: explored directly with evidence
- `Medium`: partially explored or inferred from visible UI
- `Low`: discovered but not meaningfully explored
- `Blocked`: inaccessible or requires missing data/permissions

### `open-questions.md`

List unresolved issues.

```markdown
# Open Questions

| ID | Question | Why it matters | Suggested owner / next action |
|---|---|---|---|
```

### `evidence-index.md`

Index evidence files. Each evidence row must say what the artifact proves.

```markdown
# Evidence Index

| Evidence ID | Screen / State / Flow ID | Evidence type | Path | Captured after action | What it proves | Notes |
|---|---|---|---|---|---|---|
| EV-001 | SCR-001 | screenshot | evidence/screenshots/SCR-001-login-default.png | Open login page | Login form visual layout is visible | |
| EV-002 | SCR-001 | snapshot | evidence/snapshots/SCR-001-login-default.md | Open login page | Login inputs and submit button have accessible names | |
```

### `service-mapper-summary.md`

Give a concise handoff summary.

```markdown
# Service Mapper Summary

## Decision

Service mapping completed / partially completed / blocked

## Top findings

- ...

## Recommended feature-planning order

1. `<feature-slug>` — reason
2. `<feature-slug>` — reason
3. `<feature-slug>` — reason

## Immediate next action

Use `playwright-test-planner` for `<feature-slug>` and reference this service mapping run.
```

## Quality rules

The output is not complete unless it contains:

- a screen inventory
- a navigation map
- a feature inventory
- an exploration log
- an evidence index
- visual evidence for discovered screens/states, or explicit reasons why it is unavailable
- explicit gaps or blockers
- recommended feature-planning order

Do not claim full service coverage unless the evidence supports it. Prefer `partially completed` with clear gaps over false completeness.

## Handoff to planner

After service mapping, do not hand off directly to the generator.

Hand off to `playwright-test-planner` with:

- selected `feature slug`
- related screen IDs
- related flow IDs
- service mapping run path
- known gaps and assumptions

The planner should then create:

```text
specs/<feature>.plan.md
artifacts/<feature>/runs/<run-id>/01_planner/...
```

Then the plan validator should validate the feature plan before generation.
