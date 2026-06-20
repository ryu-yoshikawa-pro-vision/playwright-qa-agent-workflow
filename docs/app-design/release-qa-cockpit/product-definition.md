# Release QA Cockpit product definition

## Product name

Release QA Cockpit

## Product type

Local-first SaaS-style demo application for QA workflow testing.

## Primary purpose

Release QA Cockpit exists to provide a realistic test target for the Playwright QA Agent Workflow.

It should help agents validate the full staged workflow:

1. service mapping
2. specification cataloging
3. feature-level planning
4. test design
5. validation gate review
6. Playwright Test generation
7. failing test diagnosis and healing
8. coverage ledger updates

## Non-production positioning

This application is not a production release management system.

It intentionally avoids production concerns that would distract from test design evaluation:

- real authentication
- remote database persistence
- external workflow integrations
- binary file storage
- background jobs
- email notifications
- multi-tenant administration

## Primary users

| User            | Role key         | Purpose                                                                               |
| --------------- | ---------------- | ------------------------------------------------------------------------------------- |
| QA Lead         | `qaLead`         | Owns release readiness, decision save, and risk acceptance.                           |
| QA Member       | `qaMember`       | Updates test execution results and creates test evidence.                             |
| Release Manager | `releaseManager` | Reviews readiness and final evidence, and may approve risks or save decisions in MVP. |
| Viewer          | `viewer`         | Reads release state without mutating operational data.                                |

## Role authority clarification

Release Manager is intentionally more than a passive reviewer in the MVP.

To exercise role and permission matrix testing, Release Manager may:

- review readiness, risks, and final decision evidence
- accept or reject release risks as the release-side approver
- save release decisions when validation allows

Release Manager must not update test execution or defect triage states in the MVP.

## Primary use cases

| Use case              | Description                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| Check release status  | View readiness, progress, open defects, risks, and latest decision.                 |
| Execute tests         | Move test executions through deterministic QA states.                               |
| Triage defects        | Move defects through triage, fix, retest, close, or accepted non-fix states.        |
| Review risks          | Accept, reject, mitigate, or close release risks.                                   |
| Save release decision | Persist Ready, At Risk, or Not Ready with required comments and evidence.           |
| Export evidence       | Generate a Markdown Evidence Pack from current IndexedDB state.                     |
| Reset demo data       | Restore deterministic business seed state for repeatable E2E and agent exploration. |

## Business domain summary

A release has scoped work, test items, test execution records, defects, risks, decisions, evidence items, and activity logs.

Readiness is calculated from current release state. It is not a manually entered field.

The app must show both:

- persisted readiness based on stored data
- preview readiness based on draft release decision input

This distinction is required so agents can test whether unsaved form input affects only preview state and not persisted release state.

## Agent evaluation value

The app must be complex enough to exercise the following test design techniques:

| Technique                     | App surface                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| Decision table                | Readiness calculation.                                                                |
| State transition testing      | Test execution, defect, risk, and release decision flows.                             |
| Role and permission matrix    | Role Switch, mutation controls, read-only viewer behavior.                            |
| Data relationship testing     | Defect linked to test execution, risk linked to release, evidence linked to decision. |
| Boundary and negative testing | Missing evidence, empty comments, blocked defects, reasonless skipped tests.          |
| E2E workflow testing          | Reset -> resolve blockers -> save At Risk -> export Evidence Pack.                    |

## Product success criteria

The MVP is successful when:

- a user can complete the first smoke scenario from deterministic seed data
- readiness calculation is deterministic and unit-tested
- every primary screen is reachable through accessible navigation
- Playwright can interact with the app using role, label, and accessible name selectors
- generated Evidence Pack Markdown includes release, readiness, tests, defects, risks, decisions, evidence, and activity logs
- Demo Data Reset restores the deterministic initial Not Ready business state defined in `seed-scenarios.md`
