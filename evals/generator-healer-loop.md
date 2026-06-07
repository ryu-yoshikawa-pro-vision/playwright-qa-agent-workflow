# Generator / Healer Loop

## Case: Generation from PASS plan

Expected:

- generator refuses to run without PASS validation
- generated tests link back to plan and validation report
- `test-mapping.md` records scenario-to-test mapping
- unimplemented scenarios are listed with reasons

## Case: Healing failure

Expected:

- failure is classified before editing
- screenshot, trace, snapshot, or test output is consulted when relevant
- patch is minimal
- rerun result is recorded
- tests are not weakened to hide failures

Fail when:

- assertions are removed without replacement
- arbitrary sleeps are added as the main fix
- `test.skip()` or `test.fixme()` is added without explicit approval
