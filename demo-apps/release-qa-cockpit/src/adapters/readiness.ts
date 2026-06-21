import type {
  ReadinessResult,
  ReadinessSnapshot,
  ReadinessDraftInput,
  TestItem,
  TestExecution,
  Defect,
  Risk,
  Decision,
} from '@/db/types';
import { db } from '@/db/schema';
import {
  calculateReadinessFromSnapshot,
  getLatestExecutionForItem,
  isUnresolvedBlockingDefect,
} from '@/domain/readiness';

const DEFAULT_DEMO_NOW = '2026-06-15T12:00:00.000Z';

const resolveDemoNow = (value: string | undefined | null): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : DEFAULT_DEMO_NOW;

const FALLBACK_APP_SETTINGS = {
  id: 'app-settings',
  demoMode: false,
  demoNow: DEFAULT_DEMO_NOW,
  schemaVersion: 1,
  updatedAt: new Date().toISOString(),
};

export async function calculatePersistedReadiness(releaseId: string): Promise<ReadinessResult> {
  const snapshot = await loadSnapshot(releaseId);
  return calculateReadinessFromSnapshot(snapshot);
}

export async function calculateReadinessPreview(
  releaseId: string,
  draftInput: ReadinessDraftInput,
): Promise<ReadinessResult> {
  const snapshot = await loadSnapshot(releaseId);
  return calculateReadinessFromSnapshot(snapshot, draftInput);
}

export type ReleaseReadinessSnapshot = {
  releaseId: string;
  testItems: TestItem[];
  testExecutions: TestExecution[];
  defects: Defect[];
  risks: Risk[];
  decisions: Decision[];
};

export type ReleaseSummary = {
  requiredTestItemCount: number;
  passedTestItemCount: number;
  failedOrBlockedTestItemCount: number;
  missingRequiredTestItemCount: number;
  unresolvedBlockingDefectCount: number;
  activeRiskCount: number;
  latestDecision: Decision | null;
};

export async function loadReleaseReadinessSnapshot(
  releaseId: string,
): Promise<ReleaseReadinessSnapshot> {
  const [testItems, testExecutions, defects, risks, decisions] = await Promise.all([
    db.testItems.where({ releaseId }).toArray(),
    db.testExecutions.where({ releaseId }).toArray(),
    db.defects.where({ releaseId }).toArray(),
    db.risks.where({ releaseId }).toArray(),
    db.decisions.where({ releaseId }).toArray(),
  ]);
  return { releaseId, testItems, testExecutions, defects, risks, decisions };
}

export function calculateReleaseSummaryFromSnapshot(
  snapshot: ReleaseReadinessSnapshot,
): ReleaseSummary {
  const { testItems, testExecutions, defects, risks, decisions } = snapshot;

  const requiredItems = testItems.filter((item) => item.required);

  let passedTestItemCount = 0;
  let failedOrBlockedTestItemCount = 0;
  let missingRequiredTestItemCount = 0;

  for (const item of requiredItems) {
    const latest = getLatestExecutionForItem(testExecutions, item.id);
    if (!latest) {
      missingRequiredTestItemCount++;
    } else if (latest.status === 'pass') {
      passedTestItemCount++;
    } else if (latest.status === 'fail' || latest.status === 'blocked') {
      failedOrBlockedTestItemCount++;
    }
  }

  const unresolvedBlockingDefectCount = defects.filter(isUnresolvedBlockingDefect).length;

  const activeRiskCount = risks.filter(
    (r) => r.status !== 'closed' && r.status !== 'mitigated',
  ).length;

  const latestDecision =
    [...decisions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;

  return {
    requiredTestItemCount: requiredItems.length,
    passedTestItemCount,
    failedOrBlockedTestItemCount,
    missingRequiredTestItemCount,
    unresolvedBlockingDefectCount,
    activeRiskCount,
    latestDecision,
  };
}

async function loadSnapshot(releaseId: string): Promise<ReadinessSnapshot> {
  const release = await db.releases.get(releaseId);
  if (!release) {
    throw new Error(`Release not found: ${releaseId}`);
  }

  const [testItems, testExecutions, defects, risks, decisions, evidenceItems, appSettings] =
    await Promise.all([
      db.testItems.where({ releaseId }).toArray(),
      db.testExecutions.where({ releaseId }).toArray(),
      db.defects.where({ releaseId }).toArray(),
      db.risks.where({ releaseId }).toArray(),
      db.decisions.where({ releaseId }).toArray(),
      db.evidenceItems.where({ releaseId }).toArray(),
      db.appSettings.get('app-settings'),
    ]);

  return {
    release,
    testItems,
    testExecutions,
    defects,
    risks,
    decisions,
    evidenceItems,
    appSettings: {
      ...FALLBACK_APP_SETTINGS,
      ...appSettings,
      demoNow: resolveDemoNow(appSettings?.demoNow),
    },
  };
}
