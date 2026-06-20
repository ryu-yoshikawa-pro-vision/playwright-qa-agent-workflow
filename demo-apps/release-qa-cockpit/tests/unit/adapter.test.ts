import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/schema';
import {
  calculatePersistedReadiness,
  calculateReadinessPreview,
} from '../../src/adapters/readiness';
import { clearDb, seedDb } from './helpers';

beforeEach(async () => {
  await clearDb();
  await seedDb();
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
    await expect(calculatePersistedReadiness('non-existent')).rejects.toThrow('Release not found');
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
    expect(
      result.unmetConditions.find((c) => c.id === 'qa-completion-comment-missing'),
    ).toBeDefined();

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

describe('calculateReadinessPreview adapter', () => {
  it('returns Not Ready without draft input', async () => {
    const result = await calculateReadinessPreview('rel-weekly-2026-06', {});
    expect(result.readiness).toBe('notReady');
  });

  it('resolves qa-completion-comment-missing with draft input', async () => {
    const result = await calculateReadinessPreview('rel-weekly-2026-06', {
      qaCompletionComment: 'Draft QA comment',
    });
    expect(result.readiness).toBe('notReady');
    const hasQaCondition = result.unmetConditions.some(
      (c) => c.id === 'qa-completion-comment-missing',
    );
    expect(hasQaCondition).toBe(false);
  });

  it('preview differs from persisted when draft input is provided', async () => {
    const persisted = await calculatePersistedReadiness('rel-weekly-2026-06');
    expect(persisted.unmetConditions.some((c) => c.id === 'qa-completion-comment-missing')).toBe(
      true,
    );

    const preview = await calculateReadinessPreview('rel-weekly-2026-06', {
      qaCompletionComment: 'Draft comment for preview test',
    });
    const hasQaCondition = preview.unmetConditions.some(
      (c) => c.id === 'qa-completion-comment-missing',
    );
    expect(hasQaCondition).toBe(false);
  });

  it('does not mutate IndexedDB', async () => {
    await calculateReadinessPreview('rel-weekly-2026-06', {
      qaCompletionComment: 'Should not persist',
    });

    const persisted = await calculatePersistedReadiness('rel-weekly-2026-06');
    expect(persisted.unmetConditions.some((c) => c.id === 'qa-completion-comment-missing')).toBe(
      true,
    );

    const decisions = await db.decisions.where({ releaseId: 'rel-weekly-2026-06' }).toArray();
    expect(decisions).toHaveLength(0);
  });
});

describe('loadSnapshot fallback', () => {
  it('returns Not Ready when appSettings is missing from IndexedDB', async () => {
    await db.appSettings.clear();
    const result = await calculatePersistedReadiness('rel-weekly-2026-06');
    expect(result.readiness).toBe('notReady');
  });

  it('fallback appSettings have default values when appSettings is missing', async () => {
    await db.appSettings.clear();
    const evItem = {
      id: 'ev-fallback',
      releaseId: 'rel-weekly-2026-06',
      type: 'testResult',
      title: 'Fallback test',
      contentMarkdown: 'evidence',
      sourceEntityType: 'testExecution',
      sourceEntityId: 'exec-recording-playback',
      createdByUserId: 'user-qa-lead',
      createdAt: '2026-06-15T12:00:00.000Z',
    };
    await db.evidenceItems.add(evItem);
    await db.testExecutions.update('exec-recording-playback', { status: 'pass' });
    await db.defects.update('defect-recording-playback-fails', { status: 'closed' });
    await db.risks.update('risk-recording-regression', {
      status: 'closed',
      mitigationNote: 'Resolved',
    });
    await db.decisions.add({
      id: 'dec-fallback',
      releaseId: 'rel-weekly-2026-06',
      decision: 'ready',
      qaCompletionComment: 'QA completed',
      decisionComment: 'All good',
      readinessSnapshot: { readiness: 'ready', unmetConditions: [], warningConditions: [] },
      decidedByUserId: 'user-qa-lead',
      createdAt: '2026-06-15T12:00:00.000Z',
    });

    const result = await calculatePersistedReadiness('rel-weekly-2026-06');
    expect(result.readiness).toBe('ready');
  });

  it('does not throw when appSettings is absent after reset', async () => {
    await db.appSettings.clear();
    await expect(calculatePersistedReadiness('rel-weekly-2026-06')).resolves.not.toThrow();
  });
});
