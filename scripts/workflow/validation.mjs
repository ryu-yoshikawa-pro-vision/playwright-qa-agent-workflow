import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const decisionValuePattern = '(PASS|FAIL|BLOCKED)';
const unresolvedDecisionPlaceholderLinePattern = /^\s*-?\s*(?:[A-Za-z ]+\s+)?Decision:\s*`?\s*PASS\s*\|\s*FAIL\s*\|\s*BLOCKED\s*`?\s*$/i;

export function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

export function collectUnresolvedDecisionPlaceholders(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => unresolvedDecisionPlaceholderLinePattern.test(line));
}

function decisionLineRegex(label = 'Decision') {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\n)\\s*-?\\s*${escapedLabel}:\\s*` + '`?' + `\\s*${decisionValuePattern}\\s*` + '`?' + `\\s*(?=\\n|$)`, 'i');
}

export function extractStrictDecisionLine(text, label = 'Decision') {
  const match = text.match(decisionLineRegex(label));
  return match ? match[1].toUpperCase() : null;
}

export function extractHash(text, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`${escapedLabel}:\\s*` + '`?' + `([a-fA-F0-9]{64})` + '`?', 'i'));
  return match ? match[1].toLowerCase() : null;
}

export function extractOverallDecision(text) {
  const sourceMetadata = text.match(/##\s*Source metadata\s*\n([\s\S]*?)(?=\n##\s+|$)/i);
  if (sourceMetadata) {
    const metadataDecision = extractStrictDecisionLine(sourceMetadata[1], 'Decision');
    if (metadataDecision) return metadataDecision;
  }

  const beforeReviews = text.split(/\n##\s*(Semantic Quality Review|Test Design Quality Review)\b/i)[0];
  const metadataDecision = extractStrictDecisionLine(beforeReviews, 'Decision');
  if (metadataDecision) return metadataDecision;

  const headingDecision = beforeReviews.match(/##\s*Decision\s*\n+\s*`?\s*(PASS|FAIL|BLOCKED)\s*`?\s*(?=\n|$)/i);
  if (headingDecision) return headingDecision[1].toUpperCase();
  return null;
}

export function extractDecisionSection(text, heading) {
  const sectionMatch = text.match(new RegExp(`##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i'));
  if (!sectionMatch) return null;
  return extractStrictDecisionLine(sectionMatch[1], 'Decision');
}

export function extractSubsectionDecisions(text, reviewHeading, stopHeading) {
  const reviewMatch = text.match(new RegExp(`##\\s*${reviewHeading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s*${stopHeading}\\b|\\n##\\s+|$)`, 'i'));
  if (!reviewMatch) return null;
  const decisions = [];
  const subsectionRegex = /###\s+[^\n]+\n([\s\S]*?)(?=\n###\s+|$)/gi;
  let match;
  while ((match = subsectionRegex.exec(reviewMatch[1])) !== null) {
    const decision = extractStrictDecisionLine(match[1], 'Decision');
    if (decision) decisions.push(decision);
  }
  return decisions;
}

export function planStem(planName) {
  return planName.endsWith('.plan.md') ? planName.slice(0, -'.plan.md'.length) : planName.replace(/\.md$/, '');
}

export function listPlanNames(root, feature) {
  const specsDir = path.join(root, 'specs');
  const errors = [];
  if (!fs.existsSync(specsDir)) return { plans: [], errors };

  let plans = fs.readdirSync(specsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith('.plan.md'));

  if (feature) {
    const expected = feature.endsWith('.plan.md') ? feature : `${feature}.plan.md`;
    plans = plans.filter((name) => name === expected);
    if (plans.length === 0) errors.push(`Specified feature plan not found: specs/${expected}`);
  }
  return { plans, errors };
}

