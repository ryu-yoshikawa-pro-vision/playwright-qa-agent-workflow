#!/usr/bin/env node
import { parseArgs, requireFeatureSlug } from './workflow/paths.mjs';
import { getFeatureStatus } from './workflow/status.mjs';

const root = process.cwd();
const args = parseArgs();
let feature;
try {
  feature = requireFeatureSlug(args.feature);
} catch (error) {
  console.error(`agent:gate: FAIL\n${error.message}`);
  process.exit(1);
}

const target = typeof args.for === 'string' ? args.for : 'generator';
if (target !== 'generator') {
  console.error(`agent:gate: FAIL\nUnsupported gate target: ${target}. Currently supported: generator.`);
  process.exit(1);
}

const status = getFeatureStatus({ root, feature });
const pass = status.artifactScopeExists && status.gate.ok && status.gate.warnings.length === 0;
console.log(`agent:gate: ${pass ? 'PASS' : 'BLOCKED'}`);
console.log(`Feature: ${feature}`);
console.log('Gate target: generator');
if (status.nextAction) {
  console.log(`Next action: ${status.nextAction}`);
  console.log(`Next skill after action: ${status.nextSkillAfterAction ?? status.nextSkill}`);
} else {
  console.log(`Next skill: ${status.nextSkill}`);
}

if (!pass) {
  console.log('\nReasons:');
  const reasons = [
    ...(status.artifactScopeExists ? [] : [`missing artifact scope: artifacts/${feature}. Run agent:init before generator gate checks.`]),
    ...status.gate.errors,
    ...status.gate.warnings,
  ];
  if (reasons.length === 0) {
    for (const reason of status.reasons) console.log(`- ${reason}`);
  } else {
    for (const reason of reasons) console.log(`- ${reason}`);
  }
  process.exit(1);
}

console.log('Reasons:');
console.log('- plan exists');
console.log('- test design exists');
console.log('- validation report exists');
console.log('- Plan SHA-256 matches');
console.log('- Test design SHA-256 matches');
console.log('- Decision, Semantic Review Decision, and Test Design Review Decision are PASS');
