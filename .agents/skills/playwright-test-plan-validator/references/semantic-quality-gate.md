# Semantic Quality Gate

Use this gate to decide whether `specs/<feature>.plan.md` contains enough verified product understanding and design input to support technique-based test design.

This gate is plan-focused. It should not require the planner to produce final test cases, detailed assertions, decision tables, boundary-value tables, or state-transition tables. Those belong in `specs/<feature>.test-design.md` and are reviewed by `test-design-quality-gate.md`.

The goal is not to prove that the plan is perfect. The goal is to stop shallow, invented, untraceable, or under-scoped plans from becoming brittle test designs and generated tests.

## Decision model

Return exactly one semantic decision:

- `PASS`: the plan is meaningful enough for `playwright-test-designer` and downstream validation.
- `FAIL`: the planner must revise the plan or re-explore before design/generation.
- `BLOCKED`: required source context, evidence, account access, or product behavior is missing.

A validation report may only return overall `PASS` when the semantic decision is also `PASS`.

## Required semantic review sections

Every validation report must include this block.

```markdown
## Semantic Quality Review

### 1. Feature understanding
Decision: PASS | FAIL | BLOCKED
Notes:

### 2. Scope and setup clarity
Decision: PASS | FAIL | BLOCKED
Notes:

### 3. Evidence traceability
Decision: PASS | FAIL | BLOCKED
Notes:

### 4. Behavior inventory adequacy
Decision: PASS | FAIL | BLOCKED
Notes:

### 5. Risk and design-input adequacy
Decision: PASS | FAIL | BLOCKED
Notes:

### 6. Blockers and open questions
Decision: PASS | FAIL | BLOCKED
Notes:

## Semantic Review Decision

Decision: PASS | FAIL | BLOCKED

## Required planner revisions

- ...
```

## 1. Feature understanding

Pass only when the plan explains the feature at a level that a test designer can use without guessing.

Check that the plan includes:

- feature purpose and user value
- target page, flow, or component boundaries
- entry point and completion point, when applicable
- major UI elements, user actions, or observable product behaviors involved
- important states, such as empty, populated, loading, error, disabled, permission-limited, or authenticated/anonymous
- confirmed account, role, permission, and data assumptions
- unresolved behavior marked as `Unverified`

Fail when the plan only says that the page should open, the button should work, or the operation should succeed without explaining what success means at the feature level.

Block when the validator cannot inspect enough source material, evidence, or product behavior to decide.

## 2. Scope and setup clarity

Pass only when the plan makes the design boundary and required setup clear.

Check that the plan includes:

- in-scope and out-of-scope items
- reasons for excluding common risk areas, such as validation, permissions, persistence, destructive actions, integrations, or role differences
- required route, navigation path, or screen entry point
- login state, account, role, feature flag, environment, and starting data assumptions
- setup and cleanup expectations when data may be created, changed, or reused

Fail when the scope is broad, vague, or mixes unrelated flows.

Block when a missing account, role, environment, or data state prevents meaningful test design.

## 3. Evidence traceability

Pass only when plan claims are traceable to evidence or explicitly marked as unverified.

Check that the plan references:

- snapshot or DOM evidence for structure and accessible controls
- screenshot evidence for visual layout, visibility, or styling claims
- trace, console, or network evidence when behavior requires deeper diagnosis
- source, config, handoff findings, or decisions when the plan depends on prior exploration

Fail when the plan presents visual, permission, persistence, or error-handling behavior as confirmed without evidence.

Block when required evidence is missing and the claim is central to the feature.

## 4. Behavior inventory adequacy

Pass only when the plan identifies the behaviors that should be designed, without turning them into final test cases.

Check whether the behavior inventory captures relevant behavior areas, such as:

- happy path or core user flow
- validation and error feedback
- navigation, redirect, or recovery behavior
- empty/populated/loading/error state differences
- role or permission differences
- persistence, reflection, or side effects
- destructive action and confirmation behavior
- duplicate, collision, or retry behavior

Do not require every category for every feature. Require an explicit reason when an obviously relevant behavior area is omitted.

Fail when the plan is only a smoke check, display check, or click-through outline for a feature that clearly has more meaningful behavior.

## 5. Risk and design-input adequacy

Pass only when the plan provides enough risk and design input for `playwright-test-designer` to select techniques.

Check that the plan includes:

- risk assessment with level and rationale
- mapping from risks to behavior IDs or evidence IDs
- design-input areas that suggest relevant technique families without forcing the final selection
- constraints, assumptions, and data considerations that affect technique choice
- notes for high-risk areas that require deeper design

Fail when the plan has no risk rationale, treats all behavior equally, or gives no usable input for technique selection.

Block when a high-risk design input depends on unverified behavior that must be explored first.

## 6. Blockers and open questions

Pass only when open questions are actionable and no blocking question prevents test design.

Check that:

- unverified assumptions are separated from open questions
- each open question has a blocking/non-blocking decision
- blocking questions have an owner or next action
- non-blocking questions do not prevent technique selection or final test design
- the plan does not ask the designer or generator to invent missing behavior, data, selectors, or assertions

Fail when open questions are vague or important unknowns are hidden in prose.

Block when a central behavior, permission, account, data state, or evidence item must be resolved before design.

## Required planner revision style

When returning `FAIL`, include concrete instructions that the planner can act on.

Prefer:

- `Add behavior inventory rows for invalid credential handling and required-field validation, with evidence IDs.`
- `Re-explore role Y because delete permission is asserted without role-specific evidence.`
- `Move final test-case details out of the plan and provide design inputs for the designer instead.`
- `Mark dashboard route as unverified or cite the config/source evidence that confirms it.`

Avoid:

- `Improve the plan.`
- `Add more tests.`
- `Be more specific.`

## Generator readiness rule

The generator must stop unless all of the following are true:

- overall validation decision is `PASS`
- `Semantic Review Decision` is `PASS`
- `Test Design Review Decision` is `PASS`
- no semantic or test-design subsection is `FAIL` or `BLOCKED`
- current plan SHA-256 matches the validation report
- current test design SHA-256 matches the validation report
- unresolved blockers are absent
