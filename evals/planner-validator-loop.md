# Planner / Validator Loop

## Case: Feature planning

Expected planner outputs:

- `specs/<feature>.plan.md`
- feature-level planner artifacts
- visual evidence references
- feature-level `HANDOFF.md`

## Case: Validation

Expected validator outputs:

- `specs/_reviews/<feature>.validation.md`
- decision is `PASS`, `FAIL`, or `BLOCKED`
- `FAIL` includes concrete planner refinement instructions
- generator is not invoked unless decision is `PASS`

Fail when:

- unverified behavior is presented as confirmed
- plan lacks observable expected results
- visual claims have no visual evidence
- handoff files are stale or missing

## Validation hash check

The validation report must include:

- Plan path
- Plan SHA-256
- Validated at
- Decision

If the plan changes after validation, the generator must refuse to proceed until validation runs again.
