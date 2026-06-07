#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const logRootArgIndex = args.indexOf('--log-root');
const logRoot =
  logRootArgIndex >= 0 && logRootArgIndex + 1 < args.length
    ? args[logRootArgIndex + 1]
    : '.agent-logs';
const absoluteLogRoot = path.resolve(root, logRoot);

const errors = [];
const warnings = [];
const sensitiveKey =
  /(password|passwd|pwd|secret|token|refresh|access[_-]?token|api[_-]?key|authorization|auth|cookie|session|credential|private[_-]?key)/i;
const allowedAgents = new Set(['codex', 'opencode', 'gemini-cli']);
const allowedSensitiveLikeKeys = new Set(['sessionId', 'session_id', 'sessionID']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.jsonl')) files.push(fullPath);
  }
  return files;
}

function rel(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, '/');
}

function checkSensitive(value, trail, file, line) {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkSensitive(item, `${trail}[${index}]`, file, line));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const nextTrail = trail ? `${trail}.${key}` : key;
      if (
        sensitiveKey.test(key) &&
        !allowedSensitiveLikeKeys.has(key) &&
        child !== '[REDACTED]' &&
        child !== undefined &&
        child !== null
      ) {
        errors.push(`${rel(file)}:${line} sensitive-looking key is not redacted: ${nextTrail}`);
      }
      checkSensitive(child, nextTrail, file, line);
    }
  }
}

const logFiles = walk(absoluteLogRoot);
if (logFiles.length === 0) {
  console.log('Runtime log check: PASS');
  console.log(
    `No JSONL logs found under ${logRoot}. This is expected before Codex/OpenCode has run.`,
  );
  process.exit(0);
}

let records = 0;
for (const file of logFiles) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((lineText, index) => {
    const lineNumber = index + 1;
    if (!lineText.trim()) return;
    records += 1;
    let record;
    try {
      record = JSON.parse(lineText);
    } catch (error) {
      errors.push(`${rel(file)}:${lineNumber} invalid JSON: ${error.message}`);
      return;
    }

    if (record.schema !== 'agent-runtime-log/v1') {
      errors.push(`${rel(file)}:${lineNumber} schema must be agent-runtime-log/v1`);
    }
    if (!record.ts || typeof record.ts !== 'string') {
      errors.push(`${rel(file)}:${lineNumber} missing string ts`);
    }
    if (!record.agent || typeof record.agent !== 'string') {
      errors.push(`${rel(file)}:${lineNumber} missing string agent`);
    } else if (!allowedAgents.has(record.agent)) {
      warnings.push(`${rel(file)}:${lineNumber} unexpected agent value: ${record.agent}`);
    }
    if (!record.event || typeof record.event !== 'string') {
      errors.push(`${rel(file)}:${lineNumber} missing string event`);
    }
    checkSensitive(record, '', file, lineNumber);
  });
}

console.log(`Runtime log check: ${errors.length === 0 ? 'PASS' : 'FAIL'}`);
console.log(`Checked log files: ${logFiles.length}`);
console.log(`Checked records: ${records}`);
if (warnings.length) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}
if (errors.length) {
  console.error('\nErrors:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
if (strict && warnings.length) {
  console.error('\nStrict mode treats warnings as failures.');
  process.exit(1);
}
