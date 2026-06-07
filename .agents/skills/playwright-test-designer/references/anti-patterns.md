# Test Designer Anti-patterns

Avoid these behaviors.

## Technique stuffing

Do not apply every technique just because the template contains every section.

Bad:

- A static dashboard gets a state transition table with invented states.
- A screen with no input limits gets arbitrary boundary values.
- A single-condition behavior gets an oversized decision table.

Good:

- Mark non-applicable techniques as `Not applicable` and explain why.

## Invented boundaries

Do not invent min/max values, file sizes, date windows, or text lengths.

If the boundary matters but is unknown, mark it `BLOCKED` or `Unverified`.

## Invented permissions

Do not assume admin/member/viewer behavior without evidence. If only one role was observed, say so.

## Case explosion

Do not treat more cases as better quality. Collapse redundant cases and explain why the selected cases are enough.

## Duplicate scenarios under different technique names

Do not create the same test case repeatedly under equivalence partitioning, boundary value analysis, and error guessing.

## Weak expected results

Do not use expected results such as:

- works correctly
- succeeds
- behaves normally
- displays properly
- no issue occurs

Expected results must be observable.

## Design overrides the plan

Do not expand scope beyond the source plan unless the output clearly marks the expansion as a proposed follow-up, not an approved case for generation.
