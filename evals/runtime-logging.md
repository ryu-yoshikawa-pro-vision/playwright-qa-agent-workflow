# Runtime Logging Eval

## Purpose

Verify that automatic runtime logs emitted by Codex hooks or the OpenCode plugin are valid JSONL and follow the expected schema.

This eval is backed by:

```bash
npm run check:logs
```

## What it checks

For `.agent-logs/**/*.jsonl`:

- every non-empty line is valid JSON
- `schema` is `agent-runtime-log/v1`
- `ts` exists
- `agent` exists
- `event` exists
- common secret-looking keys such as password, token, authorization, cookie, session, credential, and api key are redacted

## Pass criteria

- The command exits with code `0`.
- Logs are parseable JSONL.
- Required fields are present.
- Sensitive-looking keys are not stored in plain text.

## No logs yet

If no JSONL files exist under `.agent-logs/`, the check passes. This is expected before Codex or OpenCode has run.

## Failure examples

- A JSONL line is malformed.
- A record is missing `event`.
- A record has `schema` other than `agent-runtime-log/v1`.
- A key named `authorization` contains a real value instead of `[REDACTED]`.

## Custom log root

```bash
node scripts/validate-runtime-logs.mjs --log-root path/to/logs
```
