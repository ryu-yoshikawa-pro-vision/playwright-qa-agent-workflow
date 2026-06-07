<!-- Expected Test Design Review Decision: FAIL -->
# User Name Test Design - Missing Boundary Values

## Source plan

- Plan path: `specs/user-name.plan.md`
- Plan SHA-256: `PLACEHOLDER`
- Evidence references: `EV-010`

## Design status

Decision: PASS

Reason: Name input validation is covered.

## Technique selection summary

| Area | Selected technique | Reason | Not selected / reason | Evidence IDs |
|---|---|---|---|---|
| User name length | Equivalence partitioning | Name has max length 50 | Boundary value analysis not selected | EV-010 |

## Test conditions

| Condition ID | Condition | Source | Risk | Notes |
|---|---|---|---|---|
| COND-001 | Valid name | EV-010 | High | Max length is 50 |

## Technique application

### Equivalence partitioning

Status: Applied

| Field / condition | Valid classes | Invalid classes | Representative values | Evidence IDs |
|---|---|---|---|---|
| User name | non-empty name up to 50 chars | empty name; over 50 chars | `Alice`, empty, very long string | EV-010 |

### Boundary value analysis

Status: Not applicable

| Field / rule | Min | Max | Boundary values | Excluded values | Evidence IDs |
|---|---|---|---|---|---|
| User name length | 1 | 50 | N/A | Boundary values skipped | EV-010 |

## Final test cases

| Test ID | Source technique | Objective | Preconditions | Steps summary | Expected result | Priority | Automatable? | Evidence IDs |
|---|---|---|---|---|---|---|---|---|
| TD-001 | Equivalence partitioning | Verify valid name saves | Edit form is open | Enter Alice and save | Save succeeds | High | Yes | EV-010 |
| TD-002 | Equivalence partitioning | Verify long name rejected | Edit form is open | Enter very long name and save | Error appears | High | Yes | EV-010 |

## Excluded cases

| Excluded case | Reason | Risk accepted? | Follow-up |
|---|---|---|---|
| Boundary values 49/50/51 | Not needed | Yes | None |

## Open questions

| Question | Blocking? | Required action |
|---|---|---|
| None | No | None |
