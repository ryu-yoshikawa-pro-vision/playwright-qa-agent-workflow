<!-- Expected Semantic Review Decision: FAIL -->
# Project CRUD Plan

## Feature summary

Users can create and edit projects.

## Scope

Project creation and project editing are both included.

## Entry point and setup

- Entry point: `/projects`
- Account: signed-in project editor
- Starting state: project list is visible

## Evidence references

| Evidence ID | Type | What it proves |
|---|---|---|
| EV-001 | snapshot | Project list has create and edit controls |

## Behavior inventory

| Behavior ID | Behavior | Source evidence | Notes |
|---|---|---|---|
| BEH-001 | Create project named `Auto Project` | EV-001 | The plan assumes this created record will be reused by the edit case |
| BEH-002 | Edit the project created by BEH-001 | EV-001 | This creates an execution-order dependency instead of defining stable setup data |

## Risk assessment

| Risk | Level | Why it matters | Related behavior IDs | Notes |
|---|---|---|---|---|
| Project cannot be created or edited | High | Blocks project management | BEH-001, BEH-002 | Risk is not decomposed into independent design inputs |

## Test design inputs

| Area | Why it matters | Evidence IDs | Suggested technique | Notes |
|---|---|---|---|---|
| Create then edit project | Need to cover CRUD behavior | EV-001 | CRUD coverage | Designer should edit the project created by the create case |

## Open questions

| Question | Blocking for design? | Owner / next action |
|---|---|---|
| What stable setup data or setup API can provide an editable project independently? | Yes | Planner must define setup/isolation before design |
