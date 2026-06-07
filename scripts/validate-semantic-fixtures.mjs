#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fixturesDir = path.join(root, 'evals', 'fixtures');
const errors = [];
const warnings = [];
const allowedDecisions = new Set(['PASS', 'FAIL', 'BLOCKED']);

function read(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) {
    errors.push(`Missing file: ${relativePath}`);
    return '';
  }
  const text = fs.readFileSync(absolute, 'utf8');
  if (text.trim().length === 0) errors.push(`Empty file: ${relativePath}`);
  return text;
}

function extractExpectedDecision(text, fileName) {
  const match = text.match(/Expected Semantic Review Decision:\s*(PASS|FAIL|BLOCKED)/i);
  if (!match) {
    errors.push(
      `Fixture ${fileName} must contain marker: Expected Semantic Review Decision: PASS|FAIL|BLOCKED`,
    );
    return null;
  }
  return match[1].toUpperCase();
}

const evalDoc = read('evals/semantic-quality.md');
let fixtures = [];

if (!fs.existsSync(fixturesDir) || !fs.statSync(fixturesDir).isDirectory()) {
  errors.push('Missing directory: evals/fixtures');
} else {
  fixtures = fs
    .readdirSync(fixturesDir)
    .filter((name) => name.endsWith('.plan.md'))
    .sort();
  if (fixtures.length === 0)
    errors.push('No semantic fixtures found under evals/fixtures/*.plan.md');
}

const decisionCounts = new Map();

for (const fileName of fixtures) {
  const text = read(`evals/fixtures/${fileName}`);
  const decision = extractExpectedDecision(text, fileName);
  if (decision && !allowedDecisions.has(decision)) {
    errors.push(`Fixture ${fileName} has unsupported expected decision: ${decision}`);
  }
  if (decision) decisionCounts.set(decision, (decisionCounts.get(decision) || 0) + 1);

  if (!evalDoc.includes(`\`${fileName}\``)) {
    errors.push(`evals/semantic-quality.md does not reference fixture: ${fileName}`);
  }
  if (decision && !evalDoc.includes(`\`${decision}\``)) {
    warnings.push(`evals/semantic-quality.md may not document expected decision: ${decision}`);
  }
  if (!/^#\s+/m.test(text)) {
    errors.push(`Fixture ${fileName} must contain a Markdown title`);
  }
  if (decision === 'PASS') {
    for (const required of [
      '## Scope',
      '## Entry point and setup',
      '## Account, role, permission, and data assumptions',
      '## Evidence references',
      '## Behavior inventory',
      '## Risk assessment',
      '## Test design inputs',
      '## Unverified assumptions',
      '## Open questions',
    ]) {
      if (!text.includes(required))
        errors.push(`PASS fixture ${fileName} missing required section/text: ${required}`);
    }
    for (const disallowed of [
      '## Scenarios',
      '## Scenario-to-evidence mapping',
      '## Final test cases',
      'Expected results:',
      'Failure indicators:',
    ]) {
      if (text.includes(disallowed))
        errors.push(
          `PASS fixture ${fileName} contains design-level content that belongs in test-design fixture: ${disallowed}`,
        );
    }
  }
}

for (const decision of allowedDecisions) {
  if (!decisionCounts.has(decision)) {
    errors.push(`Semantic fixtures must include at least one ${decision} case`);
  }
}

console.log(`Semantic fixture check: ${errors.length === 0 ? 'PASS' : 'FAIL'}`);
console.log(`Checked fixtures: ${fixtures.length}`);
if (warnings.length) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}
if (errors.length) {
  console.error('\nErrors:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
