<!-- Expected Test Design Review Decision: FAIL -->
# Delete Item Test Design - Bad Exclusions

## Source plan

- Plan path: `specs/delete-item.plan.md`
- Plan SHA-256: `PLACEHOLDER`
- Evidence references: `EV-020`, `EV-021`

## Design status

Decision: PASS

Reason: Delete is covered by one happy path.

## Technique selection summary

| Area | Selected technique | Reason | Not selected / reason | Evidence IDs |
|---|---|---|---|---|
| Delete action | Risk-based testing | Destructive action | Permission matrix not selected | EV-020 |

## Test conditions

| Condition ID | Condition | Source | Risk | Notes |
|---|---|---|---|---|
| COND-001 | Delete existing item | EV-020 | High | Destructive action |

## Technique application

### Role / permission matrix

Status: Not applicable

| Role / permission | Action | Expected result | Evidence IDs | Test case IDs |
|---|---|---|---|---|
| N/A | N/A | N/A | N/A | N/A |

## Final test cases

| Test ID | Source technique | Objective | Preconditions | Steps summary | Expected result | Priority | Automatable? | Evidence IDs |
|---|---|---|---|---|---|---|---|---|
| TD-001 | Risk-based testing | Delete existing item | Item exists | Click delete and confirm | Item disappears from list | High | Yes | EV-020 |

## Excluded cases

| Excluded case | Reason | Risk accepted? | Follow-up |
|---|---|---|---|
| Permission difference | Not tested | Yes | None |
| Cancel confirmation | Not tested | Yes | None |
| Delete already removed item | Not tested | Yes | None |

## Open questions

| Question | Blocking? | Required action |
|---|---|---|
| None | No | None |
