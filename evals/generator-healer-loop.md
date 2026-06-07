# Generator / Healer Loop

## Case: Generation from PASS test design

Expected:

- generator refuses to run without PASS validation
- generator refuses to run without `specs/<feature>.test-design.md`
- generated tests link back to test-design cases, plan, evidence, and validation report
- `test-mapping.md` records test-design-to-test mapping
- unimplemented design cases are listed with reasons

Fail when:

- generator creates tests from plan-only ideas that were not included in the validated test design
- generator implements excluded cases without explicit user approval
- assertions are vague or weaker than the validated expected results

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

## Test execution boundary check

Generator and healer must not treat `playwright-cli` as the test runner. If live test execution is required, they should use the target project's documented test command and keep Playwright CLI usage to browser evidence, snapshots, screenshots, traces, console, network, sessions, and attach-based investigation.

## Healing classification checks

A healer run should classify the failure before applying any patch. Review whether the report distinguishes at least these outcomes:

- `selector-drift`: locator repair may be safe with evidence.
- `timing-or-readiness`: waiting for a product-observable readiness signal may be safe.
- `test-data`: setup or fixture repair may be safe.
- `product-defect`: test should not be patched to pass.
- `test-design-issue`: return to designer/validator instead of inventing expectations.
- `unknown`: gather more evidence or write a diagnostic report.

Fail the eval when the healer removes assertions, adds arbitrary sleeps, skips the test, or changes expected behavior without evidence.
