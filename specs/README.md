# Specs

This directory stores Markdown test plans created by the planner role.

A good spec should be detailed enough for the validator to approve and for the generator role to create Playwright tests without guessing.

## Required workflow

```text
planner writes specs/<plan>.md
plan-validator writes specs/_reviews/<plan-stem>.validation.md
if PASS, generator writes tests
if FAIL, planner revises specs/<plan>.md and validation runs again
```

## Recommended plan structure

```markdown
# <Feature or flow name>

## Context

- Target URL:
- Entry point:
- Seed file:
- Required account/state:
- Required test data:
- Unverified assumptions:

## Screen / flow inventory

| Area | Purpose | Main elements | Navigation / actions | Notes |
|---|---|---|---|---|

## Exploration notes

- Confirmed behavior:
- Unverified behavior:
- Areas not explored:

## Scenarios

### 1. <Scenario title>

Objective:

Starting state:

Test data:

Steps:
1. ...

Expected results:
- ...

Failure indicators:
- ...

Locator / automation notes:
- ...
```

Keep scenarios independent and executable in any order.

## Validation reports

Validation reports are stored in:

```text
specs/_reviews/
```

Each report should use this naming pattern:

```text
specs/_reviews/<plan-stem>.validation.md
```

A plan should not be sent to the generator until the matching validation report decision is `PASS`.
