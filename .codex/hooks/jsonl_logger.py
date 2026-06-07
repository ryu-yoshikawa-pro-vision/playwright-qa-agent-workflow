#!/usr/bin/env python3
"""Codex hook JSONL logger.

Records Codex hook events to .agent-logs/codex/<session-id>.jsonl.
The logger is intentionally silent on stdout and never blocks agent execution.
"""
from __future__ import annotations

import datetime as dt
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
SENSITIVE_KEY = re.compile(r"(password|passwd|pwd|secret|token|refresh|api[_-]?key|authorization|auth|cookie|session|credential|private[_-]?key)", re.I)


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def repo_root(start: Path) -> Path:
    current = start.resolve()
    if current.is_file():
        current = current.parent
    for candidate in (current, *current.parents):
        if (candidate / "AGENTS.md").exists() or (candidate / ".git").exists():
            return candidate
    return current


def stable_id(value: Any) -> str:
    try:
        raw = json.dumps(value, ensure_ascii=False, sort_keys=True, default=str)
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
        for idx, (child_key, child_value) in enumerate(value.items()):
            if idx >= MAX_COLLECTION:
                result["__truncated_keys__"] = len(value) - MAX_COLLECTION
                break
            result[str(child_key)] = sanitize(child_value, depth + 1, str(child_key))
        return result
    return str(value)


def build_record(payload: dict[str, Any]) -> dict[str, Any]:
    event = payload.get("hook_event_name") or payload.get("event") or "unknown"
    record: dict[str, Any] = {
        "schema": SCHEMA,
        "ts": now(),
        "agent": AGENT,
        "event": event,
        "sessionId": payload.get("session_id"),
        "turnId": payload.get("turn_id"),
        "cwd": payload.get("cwd"),
        "model": payload.get("model"),
        "permissionMode": payload.get("permission_mode"),
        "logSource": ".codex/hooks/jsonl_logger.py",
    }
    for key in ("tool_name", "tool_use_id", "source"):
        if key in payload:
            record[key.replace("_", "")] = sanitize(payload.get(key))
    if "prompt" in payload:
        prompt = str(payload.get("prompt") or "")
        record["promptLength"] = len(prompt)
        record["promptHash"] = stable_id(prompt)
    if "tool_input" in payload:
        record["toolInput"] = sanitize(payload.get("tool_input"))
        record["toolInputHash"] = stable_id(payload.get("tool_input"))
    if "tool_response" in payload:
        record["toolResponse"] = sanitize(payload.get("tool_response"))
        record["toolResponseHash"] = stable_id(payload.get("tool_response"))
    known = set(payload.keys()) & {"session_id", "turn_id", "cwd", "model", "permission_mode", "hook_event_name", "tool_name", "tool_use_id", "source", "prompt", "tool_input", "tool_response"}
    extra = {k: v for k, v in payload.items() if k not in known}
    if extra:
        record["extra"] = sanitize(extra)
    return record


def main() -> int:
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
        if not isinstance(payload, dict):
            payload = {"raw": payload}
        root = repo_root(Path(str(payload.get("cwd") or os.getcwd())))
        log_dir = Path(os.environ.get("AGENT_RUNTIME_LOG_DIR", root / ".agent-logs" / AGENT))
        session_id = re.sub(r"[^A-Za-z0-9_.-]+", "-", str(payload.get("session_id") or "unknown-session"))[:120]
        log_path = Path(os.environ.get("AGENT_RUNTIME_LOG", log_dir / f"{session_id}.jsonl"))
        log_path.parent.mkdir(parents=True, exist_ok=True)
        with log_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(build_record(payload), ensure_ascii=False, separators=(",", ":")) + "\n")
    except Exception as exc:
        print(f"codex jsonl logger failed: {exc}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
