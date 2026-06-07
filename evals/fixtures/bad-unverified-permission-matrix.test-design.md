<!-- Expected Test Design Review Decision: BLOCKED -->

# Admin Delete Test Design - Unverified Permission Matrix

## Source plan

- Plan path: `specs/admin-delete.plan.md`
- Plan SHA-256: `PLACEHOLDER`
- Evidence references: `EV-030`

## Design status

Decision: PASS

Reason: Permission behavior is designed.

## Technique selection summary

| Area              | Selected technique       | Reason                         | Not selected / reason | Evidence IDs |
| ----------------- | ------------------------ | ------------------------------ | --------------------- | ------------ |
| Delete permission | Role / permission matrix | Admin and viewer should differ | None                  | EV-030       |

## Technique application

### Role / permission matrix

Status: Applied

| Role / permission | Action      | Expected result         | Evidence IDs | Test case IDs |
| ----------------- | ----------- | ----------------------- | ------------ | ------------- |
| Admin             | Delete item | Delete succeeds         | EV-030       | TD-001        |
| Viewer            | Delete item | Delete button is hidden | EV-030       | TD-002        |

## Final test cases

| Test ID | Source technique         | Objective                   | Preconditions  | Steps summary  | Expected result         | Priority | Automatable? | Evidence IDs |
| ------- | ------------------------ | --------------------------- | -------------- | -------------- | ----------------------- | -------- | ------------ | ------------ |
| TD-001  | Role / permission matrix | Verify admin can delete     | Admin account  | Delete item    | Item is deleted         | High     | Yes          | EV-030       |
| TD-002  | Role / permission matrix | Verify viewer cannot delete | Viewer account | Open item list | Delete button is hidden | High     | Yes          | EV-030       |

## Excluded cases

| Excluded case | Reason                   | Risk accepted? | Follow-up |
| ------------- | ------------------------ | -------------- | --------- |
| Editor role   | Not in current test data | Yes            | None      |

## Open questions

| Question                                        | Blocking? | Required action |
| ----------------------------------------------- | --------- | --------------- |
| Viewer account access not confirmed by evidence | No        | None            |
