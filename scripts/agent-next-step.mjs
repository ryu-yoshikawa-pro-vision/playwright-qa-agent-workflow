#!/usr/bin/env node
import { parseArgs, requireFeatureSlug } from './workflow/paths.mjs';
import { getFeatureStatus } from './workflow/status.mjs';

const root = process.cwd();
const args = parseArgs();
let feature;
try {
  feature = requireFeatureSlug(args.feature);
} catch (error) {
  console.error(`agent:next: FAIL\n${error.message}`);
  process.exit(1);
}

const status = getFeatureStatus({ root, feature });
console.log('agent:next: PASS');
console.log(`Feature: ${feature}`);
if (status.nextAction) {
  console.log(`Next action: ${status.nextAction}`);
  console.log(`Next skill after action: ${status.nextSkillAfterAction ?? status.nextSkill}`);
} else {
  console.log(`Next skill: ${status.nextSkill}`);
}
console.log('Reasons:');
for (const reason of status.reasons) console.log(`- ${reason}`);
