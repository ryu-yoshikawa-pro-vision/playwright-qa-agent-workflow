<!-- Expected Semantic Review Decision: FAIL -->

# Dashboard Visual Plan

## Feature summary

Confirm that the dashboard looks correct after login.

## Scope

Dashboard layout and visual design.

## Evidence references

| Evidence ID | Type     | What it proves                                  |
| ----------- | -------- | ----------------------------------------------- |
| EV-001      | snapshot | Main dashboard DOM contains a heading and cards |

## Scenario

### TC-001 Dashboard visual layout is correct

Starting state: signed in as a standard user.

Steps:

1. Open `/dashboard`.
2. Check the dashboard.

Expected results:

- The dashboard design is correct.
- The cards are visually aligned.
- The spacing and colors are correct.

Failure indicators:

- The design is broken.
