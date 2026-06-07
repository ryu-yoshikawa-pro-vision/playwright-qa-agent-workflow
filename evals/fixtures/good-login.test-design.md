<!-- Expected Test Design Review Decision: PASS -->
# Login Test Design

## Source plan

- Plan path: `specs/login.plan.md`
- Plan SHA-256: `PLACEHOLDER`
- Evidence references: `EV-001`, `EV-002`, `EV-003`, `EV-004`

## Design status

Decision: PASS

Reason: Login has input validation, authentication success/failure behavior, and observable navigation/error outcomes. Technique selection is limited to the relevant risks.

## Design scope

In scope:

- Email/password login happy path
- Required field validation
- Invalid credential handling
- Basic double-submit safety

Out of scope:

- Password reset: separate flow and entry point
- SSO login: not present in source plan evidence
- Role-specific landing pages: not confirmed by available evidence

## Technique selection summary

| Area | Selected technique | Reason | Not selected / reason | Evidence IDs |
|---|---|---|---|---|
| Email/password validity | Equivalence partitioning | Valid and invalid credential classes drive outcomes | Boundary value analysis not selected because no length/range limit is confirmed | EV-001, EV-002 |
| Required fields | Error guessing | Empty submissions are common auth defects and messages are observable | Decision table not needed because fields do not have interacting rules beyond requiredness | EV-001, EV-003 |
| Auth success/failure | Risk-based testing | Login is a critical entry path | State transition not applicable because no persistent workflow state is modeled | EV-002, EV-004 |
| Submit behavior | Error guessing | Double submit can create duplicate requests or confusing loading state | Pairwise not needed because factor set is small | EV-001 |

## Test conditions

| Condition ID | Condition | Source | Risk | Notes |
|---|---|---|---|---|
| COND-001 | Valid email and valid password | EV-002 | High | Should navigate to dashboard route from config |
| COND-002 | Empty email and empty password | EV-003 | Medium | Required validation is observable |
| COND-003 | Valid-format email with wrong password | EV-002 | High | Error message is observable |
| COND-004 | Submit clicked twice quickly | EV-001 | Medium | Submit should avoid duplicate/confusing state |

## Technique application

### Equivalence partitioning

Status: Applied

| Field / condition | Valid classes | Invalid classes | Representative values | Evidence IDs |
|---|---|---|---|---|
| Email/password authentication | registered user with correct password | valid-format email with wrong password; empty required fields | `qa-user@example.test` / configured password; `qa-user@example.test` / wrong password; empty fields | EV-001, EV-002, EV-003 |

### Boundary value analysis

Status: Not applicable

| Field / rule | Min | Max | Boundary values | Excluded values | Evidence IDs |
|---|---|---|---|---|---|
| Email/password length | N/A | N/A | N/A | Not selected because no length limits are confirmed in plan evidence | EV-001 |

### Decision table

Status: Not applicable

| Rule | Condition A | Condition B | Condition C | Expected result | Test case IDs |
|---|---|---|---|---|---|
| N/A | Fields do not have confirmed interacting rules | N/A | N/A | N/A | N/A |

### State transition testing

Status: Not applicable

| Current state | Action | Next state | Expected result | Invalid? | Test case IDs |
|---|---|---|---|---|---|
| N/A | Login is not modeled as a multi-state workflow in available evidence | N/A | N/A | N/A | N/A |

### Role / permission matrix

Status: Not applicable

| Role / permission | Action | Expected result | Evidence IDs | Test case IDs |
|---|---|---|---|---|
| N/A | Login plan uses one confirmed test account only | N/A | EV-002 | N/A |

### CRUD coverage

Status: Not applicable

| Operation | In scope? | Observation method | Cleanup / isolation | Test case IDs |
|---|---|---|---|---|
| Create/update/delete | No | Login does not create persistent app data in this plan | N/A | N/A |

### Combination / pairwise selection

Status: Not applicable

| Combination ID | Factors and values | Reason selected | Risk covered | Test case IDs |
|---|---|---|---|---|
| N/A | Factor set is small enough to cover directly | N/A | N/A | N/A |

### Error guessing

Status: Applied

| Risk guess | Why plausible | Expected safe behavior | Test case IDs |
|---|---|---|---|
| Empty submit | Required fields are common auth defects | Required messages are shown and user remains on login page | TD-002 |
| Wrong password | Authentication failure must be safe and clear | Error message is shown and user remains logged out | TD-003 |
| Double submit | Users may click multiple times during loading | App does not navigate twice or show duplicate/conflicting result | TD-004 |

### Exploratory testing charter

Status: Not applicable

| Charter | Mission | Focus areas | Evidence to capture | Timebox |
|---|---|---|---|---|
| N/A | Deterministic auth cases are sufficient for current scope | N/A | N/A | N/A |

## Final test cases

| Test ID | Source technique | Objective | Preconditions | Steps summary | Expected result | Priority | Automatable? | Evidence IDs |
|---|---|---|---|---|---|---|---|---|
| TD-001 | Equivalence partitioning / risk-based testing | Verify valid credentials login | User is on login page with configured valid account | Fill valid email/password and submit | Dashboard route or configured post-login page is reached; login form is no longer shown | High | Yes | EV-001, EV-002, EV-004 |
| TD-002 | Error guessing / equivalence partitioning | Verify required-field validation | User is on login page | Submit with both fields empty | Required validation messages are visible; user remains on login page | Medium | Yes | EV-001, EV-003 |
| TD-003 | Equivalence partitioning / risk-based testing | Verify invalid credentials are rejected | User is on login page | Fill valid-format email with wrong password and submit | Authentication error is visible; user remains logged out and on login page | High | Yes | EV-001, EV-002 |
| TD-004 | Error guessing | Verify double-submit safety | User is on login page | Fill valid credentials and trigger rapid repeated submit | Only one final login result is observed; no duplicate or conflicting error/loading state remains | Medium | Partial | EV-001, EV-004 |

## Excluded cases

| Excluded case | Reason | Risk accepted? | Follow-up |
|---|---|---|---|
| Password reset | Separate flow and not part of plan scope | Yes | Create separate plan if needed |
| SSO login | No evidence that SSO is available in this feature | Yes | Service mapper may add feature candidate |
| Role-specific landing page | Role behavior not confirmed by evidence | Yes | Add role plan when role evidence exists |

## Open questions

| Question | Blocking? | Required action |
|---|---|---|
| None | No | None |
