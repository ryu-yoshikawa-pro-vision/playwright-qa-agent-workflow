import fs from 'node:fs';
import path from 'node:path';

export const FEATURE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseArgs(argv = process.argv.slice(2)) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) {
      parsed._.push(item);
      continue;
    }
    const eqIndex = item.indexOf('=');
    if (eqIndex > 0) {
      parsed[item.slice(2, eqIndex)] = item.slice(eqIndex + 1);
      continue;
    }
    const name = item.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      parsed[name] = next;
      index += 1;
    } else {
      parsed[name] = true;
    }
  }
  return parsed;
}

export function requireFeatureSlug(feature) {
  if (!feature || typeof feature !== 'string') {
    throw new Error('Missing required --feature <slug>.');
  }
  if (!FEATURE_SLUG_PATTERN.test(feature)) {
    throw new Error(
      `Invalid feature slug: ${feature}. Use lowercase kebab-case segments matching ${FEATURE_SLUG_PATTERN}.`,
    );
  }
  if (feature === 'service-exploration' || feature.startsWith('_')) {
    throw new Error(
      `Invalid feature slug: ${feature}. Reserved artifact scopes cannot be used as feature slugs.`,
    );
  }
  return feature;
}

export function repoPaths(root = process.cwd(), feature) {
  const paths = {
    root,
    artifactsDir: path.join(root, 'artifacts'),
    specsDir: path.join(root, 'specs'),
    reviewsDir: path.join(root, 'specs', '_reviews'),
    templatesDir: path.join(root, 'artifacts', '_templates'),
  };
  if (feature) {
    paths.feature = feature;
    paths.featureArtifactDir = path.join(paths.artifactsDir, feature);
    paths.runsDir = path.join(paths.featureArtifactDir, 'runs');
    paths.planPath = path.join(paths.specsDir, `${feature}.plan.md`);
    paths.testDesignPath = path.join(paths.specsDir, `${feature}.test-design.md`);
    paths.validationPath = path.join(paths.reviewsDir, `${feature}.validation.md`);
  }
  return paths;
}

export function toPosixRelative(root, filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, '/');
}

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeFileIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) return false;
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  return true;
}

export function readTemplate(root, relativeTemplatePath, fallback = '') {
  const templatePath = path.join(root, 'artifacts', '_templates', relativeTemplatePath);
  if (fs.existsSync(templatePath)) return fs.readFileSync(templatePath, 'utf8');
  return fallback;
}

export function nowRunId(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

export function listRunIds(runsDir) {
  if (!fs.existsSync(runsDir)) return [];
  return fs
    .readdirSync(runsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /^\d{8}-\d{6}$/.test(name))
    .sort();
}

export function latestRunId(runsDir) {
  const runIds = listRunIds(runsDir);
  return runIds.length ? runIds[runIds.length - 1] : null;
}
