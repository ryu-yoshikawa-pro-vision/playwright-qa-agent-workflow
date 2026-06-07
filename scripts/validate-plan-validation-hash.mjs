#!/usr/bin/env node
import { parseArgs } from './workflow/paths.mjs';
import { validatePlanDesignGate } from './workflow/validation.mjs';

const args = parseArgs();
const feature = args.feature;
const strict = args.strict === true;
const result = validatePlanDesignGate({ root: process.cwd(), feature });

console.log(`Validation hash check: ${result.errors.length === 0 ? 'PASS' : 'FAIL'}`);
if (result.message) console.log(result.message);
else console.log(`Checked plans: ${result.plans.length}`);

if (result.warnings.length) {
  console.log('\nWarnings:');
  for (const warning of result.warnings) console.log(`- ${warning}`);
}

if (result.errors.length) {
  console.error('\nErrors:');
  for (const error of result.errors) console.error(`- ${error}`);
  process.exit(1);
}

if (strict && result.warnings.length) {
  console.error('\nStrict mode treats warnings as failures.');
  process.exit(1);
}
