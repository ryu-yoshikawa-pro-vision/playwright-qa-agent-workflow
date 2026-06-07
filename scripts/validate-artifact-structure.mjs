#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const hasArg = (name) => args.includes(name);
const getArg = (name, fallback = undefined) => {
  const index = args.indexOf(name);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : fallback;
};

const strict = hasArg('--strict');
const feature = getArg('--feature');
const scope = getArg('--scope', 'service-exploration');

const errors = [];
const warnings = [];
const checked = [];

function rel(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, '/');
}

function fileExists(relativePath, { nonEmpty = false, warn = false } = {}) {
  const absolute = path.join(root, relativePath);
  const exists = fs.existsSync(absolute) && fs.statSync(absolute).isFile();
  checked.push(relativePath);
  if (!exists) {
    (warn ? warnings : errors).push(`Missing file: ${relativePath}`);
    return false;
  }
  if (nonEmpty && fs.readFileSync(absolute, 'utf8').trim().length === 0) {
    (warn ? warnings : errors).push(`Empty file: ${relativePath}`);
    return false;
  }
  return true;
}

function dirExists(relativePath, { warn = false } = {}) {
  const absolute = path.join(root, relativePath);
  const exists = fs.existsSync(absolute) && fs.statSync(absolute).isDirectory();
  checked.push(`${relativePath}/`);
  if (!exists) {
    (warn ? warnings : errors).push(`Missing directory: ${relativePath}`);
  }
  return exists;
}

function checkRequiredSkill(skillName) {
  fileExists(`.agents/skills/${skillName}/SKILL.md`, { nonEmpty: true });
}

function listFeatureScopes() {
  const artifactsDir = path.join(root, 'artifacts');
  if (!fs.existsSync(artifactsDir)) return [];
  return fs.readdirSync(artifactsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('_') && name !== 'service-exploration');
}

function checkHandoffScope(scopeName, { featureScope = false } = {}) {
  const base = `artifacts/${scopeName}`;
  fileExists(`${base}/HANDOFF.md`, { nonEmpty: true });
  fileExists(`${base}/OPEN_QUESTIONS.md`, { nonEmpty: true });
  fileExists(`${base}/FINDINGS.md`, { nonEmpty: true });
  fileExists(`${base}/DECISIONS.md`, { nonEmpty: true });
  if (!featureScope) {
    fileExists(`${base}/FEATURE_BACKLOG.md`, { nonEmpty: true });
  }
}

// Core repository structure.
dirExists('.agents/skills');
for (const skill of [
  'playwright-cli',
  'playwright-service-mapper',
  'playwright-test-planner',
  'playwright-test-plan-validator',
  'playwright-test-generator',
  'playwright-test-healer',
]) {
  checkRequiredSkill(skill);
}

for (const doc of [
  'docs/workflow.md',
  'docs/playwright-cli.md',
  'docs/artifact-conventions.md',
  'docs/handoff-conventions.md',
  'docs/validation-gate.md',
  'docs/git-management.md',
]) {
  fileExists(doc, { nonEmpty: true });
}

for (const template of [
  '99_handoff.md',
  'HANDOFF.md',
  'OPEN_QUESTIONS.md',
  'FINDINGS.md',
  'DECISIONS.md',
  'FEATURE_BACKLOG.md',
]) {
  fileExists(`artifacts/_templates/${template}`, { nonEmpty: true });
}

checkHandoffScope(scope);

dirExists('evals');
for (const evalFile of [
  'README.md',
  'skill-routing.md',
  'service-mapper-cases.md',
  'planner-validator-loop.md',
  'generator-healer-loop.md',
  'artifact-structure.md',
  'runtime-logging.md',
  'validation-hash.md',
]) {
  fileExists(`evals/${evalFile}`, { nonEmpty: true });
}

if (feature) {
  checkHandoffScope(feature, { featureScope: true });
} else {
  const featureScopes = listFeatureScopes();
  if (featureScopes.length === 0) {
    warnings.push('No feature-level artifact scopes found under artifacts/<feature>/. This is fine before feature planning starts.');
  } else {
    for (const featureScope of featureScopes) {
      checkHandoffScope(featureScope, { featureScope: true });
    }
  }
}

console.log(`Artifact structure check: ${errors.length === 0 ? 'PASS' : 'FAIL'}`);
console.log(`Checked entries: ${checked.length}`);
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
