# Test Design Format

Recommended file: `specs/<feature>.test-design.md`

The test design is the main contract for Playwright Test generation. The plan explains what is in scope; the design explains how it will be tested.

## Required sections

Include:

- source plan
- design status
- design scope
- technique selection summary
- test conditions
- technique application
- final test cases
- excluded cases
- open questions

## Template

```markdown
# <feature> Test Design

## Source plan

- Plan path: `specs/<feature>.plan.md`
- Plan SHA-256: `<sha256-of-current-plan-file>`
- Evidence references: `EV-001`, `SCR-001`, `NAV-001`

## Design status

Decision: PASS | FAIL | BLOCKED

Reason:

## Design scope

In scope:

- ...

Out of scope:

- ...

## Technique selection summary

| Area             | Selected technique                                 | Reason | Not selected / reason | Evidence IDs |
| ---------------- | -------------------------------------------------- | ------ | --------------------- | ------------ |
| Input validation | Equivalence partitioning / boundary value analysis |        |                       | EV-001       |

## Test conditions

| Condition ID | Condition | Source | Risk                | Notes |
| ------------ | --------- | ------ | ------------------- | ----- |
| COND-001     |           | EV-001 | High / Medium / Low |       |

## Technique application

### Equivalence partitioning

Status: Applied / Not applicable / BLOCKED

| Field / condition | Valid classes | Invalid classes | Representative values | Evidence IDs |
| ----------------- | ------------- | --------------- | --------------------- | ------------ |

### Boundary value analysis

Status: Applied / Not applicable / BLOCKED

| Field / rule | Min | Max | Boundary values | Excluded values | Evidence IDs |
| ------------ | --- | --- | --------------- | --------------- | ------------ |

### Decision table

Status: Applied / Not applicable / BLOCKED

| Rule | Condition A | Condition B | Condition C | Expected result | Test case IDs |
| ---- | ----------- | ----------- | ----------- | --------------- | ------------- |

### State transition testing

Status: Applied / Not applicable / BLOCKED

| Current state | Action | Next state | Expected result | Invalid? | Test case IDs |
| ------------- | ------ | ---------- | --------------- | -------- | ------------- |

### Role / permission matrix

Status: Applied / Not applicable / BLOCKED

| Role / permission | Action | Expected result | Evidence IDs | Test case IDs |
| ----------------- | ------ | --------------- | ------------ | ------------- |

### CRUD coverage

Status: Applied / Not applicable / BLOCKED

| Operation | In scope? | Observation method | Cleanup / isolation | Test case IDs |
| --------- | --------- | ------------------ | ------------------- | ------------- |

### Combination / pairwise selection

Status: Applied / Not applicable / BLOCKED

| Combination ID | Factors and values | Reason selected | Risk covered | Test case IDs |
| -------------- | ------------------ | --------------- | ------------ | ------------- |

### Error guessing

Status: Applied / Not applicable / BLOCKED

| Risk guess | Why plausible | Expected safe behavior | Test case IDs |
| ---------- | ------------- | ---------------------- | ------------- |

### Exploratory testing charter

Status: Applied / Not applicable / BLOCKED

| Charter | Mission | Focus areas | Evidence to capture | Timebox |
| ------- | ------- | ----------- | ------------------- | ------- |

## Final test cases

Each case must be independent. Do not rely on previous test case results.

| Test ID | Source technique | Objective | Preconditions | Steps summary | Expected result | Priority            | Automatable?       | Evidence IDs |
| ------- | ---------------- | --------- | ------------- | ------------- | --------------- | ------------------- | ------------------ | ------------ |
| TD-001  |                  |           |               |               |                 | High / Medium / Low | Yes / No / Partial | EV-001       |

## Excluded cases

| Excluded case | Reason | Risk accepted? | Follow-up |
| ------------- | ------ | -------------- | --------- |

## Open questions

| Question | Blocking? | Required action |
| -------- | --------- | --------------- |
|          | Yes / No  |                 |
```

## Required quality rules

- Every selected technique must produce at least one condition, rule, transition, matrix row, combination, charter, or test case.
- Every final test case must trace back to one or more source techniques.
- Every final test case must have an observable expected result.
- Every excluded case must include a reason.
- Every `BLOCKED` technique must explain the missing source, evidence, account, role, or behavior.
- `PASS` is not allowed when there are blocking open questions.
