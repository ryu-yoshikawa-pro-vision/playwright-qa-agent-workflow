#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  ensureDir,
  nowRunId,
  parseArgs,
  readTemplate,
  repoPaths,
  requireFeatureSlug,
  writeFileIfMissing,
  toPosixRelative,
} from './workflow/paths.mjs';

const root = process.cwd();
const args = parseArgs();
let feature;
try {
  feature = requireFeatureSlug(args.feature);
} catch (error) {
  console.error(`agent:init: FAIL\n${error.message}`);
  process.exit(1);
}

const request = typeof args.request === 'string' ? args.request : '';
const paths = repoPaths(root, feature);
const explicitRunId = typeof args.run === 'string';
let runId = explicitRunId ? args.run : nowRunId();
if (!/^\d{8}-\d{6}$/.test(runId)) {
  console.error(`agent:init: FAIL\nInvalid run id: ${runId}. Use YYYYMMDD-HHMMSS.`);
  process.exit(1);
}

let runDir = path.join(paths.runsDir, runId);
let offsetSeconds = 1;
while (fs.existsSync(runDir)) {
  if (explicitRunId) {
    console.error(`agent:init: FAIL\nRun already exists: ${toPosixRelative(root, runDir)}`);
    process.exit(1);
  }
  runId = nowRunId(new Date(Date.now() + offsetSeconds * 1000));
  runDir = path.join(paths.runsDir, runId);
  offsetSeconds += 1;
}

const created = [];
const kept = [];
function trackWrite(filePath, content) {
  const wrote = writeFileIfMissing(filePath, content);
  (wrote ? created : kept).push(toPosixRelative(root, filePath));
}

ensureDir(paths.featureArtifactDir);
ensureDir(paths.runsDir);
ensureDir(runDir);
created.push(toPosixRelative(root, runDir));

const replacements = (content) =>
  content
    .replaceAll('<feature>', feature)
    .replaceAll('<run-id>', runId)
    .replaceAll('<request>', request || 'TBD');

for (const name of ['HANDOFF.md', 'OPEN_QUESTIONS.md', 'FINDINGS.md', 'DECISIONS.md']) {
  const template = readTemplate(
    root,
    name,
    `# ${name.replace(/\.md$/, '').replaceAll('_', ' ')}\n\nTBD\n`,
  );
  trackWrite(path.join(paths.featureArtifactDir, name), replacements(template));
}

const requestTemplate = readTemplate(
  root,
  '00_request.md',
  `# Request\n\n- Feature: <feature>\n- Run ID: <run-id>\n- Request: <request>\n`,
);
trackWrite(path.join(runDir, '00_request.md'), replacements(requestTemplate));

const handoffTemplate = readTemplate(root, '99_handoff.md', '# Run Handoff\n\nTBD\n');
trackWrite(path.join(runDir, '99_handoff.md'), replacements(handoffTemplate));

for (const dir of [
  '01_planner',
  '02_test_designer',
  '03_validator',
  '04_generator',
  '05_healer',
  'evidence/screenshots',
  'evidence/traces',
  'evidence/snapshots',
  'evidence/console',
  'evidence/network',
]) {
  const dirPath = path.join(runDir, dir);
  ensureDir(dirPath);
  created.push(toPosixRelative(root, dirPath));
}

console.log('agent:init: PASS');
console.log(`Feature: ${feature}`);
console.log(`Run ID: ${runId}`);
console.log(`Feature workspace: ${toPosixRelative(root, paths.featureArtifactDir)}`);
console.log(`Run directory: ${toPosixRelative(root, runDir)}`);
console.log('Next skill: playwright-test-planner');
console.log('Reason: feature workspace was initialized for planning.');
if (created.length) {
  console.log('\nCreated:');
  for (const item of [...new Set(created)]) console.log(`- ${item}`);
}
if (kept.length) {
  console.log('\nKept existing files:');
  for (const item of [...new Set(kept)]) console.log(`- ${item}`);
}
