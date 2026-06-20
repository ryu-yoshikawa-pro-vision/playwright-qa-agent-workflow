import type { ReadinessResult, ReadinessSnapshot, ReadinessDraftInput } from '@/db/types';
import { db } from '@/db/schema';
import { calculateReadinessFromSnapshot } from '@/domain/readiness';

export async function calculatePersistedReadiness(
  releaseId: string,
): Promise<ReadinessResult> {
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
    appSettings: appSettings ?? {
      id: 'app-settings',
      demoMode: false,
      schemaVersion: 1,
      demoNow: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}
