#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const SCHEMA = 'agent-runtime-log/v1';
const AGENT = 'codex';
const MAX_STRING = Number(process.env.AGENT_LOG_MAX_STRING || 1200);
const MAX_COLLECTION = Number(process.env.AGENT_LOG_MAX_COLLECTION || 80);
const MAX_DEPTH = Number(process.env.AGENT_LOG_MAX_DEPTH || 6);
const SENSITIVE_KEY =
  /(password|passwd|pwd|secret|token|refresh|api[_-]?key|authorization|auth|cookie|session|credential|private[_-]?key)/i;

function now() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, (match) => match);
}

function repoRoot(startPath) {
  let current = path.resolve(startPath);
  try {
    if (fs.existsSync(current) && fs.statSync(current).isFile()) {
      current = path.dirname(current);
    }
  } catch {
    // Fall back to using the original path when stat fails.
  }

  let candidate = current;
  while (true) {
    if (fs.existsSync(path.join(candidate, 'AGENTS.md')) || fs.existsSync(path.join(candidate, '.git'))) {
      return candidate;
    }
    const parent = path.dirname(candidate);
    if (parent === candidate) return candidate;
    candidate = parent;
  }
}

function stableId(value) {
  let raw;
  try {
    raw = JSON.stringify(value, (_key, item) => item, 0);
  } catch {
    raw = String(value);
  }
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex').slice(0, 16);
}

function sanitize(value, depth = 0, key = '') {
  if (key && SENSITIVE_KEY.test(key)) return '[REDACTED]';
  if (depth > MAX_DEPTH) return '[TRUNCATED_DEPTH]';
  if (value === null || value === undefined) return value ?? null;
  if (typeof value === 'string') {
    if (value.length > MAX_STRING) {
      return `${value.slice(0, MAX_STRING)}... [TRUNCATED ${value.length - MAX_STRING} chars]`;
    }
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_COLLECTION).map((item) => sanitize(item, depth + 1));
    if (value.length > MAX_COLLECTION) {
      items.push(`[TRUNCATED ${value.length - MAX_COLLECTION} items]`);
    }
    return items;
  }
  if (typeof value === 'object') {
    const result = {};
    const entries = Object.entries(value);
    for (const [index, [childKey, childValue]] of entries.entries()) {
      if (index >= MAX_COLLECTION) {
        result.__truncated_keys__ = entries.length - MAX_COLLECTION;
        break;
      }
      result[String(childKey)] = sanitize(childValue, depth + 1, String(childKey));
    }
    return result;
  }
  return String(value);
}

function buildRecord(payload) {
  const event = payload.hook_event_name || payload.event || 'unknown';
  const record = {
    schema: SCHEMA,
    ts: now(),
    agent: AGENT,
    event,
    sessionId: payload.session_id,
    turnId: payload.turn_id,
    cwd: payload.cwd,
    model: payload.model,
    permissionMode: payload.permission_mode,
    logSource: '.codex/hooks/jsonl_logger.mjs',
  };

  for (const key of ['tool_name', 'tool_use_id', 'source']) {
    if (key in payload) {
      record[key.replaceAll('_', '')] = sanitize(payload[key]);
    }
  }

  if ('prompt' in payload) {
    const prompt = String(payload.prompt || '');
    record.promptLength = prompt.length;
    record.promptHash = stableId(prompt);
  }
  if ('tool_input' in payload) {
    record.toolInput = sanitize(payload.tool_input);
    record.toolInputHash = stableId(payload.tool_input);
  }
  if ('tool_response' in payload) {
    record.toolResponse = sanitize(payload.tool_response);
    record.toolResponseHash = stableId(payload.tool_response);
  }

  const known = new Set([
    'session_id',
    'turn_id',
    'cwd',
    'model',
    'permission_mode',
    'hook_event_name',
    'tool_name',
    'tool_use_id',
    'source',
    'prompt',
    'tool_input',
    'tool_response',
  ]);
  const extra = Object.fromEntries(Object.entries(payload).filter(([key]) => !known.has(key)));
  if (Object.keys(extra).length > 0) {
    record.extra = sanitize(extra);
  }
  return record;
}

function main() {
  try {
    const raw = fs.readFileSync(0, 'utf8');
    let payload = raw.trim() ? JSON.parse(raw) : {};
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      payload = { raw: payload };
    }

    const root = repoRoot(String(payload.cwd || process.cwd()));
    const logDir = process.env.AGENT_RUNTIME_LOG_DIR || path.join(root, '.agent-logs', AGENT);
    const sessionId = String(payload.session_id || 'unknown-session')
      .replace(/[^A-Za-z0-9_.-]+/g, '-')
      .slice(0, 120);
    const logPath = process.env.AGENT_RUNTIME_LOG || path.join(logDir, `${sessionId}.jsonl`);

    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(
      logPath,
      `${JSON.stringify(buildRecord(payload), undefined, 0)}\n`,
      'utf8',
    );
  } catch (error) {
    process.stderr.write(`codex jsonl logger failed: ${error.message}\n`);
  }
  return 0;
}

process.exit(main());
