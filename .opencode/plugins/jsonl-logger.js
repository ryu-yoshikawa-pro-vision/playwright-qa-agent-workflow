// OpenCode project plugin: automatic JSONL runtime logging.
// Writes to .agent-logs/opencode/<session-or-date>.jsonl by default.

import { appendFileSync, mkdirSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"

const SCHEMA = "agent-runtime-log/v1"
const AGENT = "opencode"
const MAX_STRING = Number(process.env.AGENT_LOG_MAX_STRING || 1200)
const MAX_COLLECTION = Number(process.env.AGENT_LOG_MAX_COLLECTION || 80)
const MAX_DEPTH = Number(process.env.AGENT_LOG_MAX_DEPTH || 6)
const SENSITIVE_KEY = /(password|passwd|pwd|secret|token|refresh|api[_-]?key|authorization|auth|cookie|session|credential|private[_-]?key)/i

function stableId(value) {
  let raw
  try { raw = JSON.stringify(value ?? {}) } catch { raw = String(value ?? "") }
  return createHash("sha256").update(raw).digest("hex").slice(0, 16)
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
    const result = value.slice(0, MAX_COLLECTION).map((item) => sanitize(item, depth + 1))
    if (value.length > MAX_COLLECTION) result.push(`[TRUNCATED ${value.length - MAX_COLLECTION} items]`)
    return result
  }
  if (typeof value === "object") {
    const result = {}
    const entries = Object.entries(value)
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

function root(ctx = {}) {
  return ctx.worktree || ctx.directory || process.cwd()
}

function outputPath(ctx = {}, input = {}) {
  if (process.env.AGENT_RUNTIME_LOG) return process.env.AGENT_RUNTIME_LOG
  const dir = process.env.AGENT_RUNTIME_LOG_DIR || path.join(root(ctx), ".agent-logs", AGENT)
  const session = input.sessionID || input.sessionId || input.session?.id || new Date().toISOString().slice(0, 10)
  const safeSession = String(session).replace(/[^A-Za-z0-9_.-]+/g, "-").slice(0, 120)
  return path.join(dir, `${safeSession}.jsonl`)
}

function append(ctx, input, record) {
  const file = outputPath(ctx, input)
  mkdirSync(path.dirname(file), { recursive: true })
  appendFileSync(file, JSON.stringify(record) + "\n", "utf8")
}

function base(input, event) {
  return {
    schema: SCHEMA,
    ts: new Date().toISOString(),
    agent: AGENT,
    event,
    sessionId: input?.sessionID || input?.sessionId || input?.session?.id,
    messageId: input?.messageID || input?.messageId || input?.message?.id,
    model: input?.model,
    cwd: input?.cwd || process.cwd(),
    logSource: ".opencode/plugins/jsonl-logger.js",
  }
}

export const JsonlLogger = async (ctx) => ({
  "tool.execute.before": async (input, output) => {
    try {
      const args = output?.args ?? input?.args
      append(ctx, input, {
        ...base(input, "tool.execute.before"),
        toolName: input?.tool,
        callId: input?.callID || input?.callId || input?.id,
        args: sanitize(args),
        argsHash: stableId(args),
      })
    } catch {}
  },
  "tool.execute.after": async (input, output) => {
    try {
      const result = output?.result ?? output?.output ?? output
      append(ctx, input, {
        ...base(input, "tool.execute.after"),
        toolName: input?.tool,
        callId: input?.callID || input?.callId || input?.id,
        result: sanitize(result),
        resultHash: stableId(result),
      })
    } catch {}
  },
  "session.idle": async (input) => {
    try {
      append(ctx, input, {
        ...base(input, "session.idle"),
        state: sanitize(input),
      })
    } catch {}
  },
})
