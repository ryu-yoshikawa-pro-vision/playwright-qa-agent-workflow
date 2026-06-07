<!-- Expected Test Design Review Decision: FAIL -->
# Login Test Design - Bad Technique Stuffing

## Source plan

- Plan path: `specs/login.plan.md`
- Plan SHA-256: `PLACEHOLDER`
- Evidence references: `EV-001`

## Design status

Decision: PASS

Reason: All techniques were used to improve coverage.

## Technique selection summary

| Area | Selected technique | Reason | Not selected / reason | Evidence IDs |
|---|---|---|---|---|
| Login | Equivalence partitioning, boundary value analysis, decision table, state transition, role matrix, CRUD, pairwise, exploratory testing | Use all techniques for completeness | None | EV-001 |

## Technique application

### Boundary value analysis

Status: Applied

| Field / rule | Min | Max | Boundary values | Excluded values | Evidence IDs |
|---|---|---|---|---|---|
| Password | 0 | 999 | 0, 1, 998, 999, 1000 | None | EV-001 |

### State transition testing

Status: Applied

| Current state | Action | Next state | Expected result | Invalid? | Test case IDs |
|---|---|---|---|---|---|
| Login started | Login | Login completed | Works | No | TD-001 |

### CRUD coverage

Status: Applied

| Operation | In scope? | Observation method | Cleanup / isolation | Test case IDs |
|---|---|---|---|---|
| Create user | Yes | User created | Delete user | TD-010 |

## Final test cases

| Test ID | Source technique | Objective | Preconditions | Steps summary | Expected result | Priority | Automatable? | Evidence IDs |
|---|---|---|---|---|---|---|---|---|
| TD-001 | All techniques | Login test | Login page | Login | Works correctly | High | Yes | EV-001 |

## Excluded cases

| Excluded case | Reason | Risk accepted? | Follow-up |
|---|---|---|---|
| None | None | Yes | None |

## Open questions

| Question | Blocking? | Required action |
|---|---|---|
| None | No | None |
