# Planner / Designer / Validator Loop

## Case: Feature planning

Expected planner outputs:

- `specs/<feature>.plan.md`
- feature-level planner artifacts
- visual evidence references
- behavior inventory
- risk assessment
- test design inputs
- feature-level `HANDOFF.md`

Fail when:

- the planner tries to fully apply test techniques
- the planner creates final test cases instead of design inputs
- unverified behavior is presented as confirmed
- visual claims have no visual evidence
- handoff files are stale or missing

## Case: Technique-based test design

Expected designer outputs:

- `specs/<feature>.test-design.md`
- technique selection summary
- selected and rejected techniques with reasons
- technique-specific application for selected techniques
- independent final test cases
- excluded cases and residual risk
- designer artifacts and handoff updates

Fail when:

- every technique is applied mechanically
- boundaries, states, permissions, or roles are invented
- final test cases have vague expected results
- important exclusions have no reason
- cases are dependent on previous cases

## Case: Validation

Expected validator outputs:

- `specs/_reviews/<feature>.validation.md`
- decision is `PASS`, `FAIL`, or `BLOCKED`
- `Semantic Review Decision` is recorded
- `Test Design Review Decision` is recorded
- `FAIL` includes concrete planner/designer refinement instructions
- generator is not invoked unless all decisions are `PASS`

Fail when:

- plan/design hashes are missing
- semantic or test-design review blocks are missing
- overall `PASS` is returned with a non-PASS subsection
- generator is allowed from a plan without a test design

## Validation hash check

The validation report must include:

- Plan path
- Plan SHA-256
- Test design path
- Test design SHA-256
- Validated at
- Decision
- Semantic Review Decision
- Test Design Review Decision

If either the plan or test design changes after validation, the generator must refuse to proceed until validation runs again.
