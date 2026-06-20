import { describe, it, expect } from 'vitest';
import { calculateReadinessFromSnapshot } from '../../src/domain/readiness';
import { getSeedData } from '../../src/stores/seed';
import type { ReadinessSnapshot } from '../../src/db/types';

function buildSnapshot(): ReadinessSnapshot {
  const seed = getSeedData();
  return {
    release: seed.releases[0],
    testItems: seed.testItems,
    testExecutions: seed.testExecutions,
    defects: seed.defects,
    risks: seed.risks,
    decisions: [],
    evidenceItems: [],
    appSettings: seed.appSettings[0],
  };
}

describe('calculateReadinessFromSnapshot', () => {
  it('returns notReady for default seed data', () => {
    const snapshot = buildSnapshot();
    const result = calculateReadinessFromSnapshot(snapshot);
    expect(result.readiness).toBe('notReady');
  });

  it('includes required-test-failed condition', () => {
    const snapshot = buildSnapshot();
    const result = calculateReadinessFromSnapshot(snapshot);
    const condition = result.unmetConditions.find((c) =>
      c.id.startsWith('required-test-failed:'),
    );
    expect(condition).toBeDefined();
    expect(condition!.severity).toBe('blocker');
  });

  it('includes critical-high-blocking-defect condition', () => {
    const snapshot = buildSnapshot();
    const result = calculateReadinessFromSnapshot(snapshot);
    const condition = result.unmetConditions.find((c) =>
      c.id.startsWith('critical-high-blocking-defect:'),
    );
    expect(condition).toBeDefined();
    expect(condition!.severity).toBe('blocker');
  });

  it('includes high-risk-unapproved condition', () => {
    const snapshot = buildSnapshot();
    const result = calculateReadinessFromSnapshot(snapshot);
    const condition = result.unmetConditions.find((c) =>
      c.id.startsWith('high-risk-unapproved:'),
    );
    expect(condition).toBeDefined();
    expect(condition!.severity).toBe('blocker');
  });

  it('includes qa-completion-comment-missing condition', () => {
    const snapshot = buildSnapshot();
    const result = calculateReadinessFromSnapshot(snapshot);
    const condition = result.unmetConditions.find(
      (c) => c.id === 'qa-completion-comment-missing',
    );
    expect(condition).toBeDefined();
  });

  it('includes test-result-evidence-missing condition', () => {
    const snapshot = buildSnapshot();
    const result = calculateReadinessFromSnapshot(snapshot);
    const condition = result.unmetConditions.find(
      (c) => c.id === 'test-result-evidence-missing',
    );
    expect(condition).toBeDefined();
  });

  it('returns atRisk when only warnings exist', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? 'pass' as const : te.status,
    }));
    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      status: 'closed' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      status: 'accepted' as const,
      acceptedReason: 'Acceptable risk',
    }));
    snapshot.evidenceItems = [
      {
        id: 'ev-test-1',
        releaseId: snapshot.release.id,
        type: 'testResult',
        title: 'Test evidence',
        contentMarkdown: 'All tests passed',
        sourceEntityType: 'testExecution',
        sourceEntityId: snapshot.testExecutions[0].id,
        createdByUserId: 'user-qa-lead',
        createdAt: '2026-06-15T12:00:00.000Z',
      },
    ];

    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed',
    });
    expect(result.readiness).toBe('atRisk');
    expect(result.unmetConditions).toHaveLength(0);
    expect(result.warningConditions.length).toBeGreaterThan(0);
  });

  it('returns notReady when required test is not started', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.id === 'exec-recording-playback' ? 'notStarted' as const : te.status,
    }));
    const result = calculateReadinessFromSnapshot(snapshot);
    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id.startsWith('required-test-not-started:'))).toBe(true);
  });

  it('returns notReady when required test is skipped without reason', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.id === 'exec-recording-playback' ? 'skipped' as const : te.status,
      skipReason: undefined,
    }));
    const result = calculateReadinessFromSnapshot(snapshot);
    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id.startsWith('required-test-skipped-without-reason:'))).toBe(true);
  });

  it('returns atRisk when required test is skipped with reason and no blockers', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.id === 'exec-recording-playback' ? 'skipped' as const : te.status,
      skipReason: te.id === 'exec-recording-playback' ? 'Infrastructure unavailable' : undefined,
    }));
    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      status: 'closed' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      status: 'closed' as const,
      mitigationNote: 'Mitigated',
    }));
    snapshot.evidenceItems = [
      {
        id: 'ev-test-skip',
        releaseId: snapshot.release.id,
        type: 'testResult',
        title: 'Test evidence',
        contentMarkdown: 'Passed other tests',
        sourceEntityType: 'testExecution',
        sourceEntityId: snapshot.testExecutions[0].id,
        createdByUserId: 'user-qa-lead',
        createdAt: '2026-06-15T12:00:00.000Z',
      },
    ];
    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed',
    });
    expect(result.readiness).toBe('atRisk');
    expect(result.unmetConditions).toHaveLength(0);
    const skipWarning = result.warningConditions.find((c) =>
      c.id.startsWith('required-test-skipped-with-reason:'),
    );
    expect(skipWarning).toBeDefined();
  });

  it('returns atRisk when non-impacting medium/low blocking defect exists', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? 'pass' as const : te.status,
    }));
    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      severity: 'medium' as const,
      impactsReleaseDecision: false,
      status: 'open' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      status: 'closed' as const,
      mitigationNote: 'Mitigated',
    }));
    snapshot.evidenceItems = [
      {
        id: 'ev-test-medium',
        releaseId: snapshot.release.id,
        type: 'testResult',
        title: 'Test evidence',
        contentMarkdown: 'Passed',
        sourceEntityType: 'testExecution',
        sourceEntityId: snapshot.testExecutions[0].id,
        createdByUserId: 'user-qa-lead',
        createdAt: '2026-06-15T12:00:00.000Z',
      },
    ];
    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed',
    });
    expect(result.readiness).toBe('atRisk');
    const defectWarning = result.warningConditions.find((c) =>
      c.id.startsWith('medium-low-blocking-defect:'),
    );
    expect(defectWarning).toBeDefined();
  });

  it('returns notReady when only manualNote evidence exists', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? 'pass' as const : te.status,
    }));
    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      status: 'closed' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      status: 'closed' as const,
      mitigationNote: 'Mitigated',
    }));
    snapshot.evidenceItems = [
      {
        id: 'ev-manual-note',
        releaseId: snapshot.release.id,
        type: 'manualNote',
        title: 'Manual note',
        contentMarkdown: 'Reviewed manually',
        sourceEntityType: 'release',
        sourceEntityId: snapshot.release.id,
        createdByUserId: 'user-qa-lead',
        createdAt: '2026-06-15T12:00:00.000Z',
      },
    ];
    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed',
    });
    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id === 'test-result-evidence-missing')).toBe(true);
  });

  it('returns notReady when required test execution is retest', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.id === 'exec-recording-playback' ? 'retest' as const : te.status,
    }));
    const result = calculateReadinessFromSnapshot(snapshot);
    expect(result.readiness).toBe('notReady');
    const retestCondition = result.unmetConditions.find((c) =>
      c.id.startsWith('required-test-retest:'),
    );
    expect(retestCondition).toBeDefined();
  });

  it('returns notReady when no test executions exist', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = [];
    const result = calculateReadinessFromSnapshot(snapshot);
    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.length).toBeGreaterThan(0);
  });

  it('ready only when all required test executions are pass', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: 'pass' as const,
    }));
    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      status: 'closed' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      status: 'closed' as const,
      mitigationNote: 'Risk mitigated',
    }));
    snapshot.evidenceItems = [
      {
        id: 'ev-test-ready',
        releaseId: snapshot.release.id,
        type: 'testResult',
        title: 'Test evidence',
        contentMarkdown: 'All tests passed',
        sourceEntityType: 'testExecution',
        sourceEntityId: snapshot.testExecutions[0].id,
        createdByUserId: 'user-qa-lead',
        createdAt: '2026-06-15T12:00:00.000Z',
      },
    ];

    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed successfully',
    });
    expect(result.readiness).toBe('ready');
    expect(result.unmetConditions).toHaveLength(0);
    expect(result.warningConditions).toHaveLength(0);
  });

  it('returns ready when no blockers and no warnings', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? 'pass' as const : te.status,
    }));
    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      status: 'closed' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      status: 'closed' as const,
      mitigationNote: 'Risk mitigated',
    }));
    snapshot.evidenceItems = [
      {
        id: 'ev-test-1',
        releaseId: snapshot.release.id,
        type: 'testResult',
        title: 'Test evidence',
        contentMarkdown: 'All tests passed',
        sourceEntityType: 'testExecution',
        sourceEntityId: snapshot.testExecutions[0].id,
        createdByUserId: 'user-qa-lead',
        createdAt: '2026-06-15T12:00:00.000Z',
      },
    ];

    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed successfully',
    });
    expect(result.readiness).toBe('ready');
    expect(result.unmetConditions).toHaveLength(0);
    expect(result.warningConditions).toHaveLength(0);
  });
});
