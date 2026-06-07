// Project-level OpenCode plugin that writes automatic tool/session logs to JSONL.
//
// Logs are written to .agent-logs/opencode/<session-or-date>.jsonl by default.
// The plugin does not call the model and does not require the agent to write logs.

import { appendFileSync, mkdirSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"

const SCHEMA = "agent-runtime-log/v1"
const AGENT = "opencode"
const MAX_STRING = Number(process.env.AGENT_LOG_MAX_STRING || 1200)
const MAX_COLLECTION = Number(process.env.AGENT_LOG_MAX_COLLECTION || 80)
const MAX_DEPTH = Number(process.env.AGENT_LOG_MAX_DEPTH || 6)
const SENSITIVE_KEY = /(password|passwd|pwd|secret|token|refresh|access[_-]?token|api[_-]?key|authorization|auth|cookie|session|credential|private[_-]?key)/i

function now() {
  return new Date().toISOString()
}

function stableId(value) {
  let raw
  try {
    raw = JSON.stringify(value, Object.keys(value || {}).sort())
  } catch {
    raw = String(value)
  }
  return createHash("sha256").update(raw || "").digest("hex").slice(0, 16)
}

function sanitize(value, depth = 0, key = "") {
  if (key && SENSITIVE_KEY.test(key)) return "[REDACTED]"
  if (depth > MAX_DEPTH) return "[TRUNCATED_DEPTH]"
  if (value === null || value === undefined) return value ?? null
  if (typeof value === "string") {
    if (value.length > MAX_STRING) return `${value.slice(0, MAX_STRING)}... [TRUNCATED ${value.length - MAX_STRING} chars]`
    return value
  }
  if (typeof value === "number" || typeof value === "boolean") return value
  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_COLLECTION).map((item) => sanitize(item, depth + 1))
    if (value.length > MAX_COLLECTION) items.push(`[TRUNCATED ${value.length - MAX_COLLECTION} items]`)
    return items
  }
  if (typeof value === "object") {
    const entries = Object.entries(value)
    const result = {}
    for (const [index, [childKey, childValue]] of entries.entries()) {
      if (index >= MAX_COLLECTION) {
        result.__truncated_keys__ = entries.length - MAX_COLLECTION
        break
      }
      result[childKey] = sanitize(childValue, depth + 1, childKey)
    }
    return result
  }
  return String(value)
}

function projectRoot(ctx = {}) {
  return ctx.worktree || ctx.directory || process.cwd()
}

function logPath(ctx = {}, input = {}) {
  if (process.env.AGENT_RUNTIME_LOG) return process.env.AGENT_RUNTIME_LOG
  const root = projectRoot(ctx)
  const dir = process.env.AGENT_RUNTIME_LOG_DIR || path.join(root, ".agent-logs", AGENT)
  const session = input.sessionID || input.sessionId || input.session_id || input.session?.id || new Date().toISOString().slice(0, 10)
  const safeSession = String(session).replace(/[^A-Za-z0-9_.-]+/g, "-").slice(0, 120)
  return path.join(dir, `${safeSession}.jsonl`)
}

function append(ctx, input, record) {
  const filePath = logPath(ctx, input)
  mkdirSync(path.dirname(filePath), { recursive: true })
  appendFileSync(filePath, JSON.stringify(record) + "\n", "utf8")
}

function baseRecord(ctx, input, event) {
  return {
    schema: SCHEMA,
    ts: now(),
    agent: AGENT,
    event,
    sessionId: input?.sessionID || input?.sessionId || input?.session_id || input?.session?.id,
    messageId: input?.messageID || input?.messageId || input?.message_id || input?.message?.id,
    cwd: input?.cwd || projectRoot(ctx),
    model: input?.model,
    logSource: ".opencode/plugins/jsonl-logger.js",
  }
}

export const JsonlLogger = async (ctx) => {
  return {
    "tool.execute.before": async (input, output) => {
      try {
        append(ctx, input, {
          ...baseRecord(ctx, input, "tool.execute.before"),
          toolName: input?.tool,
          callId: input?.callID || input?.callId || input?.id,
          args: sanitize(output?.args ?? input?.args),
          argsHash: stableId(output?.args ?? input?.args),
        })
      } catch {
        // Logging must never block OpenCode tool execution.
      }
    },

    "tool.execute.after": async (input, output) => {
      try {
        append(ctx, input, {
          ...baseRecord(ctx, input, "tool.execute.after"),
          toolName: input?.tool,
          callId: input?.callID || input?.callId || input?.id,
          args: sanitize(output?.args ?? input?.args),
          argsHash: stableId(output?.args ?? input?.args),
          result: sanitize(output?.result ?? output?.output ?? output),
          resultHash: stableId(output?.result ?? output?.output ?? output),
        })
      } catch {
        // Logging must never block OpenCode tool execution.
      }
    },

    "session.idle": async (input) => {
      try {
        append(ctx, input, {
          ...baseRecord(ctx, input, "session.idle"),
          state: sanitize(input),
        })
      } catch {
        // Logging must never block OpenCode session handling.
      }
    },
  }
}
