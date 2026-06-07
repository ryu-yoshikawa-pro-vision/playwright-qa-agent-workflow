#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const getArg = (name, fallback = undefined) => {
  const index = args.indexOf(name);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : fallback;
};
const feature = getArg('--feature');
const strict = args.includes('--strict');

const specsDir = path.join(root, 'specs');
const reviewsDir = path.join(specsDir, '_reviews');
const errors = [];
const warnings = [];

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function extractHash(text) {
  const match = text.match(/Plan SHA-256:\s*`?([a-fA-F0-9]{64})`?/i);
  return match ? match[1].toLowerCase() : null;
}

function extractDecision(text) {
  const metadataDecision = text.match(/Decision:\s*`?\b(PASS|FAIL|BLOCKED)\b`?/i);
  if (metadataDecision) return metadataDecision[1].toUpperCase();
  const headingDecision = text.match(/##\s*Decision\s*\n+\s*(PASS|FAIL|BLOCKED)\b/i);
  if (headingDecision) return headingDecision[1].toUpperCase();
  return null;
}

function planStem(planName) {
  return planName.endsWith('.plan.md') ? planName.slice(0, -'.plan.md'.length) : planName.replace(/\.md$/, '');
}

if (!fs.existsSync(specsDir)) {
  console.log('Validation hash check: PASS');
  console.log('No specs/ directory exists yet.');
  process.exit(0);
}

let plans = fs.readdirSync(specsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => name.endsWith('.plan.md'));

if (feature) {
  const expected = feature.endsWith('.plan.md') ? feature : `${feature}.plan.md`;
  plans = plans.filter((name) => name === expected);
  if (plans.length === 0) errors.push(`Specified feature plan not found: specs/${expected}`);
}

if (plans.length === 0 && errors.length === 0) {
  console.log('Validation hash check: PASS');
  console.log('No specs/*.plan.md files found yet.');
  process.exit(0);
}

for (const planName of plans) {
  const stem = planStem(planName);
  const planPath = path.join(specsDir, planName);
  const validationPath = path.join(reviewsDir, `${stem}.validation.md`);
  const relativePlan = `specs/${planName}`;
  const relativeValidation = `specs/_reviews/${stem}.validation.md`;

  if (!fs.existsSync(validationPath)) {
    errors.push(`Missing validation report for ${relativePlan}: ${relativeValidation}`);
    continue;
  }

  const report = fs.readFileSync(validationPath, 'utf8');
  const recordedHash = extractHash(report);
  const decision = extractDecision(report);
  const currentHash = sha256(planPath);

  if (!recordedHash) {
    errors.push(`Validation report missing Plan SHA-256: ${relativeValidation}`);
  } else if (recordedHash !== currentHash) {
    errors.push(`Plan hash mismatch for ${relativePlan}: current ${currentHash}, validation report ${recordedHash}`);
  }

  if (!decision) {
    errors.push(`Validation report missing Decision PASS/FAIL/BLOCKED: ${relativeValidation}`);
  } else if (decision !== 'PASS') {
    warnings.push(`Validation decision for ${relativePlan} is ${decision}. Generator must not run until PASS.`);
  }
}

console.log(`Validation hash check: ${errors.length === 0 ? 'PASS' : 'FAIL'}`);
console.log(`Checked plans: ${plans.length}`);
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
