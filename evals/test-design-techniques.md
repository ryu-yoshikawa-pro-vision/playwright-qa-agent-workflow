# Test Design Technique Evals

Use these fixtures to check whether `playwright-test-designer` and the validator handle technique-based design correctly.

The goal is not to prove AI quality automatically. The goal is to make bad test-design patterns explicit so reviewers can confirm the designer/validator rejects them.

| Fixture | Expected Test Design Review Decision | Purpose |
|---|---|---|
| `good-login.test-design.md` | `PASS` | Good technique selection, concrete final cases, justified exclusions |
| `bad-technique-stuffing.test-design.md` | `FAIL` | Rejects applying every technique mechanically |
| `bad-missing-boundary-values.test-design.md` | `FAIL` | Rejects missing boundary values when a known input limit exists |
| `bad-unjustified-exclusions.test-design.md` | `FAIL` | Rejects unexplained exclusions of meaningful risk |
| `bad-unverified-permission-matrix.test-design.md` | `BLOCKED` | Blocks confirmed-looking permission design without evidence |

## Review prompts

For each fixture, ask the validator or a reviewer:

1. Is the expected decision correct?
2. Are selected techniques appropriate for the source plan and evidence?
3. Are non-applicable techniques rejected with reasons?
4. Are final test cases independent and observable?
5. Is the generator able to implement the cases without guessing?

## Expected behavior

A strong designer/validator should:

- pass the good fixture
- fail technique stuffing
- fail known-boundary omissions
- fail unjustified exclusions
- block unverified permission claims
