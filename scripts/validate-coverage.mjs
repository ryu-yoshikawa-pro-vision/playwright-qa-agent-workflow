#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { validatePlanDesignGate } from './workflow/validation.mjs';

const root = process.cwd();
const specsDir = path.join(root, 'specs');
const testsDir = path.join(root, 'tests');
const ignoredTestFeatures = new Set(['example']);
const requiredSections = [
  'Current status',
  'Coverage summary',
  'Implemented test mapping',
  'Explicitly not covered',
  'Current assertions policy',
  'Open questions affecting coverage',
  'Change history',
];
const unresolvedPlaceholderPattern = /\b(?:TBD|TODO)\b|<[^>]+>/i;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function featureRunPattern(feature) {
  return new RegExp(`artifacts/${escapeRegExp(feature)}/runs/\\d{8}-\\d{6}/?`, 'i');
}

function extractLastUpdatedByRun(coverage) {
  const match = coverage.match(/^-\s*Last updated by run:\s*`?([^`\r\n]+)`?/im);
  return match ? match[1].trim() : null;
}

function existsFile(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function listFiles(dirPath, suffix) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(suffix))
    .sort();
}

function stemFromSuffix(name, suffix) {
  return name.slice(0, -suffix.length);
}

function sectionBody(text, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i'));
  return match ? match[1].trim() : null;
}

function tableRows(markdownTableSection) {
  return markdownTableSection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && line.endsWith('|'));
}

function isSeparatorRow(row) {
  return /^\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(row);
}

function isHeaderRow(row) {
  const normalized = row.replace(/[`*]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  return (
    normalized.startsWith('| area |') ||
    normalized.startsWith('| test design id |') ||
    normalized.startsWith('| not covered |') ||
    normalized.startsWith('| area | current policy |') ||
    normalized.startsWith('| question |') ||
    normalized.startsWith('| date |')
  );
}

function dataRows(markdownTableSection) {
  return tableRows(markdownTableSection).filter((row) => !isSeparatorRow(row) && !isHeaderRow(row));
}

