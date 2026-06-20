import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../src/db/schema';
import { getSeedData } from '../../src/stores/seed';
import { calculatePersistedReadiness } from '../../src/adapters/readiness';

beforeAll(async () => {
  const seed = getSeedData();
  await db.transaction('rw', db.tables, async () => {
    await db.users.bulkAdd(seed.users);
    await db.sessions.bulkAdd(seed.sessions);
    await db.releases.bulkAdd(seed.releases);
    await db.releaseScopes.bulkAdd(seed.releaseScopes);
    await db.testItems.bulkAdd(seed.testItems);
    await db.testExecutions.bulkAdd(seed.testExecutions);
    await db.defects.bulkAdd(seed.defects);
    await db.risks.bulkAdd(seed.risks);
    await db.decisions.bulkAdd(seed.decisions);
    await db.evidenceItems.bulkAdd(seed.evidenceItems);
    await db.activityLogs.bulkAdd(seed.activityLogs);
    await db.demoScenarios.bulkAdd(seed.demoScenarios);
    await db.appSettings.bulkAdd(seed.appSettings);
  });
});

describe('calculatePersistedReadiness adapter', () => {
  it('loads seed data from IndexedDB and returns Not Ready', async () => {
    const result = await calculatePersistedReadiness('rel-weekly-2026-06');
    expect(result.readiness).toBe('notReady');
  });

  it('includes the same conditions as the pure function', async () => {
    const result = await calculatePersistedReadiness('rel-weekly-2026-06');
    const conditionIds = result.unmetConditions.map((c) => c.id);
    expect(conditionIds).toContain('required-test-failed:exec-recording-playback');
    expect(conditionIds).toContain('critical-high-blocking-defect:defect-recording-playback-fails');
    expect(conditionIds).toContain('high-risk-unapproved:risk-recording-regression');
    expect(conditionIds).toContain('qa-completion-comment-missing');
    expect(conditionIds).toContain('test-result-evidence-missing');
  });

  it('throws for non-existent release', async () => {
    await expect(calculatePersistedReadiness('non-existent')).rejects.toThrow(
      'Release not found',
    );
  });

  it('reflects status changes after IndexedDB mutation', async () => {
    await db.testExecutions.update('exec-recording-playback', { status: 'pass' });
    await db.defects.update('defect-recording-playback-fails', { status: 'closed' });
    await db.risks.update('risk-recording-regression', {
      status: 'closed',
      mitigationNote: 'Resolved',
    });
    await db.evidenceItems.add({
      id: 'ev-test-adapter',
      releaseId: 'rel-weekly-2026-06',
      type: 'testResult',
      title: 'Evidence from adapter test',
      contentMarkdown: 'Test passed',
      sourceEntityType: 'testExecution',
      sourceEntityId: 'exec-recording-playback',
      createdByUserId: 'user-qa-lead',
      createdAt: '2026-06-15T12:00:00.000Z',
    });

    const result = await calculatePersistedReadiness('rel-weekly-2026-06');
    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.find((c) => c.id === 'qa-completion-comment-missing')).toBeDefined();

    await db.decisions.add({
      id: 'dec-test-1',
      releaseId: 'rel-weekly-2026-06',
      decision: 'ready',
      qaCompletionComment: 'QA completed',
      decisionComment: 'All good',
      readinessSnapshot: { readiness: 'ready', unmetConditions: [], warningConditions: [] },
      decidedByUserId: 'user-qa-lead',
      createdAt: '2026-06-15T12:00:00.000Z',
    });

    const result2 = await calculatePersistedReadiness('rel-weekly-2026-06');
    expect(result2.readiness).toBe('ready');
  });
});
