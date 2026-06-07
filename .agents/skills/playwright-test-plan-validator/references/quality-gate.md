# Validation Quality Gate

Check:

- target scope and entry point are clear
- setup/account/data assumptions are clear
- scenarios are independent and executable
- steps and expected results are observable
- visual claims have screenshot or trace evidence
- unverified behavior is marked as `Unverified`
- open questions and findings were promoted to handoff files
- the generator can create tests without guessing

The validation report must include source metadata:

```markdown
## Source metadata

- Plan path: `specs/<feature>.plan.md`
- Plan SHA-256: `<sha256-of-current-plan-file>`
- Validated at: `<ISO-8601 timestamp>`
- Validator run: `artifacts/<feature>/runs/<run-id>/02_validator/`
- Decision: `PASS | FAIL | BLOCKED`
```

Return `FAIL` if core information is missing or invented certainty affects the plan.
