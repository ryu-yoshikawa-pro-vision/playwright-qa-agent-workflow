# Healing Rules

The healer fixes tests only after diagnosing the failure. The goal is to preserve product signal, not to make the suite green by weakening it.

## Required healing report fields

Use `artifacts/_templates/healer/healing-report.md` for the final report. Healing reports should include:

- failing test file and title
- target project test command used, when live execution was available
- error summary
- observed behavior
- expected behavior
- failure classification
- evidence references
- root-cause confidence
- patch summary
- rerun result
- remaining risks
- follow-up required from planner, generator, product owner, or environment owner

## Failure classification

Classify each failure before editing. Use the smallest applicable category. If multiple categories apply, name the primary cause and secondary contributors.

| Classification              | Typical signal                                                                                | Safe action                                                                                       | Unsafe action                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `selector-drift`            | Element still exists but accessible name, role, label, or structure changed                   | Update locator to a stable user-facing locator; cite snapshot/screenshot evidence                 | Replace with brittle CSS/XPath without justification               |
| `timing-or-readiness`       | Element appears late, navigation/load state is not awaited, assertion races UI update         | Use Playwright auto-waiting, await specific UI state, or assert the real completion signal        | Add arbitrary `waitForTimeout` as the main fix                     |
| `assertion-mismatch`        | Product behavior is valid but assertion checks the wrong observable result                    | Align assertion with validated plan and observed behavior                                         | Remove assertion or weaken it to only check visibility             |
| `test-data`                 | Required record/account/state is absent, duplicated, stale, or polluted by another test       | Define setup, isolate data, use stable fixtures, or mark blocked if data cannot be created safely | Depend on incidental existing data without documenting it          |
| `auth-or-permission`        | Session expired, role lacks access, permission-specific UI differs                            | Refresh documented auth state, use correct role, or return `BLOCKED` for missing role evidence    | Force navigation around authorization or skip permission assertion |
| `environment-or-config`     | Base URL, feature flag, service dependency, locale, timezone, or browser setting differs      | Fix documented config or report environment blocker                                               | Rewrite product expectations to match a broken environment         |
| `product-defect`            | Application behavior contradicts the validated plan and evidence                              | Do not patch the test to pass; write defect-oriented diagnostic report                            | Change expected result to match the defect                         |
| `test-design-issue`         | Generated test follows a weak or ambiguous plan; assertion cannot prove the intended behavior | Return to planner/designer/validator; revise plan or test design before patching code             | Invent product expectations inside the test                        |
| `flaky-external-dependency` | External API, network, email, file, or third-party dependency is unstable                     | Isolate dependency, add controlled mock only if project policy allows, or mark risk               | Hide failures with broad retries without diagnosis                 |
| `unknown`                   | Evidence is insufficient to classify                                                          | Gather more evidence or produce diagnostic report                                                 | Patch by guessing                                                  |

## Classification workflow

1. Read the failing test, source plan scenario, validation report, and generator mapping.
2. Inspect the smallest failing test output.
3. Use trace, screenshot, snapshot, console, and network evidence when available.
4. Compare observed behavior against the validated plan, not against assumptions made during healing.
5. Assign classification and confidence: `High`, `Medium`, or `Low`.
6. Patch only if the classification allows a safe test-side fix.
7. Rerun the smallest relevant scope when a target project test command is available.
8. Update the run handoff with what changed and what remains risky.

## Safe patch rules

Allowed when supported by evidence:

- Replace a brittle selector with a stable role, label, text, test id, or project-standard locator.
- Add an explicit wait for a product-observable readiness signal.
- Align an assertion with the validated plan when the generated code used the wrong observable.
- Improve setup or cleanup so the scenario is independent.
- Fix incorrect test data references.
- Correct target route or base URL usage based on project configuration.

Not allowed unless explicitly approved:

- `test.skip()` or `test.fixme()`.
- Removing an assertion without an equivalent or stronger replacement.
- Broadening assertions so much that the test no longer proves the scenario.
- Adding arbitrary sleeps as the primary fix.
- Changing expected behavior to match an apparent product defect.
- Deleting failure evidence.
- Creating hidden dependencies between tests.

## Patch impact classification

After classifying the failure cause, classify the patch impact before finishing.

| Patch impact          | Meaning                                                                                                                            | Required follow-up                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `implementation-only` | Locator, readiness, setup, or other code-only fix that preserves the same design intent and observable assertion policy            | Write healer artifacts and update handoff files. Add a coverage note only when useful.                                   |
| `coverage-impacting`  | The patch changes what is observed, asserted, covered, excluded, or left open while preserving the validated design intent         | Update `specs/<feature>.coverage.md`; update `artifacts/<feature>/DECISIONS.md` when the policy is durable.              |
| `design-impacting`    | The patch changes expected behavior, target scope, design case purpose, or treats behavior outside the validated design as correct | Update `specs/<feature>.test-design.md`, rerun validation, then update implementation and `specs/<feature>.coverage.md`. |

Treat these as at least `coverage-impacting`:

- replacing exact text comparison with state, role, validation, or semantic UI checks
- changing the asserted observable result
- adding or removing a covered behavior
- adding an explicit non-covered item
- changing residual risk or open coverage questions
- deleting or merging an implemented test

Treat these as `design-impacting`:

- changing an expected result
- changing the intent of a test-design case
- deciding that a design-required check should no longer be tested
- accepting product behavior that contradicts the validated design
- resolving ambiguous requirements inside the healer without a design update

The healer must not leave a current implementation that can only be understood by reading run-local artifacts. Coverage-affecting decisions must be promoted into `specs/<feature>.coverage.md` before finishing.

### Example: validation message exact string

If a generated test compares `validationMessage` with an exact string but the validated design only requires validation behavior, the healer may replace the brittle exact string check with a stable validation-state or semantic UI assertion. This is `coverage-impacting`; update `specs/<feature>.coverage.md` and record the assertion policy.

If the validated test design explicitly requires exact string verification, changing away from exact string comparison is `design-impacting`. Update the test design and rerun validation before treating the repaired test as current.

## Product defect rule

If the application behavior contradicts the validated plan and evidence, classify as `product-defect` and stop patching. Produce a diagnostic report with:

- failing scenario
- expected behavior from plan
- observed behavior
- evidence links
- suspected impact
- reproduction steps
- recommended owner or next action

## Test-design issue rule

If the failure is caused by a weak plan, weak test design, missing evidence, ambiguous expected result, or non-independent case, classify as `test-design-issue` and send the work back to planner/designer/validator. Do not invent a better requirement during healing.

## Unknown rule

If no safe patch exists, produce a diagnostic report instead of suppressing the failure. Use `artifacts/_templates/healer/failure-analysis.md` and document non-changes in `artifacts/_templates/healer/patch-log.md`.
