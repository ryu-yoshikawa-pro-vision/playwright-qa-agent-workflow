# Automatic Runtime Logging

This repository records Codex and OpenCode activity without asking the model to write logs.

## Codex

Codex automatic logging files:

```text
.codex/hooks.json
.codex/hooks/jsonl_logger.py
```

Default output:

```text
.agent-logs/codex/<session-id>.jsonl
```

The logger records supported prompt, tool, and stop events. Project-local Codex hooks must be reviewed and trusted before they run.

## OpenCode

OpenCode automatic logging file:

```text
.opencode/plugins/jsonl-logger.js
```

Default output:

```text
.agent-logs/opencode/<session-or-date>.jsonl
```

The plugin records supported tool execution events and session idle events.

## Environment overrides

```text
AGENT_RUNTIME_LOG       # exact output JSONL path
AGENT_RUNTIME_LOG_DIR   # directory for per-session JSONL files
AGENT_LOG_MAX_STRING    # default: 1200
AGENT_LOG_MAX_COLLECTION # default: 80
AGENT_LOG_MAX_DEPTH     # default: 6
```

## Safety

The loggers redact common secret-like keys, including password, secret, token, authorization, cookie, session, credential, and api key.

These logs are best-effort operational audit aids, not a complete audit trail and not a security boundary. They may not intercept every possible execution path and must not be used as the only security control. Keep `.agent-logs/` local by default.

## Automated log check

Run this to verify JSONL log structure:

```bash
npm run check:logs
```

The check parses `.agent-logs/**/*.jsonl`, verifies required fields, and fails when common secret-looking keys are not redacted.
