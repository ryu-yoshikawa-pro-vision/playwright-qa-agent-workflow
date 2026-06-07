# Specs

This directory stores durable Markdown planning, test-design, and validation artifacts.

Feature plans are created by `playwright-test-planner`:

```text
specs/<feature>.plan.md
```

Technique-based test designs are created by `playwright-test-designer`:

```text
specs/<feature>.test-design.md
```

Validation reports belong under:

```text
specs/_reviews/<feature>.validation.md
```

A plan should define scope, evidence, assumptions, behavior inventory, risks, and design inputs. A test design should select techniques, apply them, and define final independent test cases. The generator should work from a PASS-validated test design, not from the plan alone.
