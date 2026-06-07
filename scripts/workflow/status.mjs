import fs from 'node:fs';
import { latestRunId, repoPaths, toPosixRelative } from './paths.mjs';
import { validatePlanDesignGate } from './validation.mjs';

function fileState(filePath) {
  if (!fs.existsSync(filePath)) return { exists: false, size: 0 };
  const stat = fs.statSync(filePath);
  return { exists: stat.isFile(), size: stat.isFile() ? stat.size : 0 };
}

function dirState(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

export function getFeatureStatus({ root = process.cwd(), feature }) {
  const paths = repoPaths(root, feature);
  const latestRun = latestRunId(paths.runsDir);
  const plan = fileState(paths.planPath);
  const testDesign = fileState(paths.testDesignPath);
  const validation = fileState(paths.validationPath);
  const artifactScopeExists = dirState(paths.featureArtifactDir);
  const gate = validatePlanDesignGate({ root, feature });

  let nextAction = null;
  let nextSkill;
  let nextSkillAfterAction = null;
  const reasons = [];

  if (!artifactScopeExists) {
    nextAction = 'agent:init';
    nextSkill = 'playwright-test-planner';
    nextSkillAfterAction = 'playwright-test-planner';
    reasons.push(`missing ${toPosixRelative(root, paths.featureArtifactDir)}`);
    reasons.push(
      'run agent:init before using the planner so artifact and run directories are created consistently',
    );
  } else if (!plan.exists) {
    nextSkill = 'playwright-test-planner';
    reasons.push(`missing ${toPosixRelative(root, paths.planPath)}`);
  } else if (!testDesign.exists) {
    nextSkill = 'playwright-test-designer';
    reasons.push('plan exists');
    reasons.push(`missing ${toPosixRelative(root, paths.testDesignPath)}`);
  } else if (!validation.exists) {
    nextSkill = 'playwright-test-plan-validator';
    reasons.push('plan and test design exist');
    reasons.push(`missing ${toPosixRelative(root, paths.validationPath)}`);
  } else if (!gate.ok || gate.warnings.length > 0) {
    nextSkill = 'playwright-test-plan-validator';
    reasons.push('validation gate is not ready for generation');
    if (gate.errors.length) reasons.push(...gate.errors.slice(0, 5));
    if (!gate.errors.length && gate.warnings.length) reasons.push(...gate.warnings.slice(0, 5));
  } else {
    nextSkill = 'playwright-test-generator';
    reasons.push('plan exists');
    reasons.push('test design exists');
    reasons.push('validation gate passed');
  }

  return {
    feature,
    paths,
    artifactScopeExists,
    latestRun,
    files: { plan, testDesign, validation },
    gate,
    nextAction,
    nextSkill,
    nextSkillAfterAction,
    reasons,
  };
}

export function formatFileStatus(label, state, relativePath) {
  if (!state.exists) return `${label}: missing (${relativePath})`;
  return `${label}: exists (${relativePath}, ${state.size} bytes)`;
}

export function formatGateStatus(gate) {
  if (gate.ok && gate.warnings.length === 0) return 'Gate for generator: PASS';
  return 'Gate for generator: BLOCKED';
}