export function validatePlanDesignGate({ root = process.cwd(), feature } = {}) {
  const specsDir = path.join(root, 'specs');
  const reviewsDir = path.join(specsDir, '_reviews');
  const errors = [];
  const warnings = [];
  const checked = [];

  const listed = listPlanNames(root, feature);
  errors.push(...listed.errors);
  const plans = listed.plans;

  if (!fs.existsSync(specsDir)) {
    return { ok: true, errors, warnings, checked, plans, message: 'No specs/ directory exists yet.' };
  }

  if (plans.length === 0 && errors.length === 0) {
    return { ok: true, errors, warnings, checked, plans, message: 'No specs/*.plan.md files found yet.' };
  }

  for (const planName of plans) {
    const stem = planStem(planName);
    const planPath = path.join(specsDir, planName);
    const designPath = path.join(specsDir, `${stem}.test-design.md`);
    const validationPath = path.join(reviewsDir, `${stem}.validation.md`);
    const relativePlan = `specs/${planName}`;
    const relativeDesign = `specs/${stem}.test-design.md`;
    const relativeValidation = `specs/_reviews/${stem}.validation.md`;
    checked.push(relativePlan, relativeDesign, relativeValidation);

    if (!fs.existsSync(designPath)) {
      errors.push(`Missing test design for ${relativePlan}: ${relativeDesign}`);
      continue;
    }

    if (!fs.existsSync(validationPath)) {
      errors.push(`Missing validation report for ${relativePlan}: ${relativeValidation}`);
      continue;
    }

    const report = fs.readFileSync(validationPath, 'utf8');
    const unresolvedDecisionPlaceholders = collectUnresolvedDecisionPlaceholders(report);
    if (unresolvedDecisionPlaceholders.length > 0) {
      errors.push(`Validation report contains unresolved PASS/FAIL/BLOCKED decision placeholder(s) in ${relativeValidation}: ${unresolvedDecisionPlaceholders.join(' ; ')}`);
    }

    const recordedPlanHash = extractHash(report, 'Plan SHA-256');
    const recordedDesignHash = extractHash(report, 'Test design SHA-256');
    const decision = extractOverallDecision(report);
    const semanticDecision = extractDecisionSection(report, 'Semantic Review Decision');
    const testDesignDecision = extractDecisionSection(report, 'Test Design Review Decision');
    const semanticSubsectionDecisions = extractSubsectionDecisions(report, 'Semantic Quality Review', 'Semantic Review Decision');
    const testDesignSubsectionDecisions = extractSubsectionDecisions(report, 'Test Design Quality Review', 'Test Design Review Decision');
    const currentPlanHash = sha256(planPath);
    const currentDesignHash = sha256(designPath);

    if (!recordedPlanHash) {
      errors.push(`Validation report missing Plan SHA-256: ${relativeValidation}`);
    } else if (recordedPlanHash !== currentPlanHash) {
      errors.push(`Plan hash mismatch for ${relativePlan}: current ${currentPlanHash}, validation report ${recordedPlanHash}`);
    }

    if (!recordedDesignHash) {
      errors.push(`Validation report missing Test design SHA-256: ${relativeValidation}`);
    } else if (recordedDesignHash !== currentDesignHash) {
      errors.push(`Test design hash mismatch for ${relativeDesign}: current ${currentDesignHash}, validation report ${recordedDesignHash}`);
    }

    if (!decision) {
      errors.push(`Validation report missing overall Decision PASS/FAIL/BLOCKED: ${relativeValidation}`);
    } else if (decision !== 'PASS') {
      warnings.push(`Validation decision for ${relativePlan} is ${decision}. Generator must not run until PASS.`);
    }

    if (!report.match(/##\s*Semantic Quality Review\b/i)) {
      errors.push(`Validation report missing Semantic Quality Review section: ${relativeValidation}`);
    }

    if (!semanticSubsectionDecisions) {
      errors.push(`Validation report missing semantic subsection decisions: ${relativeValidation}`);
    } else {
      if (semanticSubsectionDecisions.length < 6) {
        errors.push(`Validation report must include six semantic subsection decisions for ${relativeValidation}; found ${semanticSubsectionDecisions.length}`);
      }
      if (decision === 'PASS') {
        const nonPass = semanticSubsectionDecisions.filter((item) => item !== 'PASS');
        if (nonPass.length > 0) {
          errors.push(`Overall PASS is invalid because semantic subsections include non-PASS decisions in ${relativeValidation}: ${nonPass.join(', ')}`);
        }
      }
    }

    if (!semanticDecision) {
      errors.push(`Validation report missing Semantic Review Decision: ${relativeValidation}`);
    } else if (decision === 'PASS' && semanticDecision !== 'PASS') {
      errors.push(`Overall PASS is invalid because Semantic Review Decision is ${semanticDecision}: ${relativeValidation}`);
    } else if (semanticDecision !== 'PASS') {
      warnings.push(`Semantic Review Decision for ${relativePlan} is ${semanticDecision}. Generator must not run until PASS.`);
    }

    if (!report.match(/##\s*Test Design Quality Review\b/i)) {
      errors.push(`Validation report missing Test Design Quality Review section: ${relativeValidation}`);
    }

    if (!testDesignSubsectionDecisions) {
      errors.push(`Validation report missing test design subsection decisions: ${relativeValidation}`);
    } else {
      if (testDesignSubsectionDecisions.length < 6) {
        errors.push(`Validation report must include six test design subsection decisions for ${relativeValidation}; found ${testDesignSubsectionDecisions.length}`);
      }
      if (decision === 'PASS') {
        const nonPass = testDesignSubsectionDecisions.filter((item) => item !== 'PASS');
        if (nonPass.length > 0) {
          errors.push(`Overall PASS is invalid because test design subsections include non-PASS decisions in ${relativeValidation}: ${nonPass.join(', ')}`);
        }
      }
    }

    if (!testDesignDecision) {
      errors.push(`Validation report missing Test Design Review Decision: ${relativeValidation}`);
    } else if (decision === 'PASS' && testDesignDecision !== 'PASS') {
      errors.push(`Overall PASS is invalid because Test Design Review Decision is ${testDesignDecision}: ${relativeValidation}`);
    } else if (testDesignDecision !== 'PASS') {
      warnings.push(`Test Design Review Decision for ${relativeDesign} is ${testDesignDecision}. Generator must not run until PASS.`);
    }
  }

  return { ok: errors.length === 0, errors, warnings, checked, plans };
}
