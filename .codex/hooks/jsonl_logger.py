#!/usr/bin/env python3
"""Repository-local Codex hook logger.

This script receives Codex hook input JSON on stdin and appends a sanitized
JSONL record to .agent-logs/codex/<session-id>.jsonl by default.

It intentionally emits no stdout so it does not add model-visible context or
consume LLM tokens. It never blocks tool execution; logging failures are written
to stderr and the process exits 0.
"""

from __future__ import annotations

import datetime as _dt
import hashlib
import json
import os
from pathlib import Path
import re
import sys
from typing import Any

SCHEMA = "agent-runtime-log/v1"
AGENT = "codex"
MAX_STRING = int(os.environ.get("AGENT_LOG_MAX_STRING", "1200"))
MAX_COLLECTION = int(os.environ.get("AGENT_LOG_MAX_COLLECTION", "80"))
MAX_DEPTH = int(os.environ.get("AGENT_LOG_MAX_DEPTH", "6"))

SENSITIVE_KEY = re.compile(
    r"(password|passwd|pwd|secret|token|refresh|access[_-]?token|api[_-]?key|authorization|auth|cookie|session|credential|private[_-]?key)",
    re.IGNORECASE,
)


def utc_now() -> str:
    return _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def find_repo_root(start: Path) -> Path:
    current = start.resolve()
    if current.is_file():
        current = current.parent
    for candidate in [current, *current.parents]:
        if (candidate / ".git").exists() or (candidate / "AGENTS.md").exists():
            return candidate
    return current


def stable_id(value: Any) -> str:
    try:
        raw = json.dumps(value, sort_keys=True, ensure_ascii=False, default=str)
    except Exception:
        raw = repr(value)
    return hashlib.sha256(raw.encode("utf-8", errors="replace")).hexdigest()[:16]


def sanitize(value: Any, depth: int = 0, key: str | None = None) -> Any:
    if key and SENSITIVE_KEY.search(key):
        return "[REDACTED]"
    if depth > MAX_DEPTH:
        return "[TRUNCATED_DEPTH]"
    if value is None or isinstance(value, (bool, int, float)):
        return value
    if isinstance(value, str):
        if len(value) > MAX_STRING:
            return value[:MAX_STRING] + f"... [TRUNCATED {len(value) - MAX_STRING} chars]"
        return value
    if isinstance(value, list):
        items = [sanitize(item, depth + 1) for item in value[:MAX_COLLECTION]]
        if len(value) > MAX_COLLECTION:
            items.append(f"[TRUNCATED {len(value) - MAX_COLLECTION} items]")
        return items
    if isinstance(value, dict):
        result: dict[str, Any] = {}
        for index, (child_key, child_value) in enumerate(value.items()):
            if index >= MAX_COLLECTION:
                result["__truncated_keys__"] = len(value) - MAX_COLLECTION
                break
            key_str = str(child_key)
            result[key_str] = sanitize(child_value, depth + 1, key_str)
        return result
    return str(value)


def event_summary(payload: dict[str, Any]) -> dict[str, Any]:
    event = payload.get("hook_event_name") or payload.get("event") or "unknown"
    base = {
        "schema": SCHEMA,
        "ts": utc_now(),
        "agent": AGENT,
        "event": event,
        "sessionId": payload.get("session_id"),
        "turnId": payload.get("turn_id"),
        "cwd": payload.get("cwd"),
        "model": payload.get("model"),
        "permissionMode": payload.get("permission_mode"),
    }

    if "tool_name" in payload:
        base["toolName"] = payload.get("tool_name")
    if "tool_use_id" in payload:
        base["toolUseId"] = payload.get("tool_use_id")
    if "source" in payload:
        base["source"] = payload.get("source")
    if "agent_type" in payload:
        base["subagentType"] = payload.get("agent_type")

    # Avoid storing full prompt text by default. Keep a hash and length so the
    # event is auditable without duplicating user content into logs.
    if "prompt" in payload:
        prompt = str(payload.get("prompt") or "")
        base["promptLength"] = len(prompt)
        base["promptHash"] = stable_id(prompt)

    if "tool_input" in payload:
        base["toolInput"] = sanitize(payload.get("tool_input"))
        try:
            base["toolInputHash"] = stable_id(payload.get("tool_input"))
        except Exception:
            pass

    if "tool_response" in payload:
        base["toolResponse"] = sanitize(payload.get("tool_response"))
        try:
            base["toolResponseHash"] = stable_id(payload.get("tool_response"))
        except Exception:
            pass

    # Preserve sanitized payload for fields that may be useful as Codex evolves,
    # but avoid duplicating large known fields.
    known = set(base.keys()) | {
        "session_id", "turn_id", "cwd", "model", "permission_mode", "hook_event_name",
        "tool_name", "tool_use_id", "tool_input", "tool_response", "prompt", "source",
        "agent_type",
    }
    extras = {k: v for k, v in payload.items() if k not in known}
    if extras:
        base["extra"] = sanitize(extras)
    return base


def main() -> int:
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
        if not isinstance(payload, dict):
            payload = {"raw": payload}

        cwd = Path(str(payload.get("cwd") or os.getcwd()))
        root = find_repo_root(cwd)
        log_dir = Path(os.environ.get("AGENT_RUNTIME_LOG_DIR", root / ".agent-logs" / AGENT))
        session_id = str(payload.get("session_id") or "unknown-session")
        safe_session = re.sub(r"[^A-Za-z0-9_.-]+", "-", session_id)[:120]
        log_path = Path(os.environ.get("AGENT_RUNTIME_LOG", log_dir / f"{safe_session}.jsonl"))
        log_path.parent.mkdir(parents=True, exist_ok=True)

        record = event_summary(payload)
        record["logSource"] = ".codex/hooks/jsonl_logger.py"

        with log_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
    except Exception as exc:  # Never break Codex execution because logging failed.
        print(f"codex jsonl logger failed: {exc}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
