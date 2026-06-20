# Release QA Cockpit testability rules

This document defines UI and DOM rules that make Release QA Cockpit usable as a Playwright QA Agent Workflow test target.

The app must be easy to explore through accessibility tree snapshots, not only through CSS selectors.

## Selector priority

Use selectors in this order for generated tests:

1. `getByRole`
2. `getByLabel`
3. `getByText`
4. `getByPlaceholder`
5. `getByTestId`

`data-testid` is allowed only when role, label, and accessible name are insufficient.

## General accessibility rules

- Every page must have one visible level-1 heading.
- Navigation links must have stable accessible names.
- Primary buttons must have stable accessible names.
- Form controls must have visible labels.
- Status badges must expose their status as text or `aria-label`.
- Validation messages must be visible and associated with the affected field when practical.
- Dialogs must use accessible dialog semantics.
- Toasts or temporary messages must use `role="status"` or `role="alert"`.
- Tables should use semantic table markup when the data is tabular.
- Lists may be used for card layouts, but each card must have a stable heading or label.

## Required navigation names

These navigation items must be reachable by role and accessible name:

- `Dashboard`
- `Releases`
- `Activity Log`
- `Demo Controls`

When a release is open, these links or buttons must be available:

- `Open Release Overview`
- `Open Test Execution`
- `Open Defect Triage`
- `Open Risk Review`
- `Open Release Decision`
- `Export Evidence Pack`

## Required role switch names

Role switch controls must be accessible as:

- `Continue as QA Lead`
- `Continue as QA Member`
- `Continue as Release Manager`
- `Continue as Viewer`

If role switching is available in the header after login, the control must expose the current role, for example:

```text
Current role: QA Lead
```

## Required readiness names

Persisted readiness badge must be accessible as one of:

```text
Readiness: Ready
Readiness: At Risk
Readiness: Not Ready
```

Preview readiness badge must be accessible as one of:

```text
Preview readiness: Ready
Preview readiness: At Risk
Preview readiness: Not Ready
```

Do not expose only color-coded readiness.

## Required condition regions

Release Overview and Release Decision must expose:

- region name: `Unmet readiness conditions`
- region name: `Readiness warnings`

If a region has no items, show explicit empty state text:

- `No unmet readiness conditions`
- `No readiness warnings`

## Required Test Execution control names

For each test execution, controls must include the test title in the accessible name.

Examples:

- `Start test Recording playback is available after processing`
- `Mark test Recording playback is available after processing as passed`
- `Mark test Recording playback is available after processing as failed`
- `Block test Recording playback is available after processing`
- `Skip test Recording playback is available after processing`
- `Move test Recording playback is available after processing to retest`
- `Create Test Result evidence for Recording playback is available after processing`

Form labels:

- `Result note`
- `Blocked reason`
- `Skip reason`
- `Evidence title`
- `Evidence content`

## Required Defect Triage control names

For each defect, controls must include the defect title in the accessible name.

Examples:

- `Move defect Recording playback fails after processing to Triaged`
- `Move defect Recording playback fails after processing to In Progress`
- `Move defect Recording playback fails after processing to Fixed`
- `Move defect Recording playback fails after processing to Ready for Retest`
- `Close defect Recording playback fails after processing`
- `Reopen defect Recording playback fails after processing`
- `Mark defect Recording playback fails after processing as Won't Fix`
- `Mark defect Recording playback fails after processing as Duplicate`

Form label:

- `Resolution note`

## Required Risk Review control names

For each risk, controls must include the risk title in the accessible name.

Examples:

- `Submit risk Recording regression risk remains after fix for approval`
- `Accept risk Recording regression risk remains after fix`
- `Reject risk Recording regression risk remains after fix`
- `Mitigate risk Recording regression risk remains after fix`
- `Close risk Recording regression risk remains after fix`

Form labels:

- `Accepted reason`
- `Rejected reason`
- `Mitigation note`

## Required Release Decision names

Form labels:

- `QA completion comment`
- `Decision comment`

Buttons:

- `Save Ready decision`
- `Save At Risk decision`
- `Save Not Ready decision`

The UI must expose disabled reasons using visible text near the buttons.

Examples:

- `Ready decision cannot be saved because readiness warnings remain.`
- `At Risk decision cannot be saved because unmet conditions remain.`
- `QA completion comment is required.`
- `Test Result evidence is required.`

## Required Evidence Pack names

Buttons:

- `Generate Evidence Pack Markdown`
- `Copy Evidence Pack Markdown`
- `Download Evidence Pack Markdown`

The Markdown preview must be exposed through a region named:

```text
Evidence Pack Markdown Preview
```

## Required Demo Reset names

Buttons:

- `Reset demo data`
- `Confirm reset demo data`
- `Cancel reset demo data`

Dialog heading:

```text
Confirm demo data reset
```

After reset, show status text:

```text
Demo data reset complete
```

## Allowed data-testid values

Use `data-testid` only for composite or repeated regions where role selectors are not enough.

Allowed values:

```text
readiness-badge
readiness-preview-badge
unmet-conditions
warning-conditions
test-execution-row
defect-row
risk-row
evidence-pack-preview
activity-log-row
current-role
current-release
```

Do not use generated or index-based test IDs such as:

```text
row-0
button-1
card-2
```

## Visual verification rules

When an agent needs to confirm layout or visual state, use screenshot evidence.

Accessibility snapshots are enough for:

- role names
- labels
- text content
- navigation structure
- enabled or disabled state when exposed semantically

Screenshots are required for claims about:

- card layout
- modal overlay positioning
- responsive behavior
- visual grouping
- color-coded badges
- table density
- overflow or truncation

## Test data reset rules

Every E2E test should be able to start from known data.

Preferred reset method:

1. open Demo Controls
2. click `Reset demo data`
3. confirm with `Confirm reset demo data`
4. wait for `Demo data reset complete`
5. verify `Readiness: Not Ready`

If a test helper is added later, the UI reset flow must still remain available and covered by at least one E2E test.

## Anti-patterns

Do not implement:

- unlabeled icon-only buttons
- status shown only through color
- custom div buttons without button semantics
- form inputs without labels
- transitions that update state without visible confirmation
- hidden test-only controls that normal users cannot access
- role restrictions enforced only by hiding controls while domain handlers still allow mutation

## Completion criteria

The UI is testable when:

- the first smoke E2E uses mostly role and label selectors
- every primary action has a stable accessible name
- readiness and status are readable without screenshots
- Playwright CLI accessibility snapshots show useful page structure
- screenshots are needed only for visual layout claims
