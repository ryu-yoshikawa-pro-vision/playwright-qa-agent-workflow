# Test Techniques Reference

This is a compact reference for technique-based test design in Playwright-oriented QA work. Use techniques only when they fit the feature and risk.

## Equivalence partitioning

Use when an input, option, condition, role, or data state can be divided into classes that should behave similarly.

Examples:

- valid email vs invalid email
- active user vs disabled user
- empty list vs populated list
- supported file type vs unsupported file type

Output should identify valid classes, invalid classes, and at least one representative value or state for each class.

## Boundary value analysis

Use when behavior changes around limits.

Examples:

- min/max length
- numeric range
- date range
- pagination size
- upload size
- search result count

Output should include values around the boundary when safe and meaningful, such as `min-1`, `min`, `min+1`, `max-1`, `max`, `max+1`.

Do not invent numeric boundaries. If the limit is unknown, mark it `Unverified` or `BLOCKED`.

## Decision table testing

Use when multiple conditions combine to determine an outcome.

Examples:

- role + feature flag + data state determines button visibility
- required field A + optional field B + invalid field C determines validation result
- meeting status + user role + recording setting determines available actions

Output should list rules, condition values, expected result, and eliminated combinations with reasons.

## State transition testing

Use when the feature has meaningful states and actions move the entity between states.

Examples:

- draft -> submitted -> approved / rejected
- scheduled -> running -> completed / failed
- enabled -> disabled -> enabled

Output should list valid transitions, invalid transitions, expected state, and observable confirmation.

## Role / permission matrix

Use when user role, ownership, tenant, or permission changes behavior.

Examples:

- admin can delete, member cannot
- owner can edit, viewer cannot
- tenant A cannot see tenant B data

Output must distinguish confirmed behavior from unverified assumptions.

## CRUD coverage

Use when the feature creates, reads, updates, or deletes data.

Output should show which lifecycle operations are in scope, how the operation is observed, and what cleanup or data isolation is needed.

## Combination / pairwise selection

Use when multiple independent factors produce too many combinations for exhaustive testing.

Output should list factors, values, chosen combinations, and the risk each combination covers.

Do not call a selection pairwise unless the pairwise reasoning or generated pair coverage is actually described.

## Risk-based testing

Use for prioritization when cases must be limited.

Output should connect high-risk outcomes to selected test cases and explicitly state accepted residual risk.

## Error guessing

Use to cover likely defects that are not fully specified but are plausible from experience.

Examples:

- double submit
- stale data after reload
- duplicate name
- expired session
- network failure during save
- long text overflow

Error guessing must be labeled as inferred risk, not confirmed specification.

## Exploratory testing charter

Use when the goal includes discovering unknown risks or verifying a poorly understood area.

Output should include mission, focus areas, data to use, timebox, and evidence to capture.
