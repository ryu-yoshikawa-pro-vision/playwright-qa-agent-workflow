# Validation Quality Gate

Validate both the feature plan and the technique-based test design before generation.

Check:

- target scope and entry point are clear in the plan
- setup/account/data assumptions are clear in the plan
- behavior inventory, risks, evidence, and design inputs are present
- test-design techniques are selected for the feature, not mechanically applied
- selected techniques are applied with concrete values, conditions, states, roles, or cases
- final test cases are independent and executable
- steps summaries and expected results are observable
- visual claims have screenshot or trace evidence
- unverified behavior is marked as `Unverified`
- open questions and findings were promoted to handoff files
- the generator can create tests without guessing
- semantic quality review is present and returns `PASS`
- test design quality review is present and returns `PASS`

The validation report must include source metadata:

```markdown
## Source metadata

- Plan path: `specs/<feature>.plan.md`
- Plan SHA-256: `<sha256-of-current-plan-file>`
- Test design path: `specs/<feature>.test-design.md`
- Test design SHA-256: `<sha256-of-current-test-design-file>`
- Validated at: `<ISO-8601 timestamp>`
- Validator run: `artifacts/<feature>/runs/<run-id>/03_validator/`
- Decision: `PASS | FAIL | BLOCKED`
- Semantic Review Decision: `PASS | FAIL | BLOCKED`
- Test Design Review Decision: `PASS | FAIL | BLOCKED`
```

Replace every `PASS | FAIL | BLOCKED` placeholder with exactly one value. Leaving the pipe-separated placeholder unresolved is invalid and must fail `npm run check:validation`.

Return `FAIL` if core information is missing or invented certainty affects the plan or design.

## Semantic quality

Apply `semantic-quality-gate.md` before returning overall `PASS`. Overall `PASS` is not allowed when the semantic review decision is `FAIL` or `BLOCKED`.

## Test design quality

Apply `test-design-quality-gate.md` before returning overall `PASS`. Overall `PASS` is not allowed when the test design review decision is `FAIL` or `BLOCKED`.

The validation report must include the full `Semantic Quality Review` block and full `Test Design Quality Review` block.
