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

function fileIncludes(relativePath, requiredText) {
  const absolute = path.join(root, relativePath);
  checked.push(`${relativePath} contains ${requiredText}`);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    errors.push(`Missing file for content check: ${relativePath}`);
    return false;
  }
  const content = fs.readFileSync(absolute, 'utf8');
  if (!content.includes(requiredText)) {
    errors.push(`Missing required text in ${relativePath}: ${requiredText}`);
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
  return fs
    .readdirSync(artifactsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter(
      (name) => !name.startsWith('_') && !['service-exploration', 'spec-catalog'].includes(name),
    );
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
  'playwright-test-designer',
  'playwright-test-plan-validator',
  'playwright-test-generator',
  'playwright-test-healer',
]) {
  checkRequiredSkill(skill);
}

for (const doc of [
  'docs/workflow.md',
  'docs/playwright-cli.md',
  '.agents/skills/playwright-cli/references/use-cases.md',
  '.agents/skills/playwright-cli/references/use-cases/README.md',
  'docs/test-execution-boundary.md',
  'docs/artifact-conventions.md',
  'docs/handoff-conventions.md',
  'docs/validation-gate.md',
  'docs/workflow-harness.md',
  'docs/spec-catalog.md',
  'docs/git-management.md',
  '.agents/skills/playwright-test-plan-validator/references/semantic-quality-gate.md',
  '.agents/skills/playwright-test-plan-validator/references/test-design-quality-gate.md',
  '.agents/skills/playwright-test-designer/references/test-techniques.md',
  '.agents/skills/playwright-test-designer/references/technique-selection-rules.md',
  '.agents/skills/playwright-test-designer/references/test-design-format.md',
  '.agents/skills/playwright-test-designer/references/anti-patterns.md',
  '.agents/skills/playwright-service-mapper/references/output-formats.md',
]) {
  fileExists(doc, { nonEmpty: true });
}

for (const harnessFile of [
  'scripts/agent-init-run.mjs',
  'scripts/agent-status.mjs',
  'scripts/agent-next-step.mjs',
  'scripts/agent-check-gate.mjs',
  'scripts/workflow/paths.mjs',
  'scripts/workflow/status.mjs',
  'scripts/workflow/validation.mjs',
  'scripts/validate-coverage.mjs',
]) {
  fileExists(harnessFile, { nonEmpty: true });
}

for (let index = 1; index <= 17; index += 1) {
  const prefix = `.agents/skills/playwright-cli/references/use-cases/use-case-${String(index).padStart(2, '0')}-`;
  const matches = fs
    .readdirSync(path.join(root, '.agents', 'skills', 'playwright-cli', 'references', 'use-cases'))
    .filter(
      (name) =>
        name.startsWith(`use-case-${String(index).padStart(2, '0')}-`) && name.endsWith('.md'),
    );
  checked.push(`${prefix}*.md`);
  if (matches.length !== 1) {
    errors.push(
      `Expected exactly one Playwright CLI use-case file for ${prefix}*.md, found ${matches.length}`,
    );
  }
}

for (const template of [
  '99_handoff.md',
  'HANDOFF.md',
  'OPEN_QUESTIONS.md',
  'FINDINGS.md',
  'DECISIONS.md',
  'FEATURE_BACKLOG.md',
  '00_request.md',
  'coverage.md',
]) {
  fileExists(`artifacts/_templates/${template}`, { nonEmpty: true });
}

for (const template of [
  'service-mapper/exploration-log.md',
  'service-mapper/service-map.md',
  'service-mapper/screen-inventory.md',
  'service-mapper/navigation-map.md',
  'service-mapper/feature-inventory.md',
  'service-mapper/role-permission-map.md',
  'service-mapper/coverage-matrix.md',
  'service-mapper/open-questions.md',
  'service-mapper/evidence-index.md',
  'service-mapper/service-mapper-summary.md',
  'validator/semantic-review.md',
  'validator/test-design-review.md',
  'validator/validation-report.md',
  'test-designer/test-design.md',
  'healer/failure-analysis.md',
  'healer/healing-report.md',
  'healer/patch-log.md',
  'spec-catalog/INDEX.md',
  'spec-catalog/OPEN_QUESTIONS.md',
  'spec-catalog/DECISIONS.md',
  'spec-catalog/terminology.md',
  'spec-catalog/screen.md',
  'spec-catalog/feature.md',
  'spec-catalog/flow.md',
  'spec-catalog/data.md',
  'spec-catalog/rule.md',
  'spec-catalog/role-permission-matrix.md',
]) {
  fileExists(`artifacts/_templates/${template}`, { nonEmpty: true });
}

// Spec-catalog entry templates must carry source artifact provenance because evidence IDs
// such as EV-001 can repeat across different runs and evidence indexes.
for (const template of [
  'spec-catalog/screen.md',
  'spec-catalog/feature.md',
  'spec-catalog/flow.md',
  'spec-catalog/data.md',
  'spec-catalog/rule.md',
  'spec-catalog/role-permission-matrix.md',
]) {
  fileIncludes(`artifacts/_templates/${template}`, '- Source artifacts:');
}

for (const catalogFile of ['INDEX.md', 'OPEN_QUESTIONS.md', 'DECISIONS.md', 'terminology.md']) {
  fileExists(`artifacts/spec-catalog/${catalogFile}`, { nonEmpty: true });
}

for (const catalogDir of ['screens', 'features', 'flows', 'data', 'roles', 'rules']) {
  dirExists(`artifacts/spec-catalog/${catalogDir}`);
}

for (const fixture of [
  'good-login.plan.md',
  'bad-thin-login.plan.md',
  'bad-unverified-visual-claim.plan.md',
  'bad-non-independent-scenarios.plan.md',
  'bad-unverified-permission.plan.md',
]) {
  fileExists(`evals/fixtures/${fixture}`, { nonEmpty: true });
}

for (const fixture of [
  'good-login.test-design.md',
  'bad-technique-stuffing.test-design.md',
  'bad-missing-boundary-values.test-design.md',
  'bad-unjustified-exclusions.test-design.md',
  'bad-unverified-permission-matrix.test-design.md',
]) {
  fileExists(`evals/fixtures/${fixture}`, { nonEmpty: true });
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
  'semantic-quality.md',
  'test-design-techniques.md',
]) {
  fileExists(`evals/${evalFile}`, { nonEmpty: true });
}

if (feature) {
  checkHandoffScope(feature, { featureScope: true });
} else {
  const featureScopes = listFeatureScopes();
  if (featureScopes.length === 0) {
    warnings.push(
      'No feature-level artifact scopes found under artifacts/<feature>/. This is fine before feature planning starts.',
    );
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