function meaningfulRows(markdownTableSection) {
  return dataRows(markdownTableSection).filter((row) => {
    const normalized = row.replace(/[|`\s]/g, '').toLowerCase();
    return normalized && normalized !== 'none' && !/^tbd+$/.test(normalized);
  });
}

function extractDesignIds(text) {
  return [...new Set(text.match(/\bTD-\d{3,}\b/g) ?? [])].sort();
}

function requireSectionRows({ coverage, heading, relativeCoverage, errors, allowNone = true }) {
  const body = sectionBody(coverage, heading);
  if (!body) return;
  const rows = dataRows(body);
  if (rows.length === 0) {
    errors.push(
      `Coverage ledger section "${heading}" must include at least one concrete table row${
        allowNone ? ' (use "None" as a row when nothing applies)' : ''
      }: ${relativeCoverage}`,
    );
  }
}

function validateConcreteChangeHistory({ coverage, feature, relativeCoverage, errors }) {
  const body = sectionBody(coverage, 'Change history');
  if (!body) return;

  const rows = dataRows(body);
  const expectedRunPattern = featureRunPattern(feature);
  const runLinkedRows = rows.filter((row) => expectedRunPattern.test(row));

  if (runLinkedRows.length === 0) {
    errors.push(
      `Coverage ledger Change history must include at least one concrete row linked to artifacts/${feature}/runs/<run-id>/ and must not use None-only or another feature's run history: ${relativeCoverage}`,
    );
  }
}

function requirePassingValidationGate({ root, feature, relativeCoverage, errors }) {
  const gate = validatePlanDesignGate({ root, feature });

  for (const error of gate.errors) {
    errors.push(
      `Coverage ledger requires a valid PASS validation gate for implemented feature ${feature}: ${error}`,
    );
  }

  for (const warning of gate.warnings) {
    errors.push(
      `Coverage ledger requires validation PASS before implementation is treated as current in ${relativeCoverage}: ${warning}`,
    );
  }
}

function validateCoverage(feature, errors, warnings) {
  const coveragePath = path.join(specsDir, `${feature}.coverage.md`);
  const planPath = path.join(specsDir, `${feature}.plan.md`);
  const designPath = path.join(specsDir, `${feature}.test-design.md`);
  const validationPath = path.join(specsDir, '_reviews', `${feature}.validation.md`);
  const testPath = path.join(testsDir, `${feature}.spec.ts`);
  const relativeCoverage = `specs/${feature}.coverage.md`;
  const relativePlan = `specs/${feature}.plan.md`;
  const relativeDesign = `specs/${feature}.test-design.md`;
  const relativeValidation = `specs/_reviews/${feature}.validation.md`;
  const relativeTest = `tests/${feature}.spec.ts`;

  if (!existsFile(coveragePath)) {
    errors.push(`Missing coverage ledger for implemented feature ${feature}: ${relativeCoverage}`);
    return;
  }

  if (!existsFile(testPath)) {
    errors.push(`Coverage ledger exists but implementation is missing: ${relativeTest}`);
  }

  if (!existsFile(planPath)) {
    errors.push(`Coverage ledger exists but feature plan is missing: ${relativePlan}`);
  }

  if (!existsFile(validationPath)) {
    errors.push(`Coverage ledger exists but validation report is missing: ${relativeValidation}`);
  }

  if (existsFile(planPath) && existsFile(designPath) && existsFile(validationPath)) {
    requirePassingValidationGate({ root, feature, relativeCoverage, errors });
  }

  const coverage = fs.readFileSync(coveragePath, 'utf8');
  if (unresolvedPlaceholderPattern.test(coverage)) {
    errors.push(
      `Coverage ledger contains unresolved placeholders such as TBD, TODO, or <...>: ${relativeCoverage}`,
    );
  }

  for (const heading of requiredSections) {
    if (!coverage.match(new RegExp(`##\\s+${heading}\\b`, 'i'))) {
      errors.push(`Coverage ledger missing section "${heading}": ${relativeCoverage}`);
    }
  }

  if (!coverage.includes(relativeTest)) {
    errors.push(
      `Coverage ledger must reference implementation path ${relativeTest}: ${relativeCoverage}`,
    );
  }

  const lastUpdatedByRun = extractLastUpdatedByRun(coverage);
  const expectedRunPattern = featureRunPattern(feature);
  if (!lastUpdatedByRun) {
    errors.push(`Coverage ledger missing concrete Last updated by run value: ${relativeCoverage}`);
  } else if (!expectedRunPattern.test(lastUpdatedByRun)) {
    errors.push(
      `Coverage ledger Last updated by run must point to artifacts/${feature}/runs/<run-id>/, not another feature's run: ${relativeCoverage}`,
    );
  }

  requireSectionRows({
    coverage,
    heading: 'Coverage summary',
    relativeCoverage,
    errors,
    allowNone: false,
  });
  requireSectionRows({
    coverage,
    heading: 'Implemented test mapping',
    relativeCoverage,
    errors,
    allowNone: false,
  });
  requireSectionRows({
    coverage,
    heading: 'Explicitly not covered',
    relativeCoverage,
    errors,
  });
  requireSectionRows({
    coverage,
    heading: 'Current assertions policy',
    relativeCoverage,
    errors,
  });
  requireSectionRows({
    coverage,
    heading: 'Open questions affecting coverage',
    relativeCoverage,
    errors,
  });
  requireSectionRows({
    coverage,
    heading: 'Change history',
    relativeCoverage,
    errors,
    allowNone: false,
  });
  validateConcreteChangeHistory({ coverage, feature, relativeCoverage, errors });

  const mapping = sectionBody(coverage, 'Implemented test mapping');
  if (!mapping || meaningfulRows(mapping).length === 0) {
    errors.push(`Coverage ledger has no implemented test mapping rows: ${relativeCoverage}`);
  }

  const assertionsPolicy = sectionBody(coverage, 'Current assertions policy');
  if (!assertionsPolicy || dataRows(assertionsPolicy).length === 0) {
    errors.push(
      `Coverage ledger must explicitly state assertion policies or "None" as a table row: ${relativeCoverage}`,
    );
  }

  if (!existsFile(designPath)) {
    errors.push(`Coverage ledger exists but test design is missing: ${relativeDesign}`);
    return;
  }

  const design = fs.readFileSync(designPath, 'utf8');
  const referencedDesignIds = extractDesignIds(coverage);
  if (referencedDesignIds.length === 0) {
    errors.push(`Coverage ledger references no TD-* design IDs: ${relativeCoverage}`);
  }

  for (const id of referencedDesignIds) {
    if (!design.includes(id)) {
      errors.push(`Coverage ledger references ${id}, but it is not present in ${relativeDesign}`);
    }
  }

  if (existsFile(testPath)) {
    const testStat = fs.statSync(testPath);
    const coverageStat = fs.statSync(coveragePath);
    if (testStat.mtimeMs > coverageStat.mtimeMs + 1000) {
      warnings.push(
        `Coverage ledger may be stale because ${relativeTest} is newer than ${relativeCoverage}`,
      );
    }
  }
}

const errors = [];
const warnings = [];
const candidateFeatures = new Set();

for (const testName of listFiles(testsDir, '.spec.ts')) {
  const feature = stemFromSuffix(testName, '.spec.ts');
  if (ignoredTestFeatures.has(feature)) continue;
  candidateFeatures.add(feature);
}

for (const coverageName of listFiles(specsDir, '.coverage.md')) {
  candidateFeatures.add(stemFromSuffix(coverageName, '.coverage.md'));
}

for (const feature of [...candidateFeatures].sort()) validateCoverage(feature, errors, warnings);

if (errors.length === 0) {
  console.log('Coverage ledger check: PASS');
  if (candidateFeatures.size === 0)
    console.log('No implemented feature coverage ledgers found yet.');
} else {
  console.error('Coverage ledger check: FAIL');
  for (const error of errors) console.error(`- ${error}`);
}

if (warnings.length) {
  console.log('Warnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}

process.exit(errors.length === 0 ? 0 : 1);
