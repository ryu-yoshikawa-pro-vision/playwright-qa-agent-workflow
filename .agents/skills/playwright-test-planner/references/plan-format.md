# Plan Format

Recommended file: `specs/<feature>.plan.md`

A plan must define what should be designed and why. It should not fully perform technique-based test design. The detailed test cases belong in `specs/<feature>.test-design.md` created by `playwright-test-designer`.

## Required sections

Include:

- feature summary
- scope and out of scope
- entry point and setup assumptions
- account, role, permission, and data assumptions
- spec-catalog references
- evidence references
- behavior inventory
- risk assessment
- test design inputs
- unverified assumptions
- open questions

## Feature summary

Explain what the feature does, who uses it, and what observable outcome proves success. Avoid generic statements such as "the page works" or "the user can operate the screen".

## Scope and out of scope

List what is included and excluded. Excluded categories must have a reason, especially when they are common risks such as validation, permissions, persistence, destructive actions, or role differences.

## Entry point and setup assumptions

Include:

- entry URL, screen, or navigation path
- required login state
- required account or role
- required feature flags or environment assumptions
- starting data state
- cleanup expectations, when data is created or changed

## Account, role, permission, and data assumptions

Separate confirmed facts from assumptions.

| Item | Confirmed / Assumed / Unverified | Evidence IDs | Impact on design |
| ---- | -------------------------------- | ------------ | ---------------- |
|      |                                  |              |                  |

## Spec-catalog references

Read and cite relevant reusable specification entries before writing the plan. Use catalog entries for screen purpose, feature behavior, flows, data, roles, rules, and terminology when available.

| Catalog ID | Type   | Path                                              | Status                           | What the plan uses | Remaining uncertainty |
| ---------- | ------ | ------------------------------------------------- | -------------------------------- | ------------------ | --------------------- |
| SCR-001    | screen | `artifacts/spec-catalog/screens/SCR-001-login.md` | Confirmed / Partial / Unverified |                    |                       |

Rules:

- Do not treat `Unverified` catalog entries as confirmed facts.
- If a required catalog entry is stale or missing, add an open question or perform focused exploration.
- If focused exploration confirms reusable behavior, update the catalog or note the required catalog update in the feature handoff.

## Evidence references

Use stable evidence IDs from exploration outputs, such as `EV-001`, `SCR-001`, `NAV-001`, or `FEAT-001`.

| Evidence ID | Type                                         | What it proves | Relevant behavior |
| ----------- | -------------------------------------------- | -------------- | ----------------- |
| EV-001      | snapshot / screenshot / trace / log / source |                |                   |

## Behavior inventory

List the behaviors that need test design. This is not the final test-case list.

| Behavior ID | Behavior | Source evidence | Notes |
| ----------- | -------- | --------------- | ----- |
| BEH-001     |          | EV-001          |       |

## Risk assessment

| Risk | Level               | Why it matters | Related behavior IDs | Notes |
| ---- | ------------------- | -------------- | -------------------- | ----- |
|      | High / Medium / Low |                | BEH-001              |       |

## Test design inputs

Use this section to hand off design material to `playwright-test-designer`. Suggested techniques are allowed, but the designer decides the final technique selection.

| Area                          | Why it matters | Evidence IDs | Suggested technique                                | Notes |
| ----------------------------- | -------------- | ------------ | -------------------------------------------------- | ----- |
| Input validation              |                | EV-001       | Equivalence partitioning / boundary value analysis |       |
| Conditional behavior          |                |              | Decision table                                     |       |
| State changes                 |                |              | State transition testing                           |       |
| Role / permission differences |                |              | Role / permission matrix                           |       |
| Data lifecycle                |                |              | CRUD coverage                                      |       |
| High-risk behavior            |                |              | Risk-based testing / error guessing                |       |

## Unverified assumptions

List assumptions that are not blockers for test design. If an assumption must be answered before design or generation, put it in open questions and mark it blocking.

| Assumption | Why acceptable for now | Evidence gap |
| ---------- | ---------------------- | ------------ |
|            |                        |              |

## Open questions

Open questions should be actionable. Mark whether each question blocks test design.

| Question | Blocking for design? | Owner / next action |
| -------- | -------------------- | ------------------- |
|          | Yes / No             |                     |

## What not to include

Do not put the final test case table, detailed boundary values, decision tables, state transition tables, or pairwise selections in the plan. Those belong in `specs/<feature>.test-design.md`.

## Spec-catalog provenance reminder

When promoting or relying on reusable catalog entries, include both `Evidence IDs` and `Source artifacts` so local evidence IDs can be traced back to the run-local evidence index or focused exploration artifact that defines them.
