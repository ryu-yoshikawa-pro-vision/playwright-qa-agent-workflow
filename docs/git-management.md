# Git Management

Do not put every artifact into Git. Track only durable, lightweight information that helps the next agent or reviewer continue the work.

## Track in Git

```text
AGENTS.md
README.md
.agents/skills/
docs/
evals/
.codex/hooks.json
.codex/hooks/jsonl_logger.py
.opencode/plugins/jsonl-logger.js
.agent-logs/README.md
artifacts/_templates/
artifacts/service-exploration/HANDOFF.md
artifacts/service-exploration/OPEN_QUESTIONS.md
artifacts/service-exploration/FINDINGS.md
artifacts/service-exploration/DECISIONS.md
artifacts/service-exploration/FEATURE_BACKLOG.md
artifacts/spec-catalog/
specs/*.plan.md
specs/*.test-design.md
specs/_reviews/*.validation.md
```

## Do not track by default

```text
.agent-logs/*.jsonl
.agent-logs/codex/*.jsonl
.agent-logs/opencode/*.jsonl
artifacts/**/runs/
artifacts/**/evidence/
artifacts/**/auth/
*.auth.json
storage-state*.json
test-results/
playwright-report/
blob-report/
*.webm
*.mp4
*.trace.zip
```

## Rationale

Detailed run evidence is valuable during work but noisy in Git. It may also contain sensitive UI data. Saved browser authentication state may contain cookies, local storage, or session material and must not be committed. Promote important information into `HANDOFF.md`, `OPEN_QUESTIONS.md`, `FINDINGS.md`, `DECISIONS.md`, `FEATURE_BACKLOG.md`, and reusable `artifacts/spec-catalog/` entries instead.

## Exception

If a screenshot, trace, or log is essential for review, store it outside Git and reference it from the relevant Markdown file with a sanitized link or evidence ID.
