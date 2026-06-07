#!/usr/bin/env node
import { parseArgs, requireFeatureSlug, toPosixRelative } from './workflow/paths.mjs';
import { formatFileStatus, formatGateStatus, getFeatureStatus } from './workflow/status.mjs';

const root = process.cwd();
const args = parseArgs();
let feature;
try {
  feature = requireFeatureSlug(args.feature);
} catch (error) {
  console.error(`agent:status: FAIL\n${error.message}`);
  process.exit(1);
}

const status = getFeatureStatus({ root, feature });
console.log('agent:status: PASS');
console.log(`Feature: ${feature}`);
console.log(
  `Artifact scope: ${status.artifactScopeExists ? 'exists' : 'missing'} (${toPosixRelative(root, status.paths.featureArtifactDir)})`,
);
console.log(`Latest run: ${status.latestRun ?? 'none'}`);
console.log('');
console.log(
  formatFileStatus('Plan', status.files.plan, toPosixRelative(root, status.paths.planPath)),
);
console.log(
  formatFileStatus(
    'Test design',
    status.files.testDesign,
    toPosixRelative(root, status.paths.testDesignPath),
  ),
);
console.log(
  formatFileStatus(
    'Validation',
    status.files.validation,
    toPosixRelative(root, status.paths.validationPath),
  ),
);
console.log(
  status.artifactScopeExists ? formatGateStatus(status.gate) : 'Gate for generator: BLOCKED',
);
if (status.nextAction) {
  console.log(`Next action: ${status.nextAction}`);
  console.log(`Next skill after action: ${status.nextSkillAfterAction ?? status.nextSkill}`);
} else {
  console.log(`Next skill: ${status.nextSkill}`);
}
console.log('Reasons:');
for (const reason of status.reasons) console.log(`- ${reason}`);

if (status.gate.errors.length) {
  console.log('\nGate errors:');
  for (const error of status.gate.errors) console.log(`- ${error}`);
}
if (status.gate.warnings.length) {
  console.log('\nGate warnings:');
  for (const warning of status.gate.warnings) console.log(`- ${warning}`);
}
