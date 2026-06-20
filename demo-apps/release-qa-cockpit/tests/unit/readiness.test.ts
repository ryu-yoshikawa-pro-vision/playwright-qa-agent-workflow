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

function createReadySnapshot(): ReadinessSnapshot {
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
  return snapshot;
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
    const condition = result.unmetConditions.find((c) => c.id.startsWith('required-test-failed:'));
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
    const condition = result.unmetConditions.find((c) => c.id.startsWith('high-risk-unapproved:'));
    expect(condition).toBeDefined();
    expect(condition!.severity).toBe('blocker');
  });

  it('includes qa-completion-comment-missing condition', () => {
    const snapshot = buildSnapshot();
    const result = calculateReadinessFromSnapshot(snapshot);
    const condition = result.unmetConditions.find((c) => c.id === 'qa-completion-comment-missing');
    expect(condition).toBeDefined();
  });

  it('includes test-result-evidence-missing condition', () => {
    const snapshot = buildSnapshot();
    const result = calculateReadinessFromSnapshot(snapshot);
    const condition = result.unmetConditions.find((c) => c.id === 'test-result-evidence-missing');
    expect(condition).toBeDefined();
  });

  it('returns atRisk when only warnings exist', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? ('pass' as const) : te.status,
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
      status: te.id === 'exec-recording-playback' ? ('notStarted' as const) : te.status,
    }));
    const result = calculateReadinessFromSnapshot(snapshot);
    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id.startsWith('required-test-not-started:'))).toBe(
      true,
    );
  });

  it('returns notReady when required test is skipped without reason', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.id === 'exec-recording-playback' ? ('skipped' as const) : te.status,
      skipReason: undefined,
    }));
    const result = calculateReadinessFromSnapshot(snapshot);
    expect(result.readiness).toBe('notReady');
    expect(
      result.unmetConditions.some((c) => c.id.startsWith('required-test-skipped-without-reason:')),
    ).toBe(true);
  });

  it('returns atRisk when required test is skipped with reason and no blockers', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.id === 'exec-recording-playback' ? ('skipped' as const) : te.status,
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
      status: te.status === 'fail' ? ('pass' as const) : te.status,
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
      status: te.status === 'fail' ? ('pass' as const) : te.status,
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
      status: te.id === 'exec-recording-playback' ? ('retest' as const) : te.status,
    }));
    const result = calculateReadinessFromSnapshot(snapshot);
    expect(result.readiness).toBe('notReady');
    const retestCondition = result.unmetConditions.find((c) =>
      c.id.startsWith('required-test-retest:'),
    );
    expect(retestCondition).toBeDefined();
  });

  it('returns notReady when a required test item has no execution result', () => {
    const snapshot = createReadySnapshot();

    const requiredItem = snapshot.testItems.find((item) => item.required);
    expect(requiredItem).toBeDefined();

    const withoutRequiredExecution: ReadinessSnapshot = {
      ...snapshot,
      testExecutions: snapshot.testExecutions.filter(
        (execution) => execution.testItemId !== requiredItem!.id,
      ),
    };

    const result = calculateReadinessFromSnapshot(withoutRequiredExecution, {
      qaCompletionComment: 'QA completed successfully',
    });

    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: `required-test-execution-missing:${requiredItem!.id}`,
          severity: 'blocker',
          sourceType: 'testItem',
          sourceId: requiredItem!.id,
        }),
      ]),
    );
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

  it('uses latest execution when same testItemId has old fail and new pass', () => {
    const snapshot = createReadySnapshot();

    const requiredItem = snapshot.testItems.find((item) => item.required);
    expect(requiredItem).toBeDefined();
    const existingExec = snapshot.testExecutions.find((te) => te.testItemId === requiredItem!.id);
    expect(existingExec).toBeDefined();
    expect(existingExec!.status).toBe('pass');

    const oldFailExec = {
      ...existingExec!,
      id: 'exec-old-fail',
      status: 'fail' as const,
      completedAt: '2026-05-15T09:00:00.000Z',
    };

    snapshot.testExecutions = [...snapshot.testExecutions, oldFailExec];

    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed successfully',
    });

    expect(result.readiness).toBe('ready');
    expect(result.unmetConditions).toHaveLength(0);
  });

  it('uses latest execution when same testItemId has old pass and new fail', () => {
    const snapshot = createReadySnapshot();

    const requiredItem = snapshot.testItems.find((item) => item.required);
    expect(requiredItem).toBeDefined();
    const existingExec = snapshot.testExecutions.find((te) => te.testItemId === requiredItem!.id);
    expect(existingExec).toBeDefined();

    const oldPassExec = {
      ...existingExec!,
      id: 'exec-old-pass',
      status: 'pass' as const,
      completedAt: '2026-05-15T09:00:00.000Z',
    };

    const newFailExec = {
      ...existingExec!,
      id: 'exec-new-fail',
      status: 'fail' as const,
      completedAt: '2026-06-15T12:00:00.000Z',
    };

    snapshot.testExecutions = [
      ...snapshot.testExecutions.filter((te) => te.id !== existingExec!.id),
      oldPassExec,
      newFailExec,
    ];

    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      status: 'closed' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      status: 'closed' as const,
      mitigationNote: 'Risk mitigated',
    }));

    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed successfully',
    });

    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id.startsWith('required-test-failed:'))).toBe(true);
  });

  it('returns notReady when required test is in progress', () => {
    const snapshot = createReadySnapshot();

    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.id === 'exec-recording-playback' ? ('inProgress' as const) : te.status,
    }));

    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed',
    });

    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id.startsWith('required-test-in-progress:'))).toBe(
      true,
    );
  });

  it('returns notReady when required test is blocked', () => {
    const snapshot = createReadySnapshot();

    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.id === 'exec-recording-playback' ? ('blocked' as const) : te.status,
    }));

    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed',
    });

    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id.startsWith('required-test-blocked:'))).toBe(
      true,
    );
  });

  it('uses latest decision for QA completion comment', () => {
    const snapshot = createReadySnapshot();

    snapshot.decisions = [
      {
        id: 'dec-old',
        releaseId: snapshot.release.id,
        decision: 'notReady',
        qaCompletionComment: '',
        decisionComment: '',
        readinessSnapshot: {
          readiness: 'notReady',
          unmetConditions: [],
          warningConditions: [],
        },
        decidedByUserId: 'user-qa-lead',
        createdAt: '2026-06-01T09:00:00.000Z',
      },
      {
        id: 'dec-new',
        releaseId: snapshot.release.id,
        decision: 'ready',
        qaCompletionComment: 'QA completed successfully',
        decisionComment: 'All done',
        readinessSnapshot: {
          readiness: 'ready',
          unmetConditions: [],
          warningConditions: [],
        },
        decidedByUserId: 'user-qa-lead',
        createdAt: '2026-06-15T12:00:00.000Z',
      },
    ];

    const result = calculateReadinessFromSnapshot(snapshot);

    expect(result.readiness).toBe('ready');
    expect(result.unmetConditions.some((c) => c.id === 'qa-completion-comment-missing')).toBe(
      false,
    );
  });

  it('flags qa-completion-comment-missing when latest decision has empty comment', () => {
    const snapshot = createReadySnapshot();

    snapshot.decisions = [
      {
        id: 'dec-old',
        releaseId: snapshot.release.id,
        decision: 'ready',
        qaCompletionComment: 'QA completed',
        decisionComment: 'All done',
        readinessSnapshot: {
          readiness: 'ready',
          unmetConditions: [],
          warningConditions: [],
        },
        decidedByUserId: 'user-qa-lead',
        createdAt: '2026-06-01T09:00:00.000Z',
      },
      {
        id: 'dec-new',
        releaseId: snapshot.release.id,
        decision: 'notReady',
        qaCompletionComment: '',
        decisionComment: '',
        readinessSnapshot: {
          readiness: 'notReady',
          unmetConditions: [],
          warningConditions: [],
        },
        decidedByUserId: 'user-qa-lead',
        createdAt: '2026-06-15T12:00:00.000Z',
      },
    ];

    const result = calculateReadinessFromSnapshot(snapshot);

    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id === 'qa-completion-comment-missing')).toBe(true);
  });

  it('returns ready when no blockers and no warnings', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? ('pass' as const) : te.status,
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

  it('returns notReady for medium impacting blocking defect', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? ('pass' as const) : te.status,
    }));
    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      severity: 'medium' as const,
      impactsReleaseDecision: true,
      status: 'open' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      status: 'closed' as const,
      mitigationNote: 'Risk mitigated',
    }));
    snapshot.evidenceItems = [
      {
        id: 'ev-impacting-medium',
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
    expect(result.readiness).toBe('notReady');
    expect(
      result.unmetConditions.some((c) => c.id.startsWith('impacting-medium-low-blocking-defect:')),
    ).toBe(true);
  });

  it('returns notReady for high risk pending approval', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? ('pass' as const) : te.status,
    }));
    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      status: 'closed' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      status: 'pendingApproval' as const,
    }));
    snapshot.evidenceItems = [
      {
        id: 'ev-risk-pending',
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
    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id.startsWith('high-risk-unapproved:'))).toBe(true);
  });

  it('returns notReady for high risk rejected', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? ('pass' as const) : te.status,
    }));
    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      status: 'closed' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      status: 'rejected' as const,
      rejectedReason: 'Not acceptable',
    }));
    snapshot.evidenceItems = [
      {
        id: 'ev-risk-rejected',
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
    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id.startsWith('high-risk-unapproved:'))).toBe(true);
  });

  it('returns notReady for medium risk rejected', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? ('pass' as const) : te.status,
    }));
    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      status: 'closed' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      impact: 'medium' as const,
      status: 'rejected' as const,
      rejectedReason: 'Not acceptable',
    }));
    snapshot.evidenceItems = [
      {
        id: 'ev-medium-rejected',
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
    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id.startsWith('medium-risk-rejected:'))).toBe(true);
  });

  it('returns atRisk for medium risk accepted', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? ('pass' as const) : te.status,
    }));
    snapshot.defects = snapshot.defects.map((d) => ({
      ...d,
      status: 'closed' as const,
    }));
    snapshot.risks = snapshot.risks.map((r) => ({
      ...r,
      impact: 'medium' as const,
      status: 'accepted' as const,
      acceptedReason: 'Acceptable risk',
    }));
    snapshot.evidenceItems = [
      {
        id: 'ev-medium-accepted',
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
    expect(result.unmetConditions).toHaveLength(0);
    expect(
      result.warningConditions.some((c) => c.id.startsWith('medium-risk-open-or-accepted:')),
    ).toBe(true);
  });

  it('returns atRisk when qa-period-overdue with no blockers', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? ('pass' as const) : te.status,
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
        id: 'ev-overdue',
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
    snapshot.appSettings = {
      ...snapshot.appSettings,
      demoNow: '2026-07-15T12:00:00.000Z',
    };
    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed',
    });
    expect(result.readiness).toBe('atRisk');
    expect(result.unmetConditions).toHaveLength(0);
    expect(result.warningConditions.some((c) => c.id.startsWith('qa-period-overdue:'))).toBe(true);
  });

  it('does not flag qa-period-overdue when demoNow is before plannedEndDate', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? ('pass' as const) : te.status,
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
        id: 'ev-no-overdue',
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
    snapshot.appSettings = {
      ...snapshot.appSettings,
      demoNow: '2026-06-15T12:00:00.000Z',
    };
    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed',
    });
    expect(result.readiness).toBe('ready');
    expect(result.warningConditions.some((c) => c.id.startsWith('qa-period-overdue:'))).toBe(false);
  });

  it('handles timezone-aware dates for overdue comparison', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.status === 'fail' ? ('pass' as const) : te.status,
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
        id: 'ev-tz-overdue',
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
    snapshot.appSettings = {
      ...snapshot.appSettings,
      demoNow: '2026-07-01T12:00:00+09:00',
    };
    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed',
    });
    expect(result.warningConditions.some((c) => c.id.startsWith('qa-period-overdue:'))).toBe(true);
  });

  it('treats whitespace-only skipReason as blocker', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.id === 'exec-recording-playback' ? ('skipped' as const) : te.status,
      skipReason: te.id === 'exec-recording-playback' ? '   ' : undefined,
    }));
    const result = calculateReadinessFromSnapshot(snapshot);
    expect(result.readiness).toBe('notReady');
    expect(
      result.unmetConditions.some((c) => c.id.startsWith('required-test-skipped-without-reason:')),
    ).toBe(true);
  });

  it('treats whitespace-with-newline skipReason as blocker', () => {
    const snapshot = buildSnapshot();
    snapshot.testExecutions = snapshot.testExecutions.map((te) => ({
      ...te,
      status: te.id === 'exec-recording-playback' ? ('skipped' as const) : te.status,
      skipReason: te.id === 'exec-recording-playback' ? '\n\t' : undefined,
    }));
    const result = calculateReadinessFromSnapshot(snapshot);
    expect(result.readiness).toBe('notReady');
    expect(
      result.unmetConditions.some((c) => c.id.startsWith('required-test-skipped-without-reason:')),
    ).toBe(true);
  });

  it('treats whitespace-only qaCompletionComment as missing', () => {
    const snapshot = createReadySnapshot();
    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: '   ',
    });
    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id === 'qa-completion-comment-missing')).toBe(true);
  });

  it('treats whitespace-with-newline qaCompletionComment as missing', () => {
    const snapshot = createReadySnapshot();
    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: '\n\t',
    });
    expect(result.readiness).toBe('notReady');
    expect(result.unmetConditions.some((c) => c.id === 'qa-completion-comment-missing')).toBe(true);
  });

  it('uses timestamp comparison for latest execution when completedAt differs', () => {
    const snapshot = createReadySnapshot();
    const requiredItem = snapshot.testItems.find((item) => item.required);
    const existingExec = snapshot.testExecutions.find((te) => te.testItemId === requiredItem!.id);

    const oldFailExec = {
      ...existingExec!,
      id: 'exec-old-fail-ts',
      status: 'fail' as const,
      completedAt: '2026-05-15T09:00:00.000Z',
    };
    const newPassExec = {
      ...existingExec!,
      id: 'exec-new-pass-ts',
      status: 'pass' as const,
      completedAt: '2026-06-15T12:00:00.000Z',
    };

    snapshot.testExecutions = [
      ...snapshot.testExecutions.filter((te) => te.testItemId !== requiredItem!.id),
      oldFailExec,
      newPassExec,
    ];

    const result = calculateReadinessFromSnapshot(snapshot, {
      qaCompletionComment: 'QA completed',
    });
    expect(result.readiness).toBe('ready');
  });

  it('uses timestamp comparison for latest decision when createdAt differs', () => {
    const snapshot = createReadySnapshot();
    snapshot.decisions = [
      {
        id: 'dec-old-ts',
        releaseId: snapshot.release.id,
        decision: 'ready',
        qaCompletionComment: '',
        decisionComment: '',
        readinessSnapshot: { readiness: 'ready', unmetConditions: [], warningConditions: [] },
        decidedByUserId: 'user-qa-lead',
        createdAt: '2026-06-01T09:00:00.000Z',
      },
      {
        id: 'dec-new-ts',
        releaseId: snapshot.release.id,
        decision: 'ready',
        qaCompletionComment: 'QA completed successfully',
        decisionComment: 'All good',
        readinessSnapshot: { readiness: 'ready', unmetConditions: [], warningConditions: [] },
        decidedByUserId: 'user-qa-lead',
        createdAt: '2026-06-15T12:00:00.000Z',
      },
    ];

    const result = calculateReadinessFromSnapshot(snapshot);
    expect(result.readiness).toBe('ready');
    expect(result.unmetConditions.some((c) => c.id === 'qa-completion-comment-missing')).toBe(
      false,
    );
  });
});
