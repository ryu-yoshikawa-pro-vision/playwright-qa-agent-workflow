import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/schema';
import type { ReadinessSnapshot } from '../../src/db/types';
import {
  calculatePersistedReadiness,
  calculateReadinessPreview,
  calculateReleaseSummaryFromReadinessSnapshot,
} from '../../src/adapters/readiness';
import { clearDb, seedDb } from './helpers';

const EMPTY_SNAPSHOT_BASE: Omit<
  ReadinessSnapshot,
  'testItems' | 'testExecutions' | 'defects' | 'risks' | 'decisions'
> = {
  release: {
    id: 'test-rel',
    name: 'Test Release',
    version: '1.0.0',
    status: 'inQa',
    plannedStartDate: '2026-06-01T00:00:00.000Z',
    plannedEndDate: '2026-06-30T23:59:59.000Z',
    createdAt: '',
    updatedAt: '',
  },
  evidenceItems: [],
  appSettings: {
    id: 'app-settings',
    demoMode: false,
    schemaVersion: 1,
    updatedAt: '',
  },
};

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

  it('provides demoNow fallback when appSettings is missing', async () => {
    await db.appSettings.clear();
    const persisted = await calculatePersistedReadiness('rel-weekly-2026-06');
    expect(persisted.unmetConditions.some((c) => c.id === 'test-result-evidence-missing')).toBe(
      true,
    );
  });

  it('provides demoNow fallback when appSettings exists but demoNow is absent', async () => {
    await db.appSettings.put({
      id: 'app-settings',
      demoMode: true,
      schemaVersion: 1,
      updatedAt: '2026-06-15T12:00:00.000Z',
    });

    const result = await calculatePersistedReadiness('rel-weekly-2026-06');
    expect(result.readiness).toBe('notReady');
  });

  it('falls back to default demoNow when persisted demoNow is blank', async () => {
    await db.appSettings.put({
      id: 'app-settings',
      demoMode: true,
      demoNow: '   ',
      schemaVersion: 1,
      updatedAt: '2026-06-15T12:00:00.000Z',
    });

    await db.releases.update('rel-weekly-2026-06', {
      plannedEndDate: '2026-06-01T23:59:59.000Z',
    });
    await db.testExecutions.update('exec-recording-playback', { status: 'pass' });
    await db.defects.update('defect-recording-playback-fails', { status: 'closed' });
    await db.risks.update('risk-recording-regression', {
      status: 'closed',
      mitigationNote: 'Resolved',
    });
    await db.evidenceItems.add({
      id: 'ev-blank-demo',
      releaseId: 'rel-weekly-2026-06',
      type: 'testResult',
      title: 'Test evidence',
      contentMarkdown: 'Passed',
      sourceEntityType: 'testExecution',
      sourceEntityId: 'exec-recording-playback',
      createdByUserId: 'user-qa-lead',
      createdAt: '2026-06-15T12:00:00.000Z',
    });
    await db.decisions.add({
      id: 'dec-blank-demo',
      releaseId: 'rel-weekly-2026-06',
      decision: 'ready',
      qaCompletionComment: 'QA completed',
      decisionComment: 'All good',
      readinessSnapshot: { readiness: 'ready', unmetConditions: [], warningConditions: [] },
      decidedByUserId: 'user-qa-lead',
      createdAt: '2026-06-15T12:00:00.000Z',
    });

    const result = await calculatePersistedReadiness('rel-weekly-2026-06');
    expect(result.warningConditions.some((c) => c.id.startsWith('qa-period-overdue:'))).toBe(true);
  });

  describe('calculateReleaseSummaryFromReadinessSnapshot', () => {
    it('counts only the latest execution per test item (old fail + latest pass = pass)', () => {
      const snapshot: ReadinessSnapshot = {
        ...EMPTY_SNAPSHOT_BASE,
        testItems: [
          {
            id: 'ti-1',
            releaseId: 'test-rel',
            title: 'Test recording',
            area: 'Recording',
            priority: 'high',
            required: true,
            expectedBehavior: 'Works',
            createdAt: '',
            updatedAt: '',
          },
        ],
        testExecutions: [
          {
            id: 'exec-old',
            releaseId: 'test-rel',
            testItemId: 'ti-1',
            status: 'fail',
            updatedAt: '2026-06-01T00:00:00.000Z',
          },
          {
            id: 'exec-latest',
            releaseId: 'test-rel',
            testItemId: 'ti-1',
            status: 'pass',
            completedAt: '2026-06-02T00:00:00.000Z',
            updatedAt: '2026-06-02T00:00:00.000Z',
          },
        ],
        defects: [],
        risks: [],
        decisions: [],
      };

      const result = calculateReleaseSummaryFromReadinessSnapshot(snapshot);
      expect(result.passedTestItemCount).toBe(1);
      expect(result.failedOrBlockedTestItemCount).toBe(0);
      expect(result.missingRequiredTestItemCount).toBe(0);
    });

    it('counts required test items without executions as missing', () => {
      const snapshot: ReadinessSnapshot = {
        ...EMPTY_SNAPSHOT_BASE,
        testItems: [
          {
            id: 'ti-missing',
            releaseId: 'test-rel',
            title: 'Missing test',
            area: 'Test',
            priority: 'high',
            required: true,
            expectedBehavior: 'Should exist',
            createdAt: '',
            updatedAt: '',
          },
        ],
        testExecutions: [],
        defects: [],
        risks: [],
        decisions: [],
      };

      const result = calculateReleaseSummaryFromReadinessSnapshot(snapshot);
      expect(result.missingRequiredTestItemCount).toBe(1);
      expect(result.passedTestItemCount).toBe(0);
      expect(result.failedOrBlockedTestItemCount).toBe(0);
      expect(result.requiredTestItemCount).toBe(1);
    });

    it('counts unresolved blocking defects only', () => {
      const snapshot: ReadinessSnapshot = {
        ...EMPTY_SNAPSHOT_BASE,
        testItems: [],
        testExecutions: [],
        defects: [
          {
            id: 'def-open',
            releaseId: 'test-rel',
            title: 'Open critical defect',
            description: '',
            severity: 'critical',
            status: 'open',
            impactsReleaseDecision: true,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 'def-closed',
            releaseId: 'test-rel',
            title: 'Closed defect',
            description: '',
            severity: 'high',
            status: 'closed',
            impactsReleaseDecision: true,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 'def-low-no-impact',
            releaseId: 'test-rel',
            title: 'Low non-impacting',
            description: '',
            severity: 'low',
            status: 'open',
            impactsReleaseDecision: false,
            createdAt: '',
            updatedAt: '',
          },
        ],
        risks: [],
        decisions: [],
      };

      const result = calculateReleaseSummaryFromReadinessSnapshot(snapshot);
      expect(result.unresolvedBlockingDefectCount).toBe(1);
    });

    it('excludes closed and mitigated risks from active risk count', () => {
      const snapshot: ReadinessSnapshot = {
        ...EMPTY_SNAPSHOT_BASE,
        testItems: [],
        testExecutions: [],
        defects: [],
        risks: [
          {
            id: 'risk-open',
            releaseId: 'test-rel',
            title: 'Open risk',
            description: '',
            impact: 'high',
            status: 'draft',
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 'risk-closed',
            releaseId: 'test-rel',
            title: 'Closed risk',
            description: '',
            impact: 'medium',
            status: 'closed',
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 'risk-mitigated',
            releaseId: 'test-rel',
            title: 'Mitigated risk',
            description: '',
            impact: 'low',
            status: 'mitigated',
            mitigationNote: 'Done',
            createdAt: '',
            updatedAt: '',
          },
        ],
        decisions: [],
      };

      const result = calculateReleaseSummaryFromReadinessSnapshot(snapshot);
      expect(result.activeRiskCount).toBe(1);
    });

    it('returns the latest decision by createdAt without mutating the original array', () => {
      const decisions = [
        {
          id: 'dec-old',
          releaseId: 'test-rel',
          decision: 'notReady' as const,
          qaCompletionComment: 'Old decision',
          decisionComment: 'Not ready',
          readinessSnapshot: {
            readiness: 'notReady' as const,
            unmetConditions: [],
            warningConditions: [],
          },
          decidedByUserId: 'user-1',
          createdAt: '2026-06-01T00:00:00.000Z',
        },
        {
          id: 'dec-latest',
          releaseId: 'test-rel',
          decision: 'ready' as const,
          qaCompletionComment: 'Latest decision',
          decisionComment: 'All good',
          readinessSnapshot: {
            readiness: 'ready' as const,
            unmetConditions: [],
            warningConditions: [],
          },
          decidedByUserId: 'user-2',
          createdAt: '2026-06-15T00:00:00.000Z',
        },
      ];

      const snapshot: ReadinessSnapshot = {
        ...EMPTY_SNAPSHOT_BASE,
        testItems: [],
        testExecutions: [],
        defects: [],
        risks: [],
        decisions,
      };

      const result = calculateReleaseSummaryFromReadinessSnapshot(snapshot);
      expect(result.latestDecision?.id).toBe('dec-latest');
      expect(result.latestDecision?.decision).toBe('ready');

      expect(decisions[0].id).toBe('dec-old');
      expect(decisions[1].id).toBe('dec-latest');
    });

    it('returns null for latestDecision when decisions array is empty', () => {
      const snapshot: ReadinessSnapshot = {
        ...EMPTY_SNAPSHOT_BASE,
        testItems: [],
        testExecutions: [],
        defects: [],
        risks: [],
        decisions: [],
      };

      const result = calculateReleaseSummaryFromReadinessSnapshot(snapshot);
      expect(result.latestDecision).toBeNull();
    });
  });

  it('uses fallback demoNow for overdue detection', async () => {
    await db.appSettings.clear();
    await db.releases.update('rel-weekly-2026-06', {
      plannedEndDate: '2026-06-01T23:59:59.000Z',
    });

    await db.testExecutions.update('exec-recording-playback', { status: 'pass' });
    await db.defects.update('defect-recording-playback-fails', { status: 'closed' });
    await db.risks.update('risk-recording-regression', {
      status: 'closed',
      mitigationNote: 'Resolved',
    });
    await db.evidenceItems.add({
      id: 'ev-overdue-fallback',
      releaseId: 'rel-weekly-2026-06',
      type: 'testResult',
      title: 'Test evidence',
      contentMarkdown: 'Passed',
      sourceEntityType: 'testExecution',
      sourceEntityId: 'exec-recording-playback',
      createdByUserId: 'user-qa-lead',
      createdAt: '2026-06-15T12:00:00.000Z',
    });
    await db.decisions.add({
      id: 'dec-overdue-fallback',
      releaseId: 'rel-weekly-2026-06',
      decision: 'ready',
      qaCompletionComment: 'QA completed',
      decisionComment: 'All good',
      readinessSnapshot: { readiness: 'ready', unmetConditions: [], warningConditions: [] },
      decidedByUserId: 'user-qa-lead',
      createdAt: '2026-06-15T12:00:00.000Z',
    });

    const result = await calculatePersistedReadiness('rel-weekly-2026-06');
    expect(result.warningConditions.some((c) => c.id.startsWith('qa-period-overdue:'))).toBe(true);
  });
});
