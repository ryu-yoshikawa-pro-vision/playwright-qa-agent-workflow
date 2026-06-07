# Test Design Quality Gate

Use this gate to decide whether `specs/<feature>.test-design.md` is good enough for Playwright Test generation.

The goal is not to require every test technique. The goal is to ensure the selected techniques fit the feature, produce useful independent cases, and avoid invented or redundant design.

## Decision model

Return exactly one test-design decision:

- `PASS`: the design is ready for generation.
- `FAIL`: the designer must revise the design.
- `BLOCKED`: required source context, evidence, account access, role, product behavior, or plan detail is missing.

A validation report may only return overall `PASS` when this decision is also `PASS`.

## Required test design review sections

Every validation report must include this block.

```markdown
## Test Design Quality Review

### 1. Source alignment
Decision: PASS | FAIL | BLOCKED
Notes:

### 2. Technique selection
Decision: PASS | FAIL | BLOCKED
Notes:

### 3. Technique application
Decision: PASS | FAIL | BLOCKED
Notes:

### 4. Final test cases
Decision: PASS | FAIL | BLOCKED
Notes:

### 5. Exclusions and residual risk
Decision: PASS | FAIL | BLOCKED
Notes:

### 6. Generator readiness
Decision: PASS | FAIL | BLOCKED
Notes:

## Test Design Review Decision

Decision: PASS | FAIL | BLOCKED

## Required designer revisions

- ...
```

## 1. Source alignment

Pass only when the design is traceable to the source plan and evidence.

Check that:

- the design references the source plan path
- the design records the current plan SHA-256 or states it must be calculated during validation
- selected areas come from plan behavior inventory, risks, assumptions, or evidence
- the design does not expand scope beyond the plan without marking the item as proposed follow-up
- evidence IDs are used for confirmed behavior

Fail when the design invents scope, behavior, roles, states, or expected results.

Block when a central plan input or referenced evidence is missing.

## 2. Technique selection

Pass only when selected and rejected techniques are justified.

Check that:

- selected techniques match feature characteristics
- rejected techniques include reasons
- high-risk areas have an appropriate design technique
- no technique is applied only because the template has a section
- unverified role, boundary, condition, or state behavior is not treated as confirmed

Fail for technique stuffing, arbitrary technique use, or missing technique justification.

## 3. Technique application

Pass only when selected techniques are applied concretely.

Check that:

- equivalence classes include representative values or states
- boundary values are tied to known or observable limits
- decision tables include meaningful interacting conditions
- state transitions include current state, action, next state, and expected result
- role matrices distinguish confirmed and unverified permissions
- CRUD coverage includes observation and cleanup or isolation
- pairwise or combination selection states factors, values, and selected combinations
- error guessing is labeled as inferred risk

Fail when technique sections are vague, empty, duplicated, or unsupported by evidence.

Block when a necessary technique cannot be applied because source information is missing.

## 4. Final test cases

Pass only when final cases are useful, independent, and observable.

Check that every final case includes:

- stable test ID
- source technique
- objective
- preconditions
- steps summary
- concrete expected result
- priority
- automatable status
- evidence IDs

Fail when cases are only click-through checks, vague smoke tests, duplicates, or dependent on previous cases.

## 5. Exclusions and residual risk

Pass only when excluded cases are intentional.

Check that:

- excluded cases have reasons
- accepted risks are explicit
- deferred cases have follow-up notes when needed
- exclusions do not silently remove high-risk behavior

Fail when important cases are omitted without explanation.

## 6. Generator readiness

Pass only when the generator can create tests without guessing.

Check that:

- no blocking open questions remain
- final cases are specific enough to implement
- expected results are observable
- setup, data, role, and cleanup requirements are clear enough
- design does not conflict with the source plan

Fail or block when generator would need to invent behavior, data, selectors, or assertions.

## Generator readiness rule

The generator must stop unless all of the following are true:

- overall validation decision is `PASS`
- `Semantic Review Decision` is `PASS`
- `Test Design Review Decision` is `PASS`
- no semantic or test-design subsection is `FAIL` or `BLOCKED`
- current plan SHA-256 matches the validation report
- current test design SHA-256 matches the validation report
- unresolved blockers are absent
