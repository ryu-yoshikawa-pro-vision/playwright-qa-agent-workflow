# Technique Selection Rules

Select techniques based on feature characteristics, not by habit. The designer must explain both selected and rejected techniques.

## Selection matrix

| Feature characteristic                                                                   | Prefer these techniques                           | Notes                                                         |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| Input fields, numeric ranges, dates, lengths, file sizes, search terms                   | Equivalence partitioning, boundary value analysis | Boundary values require known or observable limits.           |
| Multiple conditions interact to determine visibility, validation, routing, or outcome    | Decision table testing                            | Avoid for a single independent condition.                     |
| Entity or workflow has statuses                                                          | State transition testing                          | Include invalid transitions when meaningful.                  |
| Behavior changes by role, owner, tenant, account, or permission                          | Role / permission matrix                          | Do not assert unverified permissions.                         |
| Feature creates, reads, updates, or deletes persistent data                              | CRUD coverage                                     | Include observation and cleanup strategy.                     |
| Many independent factors create too many cases                                           | Combination / pairwise selection                  | State factors, values, and chosen combinations.               |
| High impact area, destructive action, privacy, billing, contract, external communication | Risk-based testing                                | Use to prioritize depth and avoid low-value case explosion.   |
| Common defect patterns not explicit in spec                                              | Error guessing                                    | Label inferred risks and avoid claiming them as requirements. |
| Unknown or poorly understood area                                                        | Exploratory testing charter                       | Use to learn, not to replace required deterministic cases.    |

## Rejection rules

Record `Not selected` with a reason when a technique is not appropriate.

Reject or mark `N/A` when:

- no input boundary exists for boundary value analysis
- no meaningful states exist for state transition testing
- conditions do not interact for decision table testing
- no confirmed role or permission variance exists for role / permission matrix
- no persistent data lifecycle is in scope for CRUD coverage
- the combination space is small enough to cover directly without pairwise reduction
- exploratory testing would duplicate already well-defined deterministic cases

## Priority rules

Prefer techniques in this order when time or output length is constrained:

1. Techniques that address the highest product risk.
2. Techniques supported by evidence.
3. Techniques that produce observable assertions.
4. Techniques that reduce ambiguity for the generator.
5. Techniques that minimize redundant or low-value cases.

## BLOCKED rules

Return or mark `BLOCKED` when a technique is necessary but the required information is missing.

Examples:

- Permission matrix is necessary, but only one role is accessible.
- Boundary value analysis is necessary, but maximum length is unknown and cannot be observed.
- State transition testing is necessary, but current states and valid actions are not known.
- Decision table is necessary, but condition interactions are not observable or documented.
