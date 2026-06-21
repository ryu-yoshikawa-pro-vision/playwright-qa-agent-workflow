import type {
  ReadinessSnapshot,
  ReadinessResult,
  ReadinessCondition,
  ReadinessDraftInput,
  Defect,
  EvidenceItem,
  TestExecution,
  Decision,
} from '@/db/types';
import { unresolvedBlockingDefectStatuses } from '@/db/types';

const isBlank = (value: string | undefined | null): boolean =>
  value == null || value.trim().length === 0;

const toTimestamp = (value: string | undefined | null): number => {
  if (value == null) return Number.NaN;
  return Date.parse(value);
};

const compareDateDesc = (a: string | undefined | null, b: string | undefined | null): number => {
  const aTime = toTimestamp(a);
  const bTime = toTimestamp(b);

  if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
  if (Number.isNaN(aTime)) return 1;
  if (Number.isNaN(bTime)) return -1;

  return bTime - aTime;
};

const isAfter = (left: string | undefined | null, right: string | undefined | null): boolean => {
  const leftTime = toTimestamp(left);
  const rightTime = toTimestamp(right);

  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return false;

  return leftTime > rightTime;
};

export function isUnresolvedBlockingDefect(defect: Defect): boolean {
  const statusBlocking = (unresolvedBlockingDefectStatuses as readonly string[]).includes(
    defect.status,
  );
  const severityBlocking = defect.severity === 'critical' || defect.severity === 'high';
  const impactsBlocking = defect.impactsReleaseDecision;
  return statusBlocking && (severityBlocking || impactsBlocking);
}

function isUnresolvedNonImpactingDefect(defect: Defect): boolean {
  const statusBlocking = (unresolvedBlockingDefectStatuses as readonly string[]).includes(
    defect.status,
  );
  const severityLow = defect.severity === 'medium' || defect.severity === 'low';
  return statusBlocking && severityLow && !defect.impactsReleaseDecision;
}

function hasTestResultEvidence(evidenceItems: EvidenceItem[]): boolean {
  return evidenceItems.some((item) => item.type === 'testResult');
}

function getEffectiveNow(snapshot: ReadinessSnapshot): string | undefined {
  return snapshot.appSettings.demoNow;
}

export function getLatestExecutionForItem(
  executions: TestExecution[],
  testItemId: string,
): TestExecution | undefined {
  return executions
    .filter((execution) => execution.testItemId === testItemId)
    .sort((a, b) => {
      const aTime = a.completedAt ?? a.updatedAt;
      const bTime = b.completedAt ?? b.updatedAt;
      return compareDateDesc(aTime, bTime);
    })[0];
}

function getLatestDecision(decisions: Decision[]): Decision | undefined {
  return [...decisions].sort((a, b) => {
    return compareDateDesc(a.createdAt, b.createdAt);
  })[0];
}

export function calculateReadinessFromSnapshot(
  snapshot: ReadinessSnapshot,
  draftInput?: ReadinessDraftInput,
): ReadinessResult {
  const unmetConditions: ReadinessCondition[] = [];
  const warningConditions: ReadinessCondition[] = [];

  const { testItems, testExecutions, defects, risks, evidenceItems, release, decisions } = snapshot;

  const requiredTestItems = testItems.filter((ti) => ti.required);

  for (const requiredItem of requiredTestItems) {
    const execution = getLatestExecutionForItem(testExecutions, requiredItem.id);

    if (!execution) {
      unmetConditions.push({
        id: `required-test-execution-missing:${requiredItem.id}`,
        severity: 'blocker',
        message: `Required test "${requiredItem.title}" has no execution result.`,
        sourceType: 'testItem',
        sourceId: requiredItem.id,
      });
      continue;
    }

    if (execution.status === 'pass') {
      continue;
    }

    if (execution.status === 'notStarted') {
      unmetConditions.push({
        id: `required-test-not-started:${execution.id}`,
        severity: 'blocker',
        message: `Required test "${requiredItem.title}" is not started.`,
        sourceType: 'testExecution',
        sourceId: execution.id,
      });
    } else if (execution.status === 'inProgress') {
      unmetConditions.push({
        id: `required-test-in-progress:${execution.id}`,
        severity: 'blocker',
        message: `Required test "${requiredItem.title}" is in progress.`,
        sourceType: 'testExecution',
        sourceId: execution.id,
      });
    } else if (execution.status === 'fail') {
      unmetConditions.push({
        id: `required-test-failed:${execution.id}`,
        severity: 'blocker',
        message: `Required test "${requiredItem.title}" failed.`,
        sourceType: 'testExecution',
        sourceId: execution.id,
      });
    } else if (execution.status === 'blocked') {
      unmetConditions.push({
        id: `required-test-blocked:${execution.id}`,
        severity: 'blocker',
        message: `Required test "${requiredItem.title}" is blocked.`,
        sourceType: 'testExecution',
        sourceId: execution.id,
      });
    } else if (execution.status === 'retest') {
      unmetConditions.push({
        id: `required-test-retest:${execution.id}`,
        severity: 'blocker',
        message: `Required test "${requiredItem.title}" is being retested.`,
        sourceType: 'testExecution',
        sourceId: execution.id,
      });
    } else if (execution.status === 'skipped') {
      if (isBlank(execution.skipReason)) {
        unmetConditions.push({
          id: `required-test-skipped-without-reason:${execution.id}`,
          severity: 'blocker',
          message: `Required test "${requiredItem.title}" is skipped without a reason.`,
          sourceType: 'testExecution',
          sourceId: execution.id,
        });
      } else {
        warningConditions.push({
          id: `required-test-skipped-with-reason:${execution.id}`,
          severity: 'warning',
          message: `Required test "${requiredItem.title}" is skipped with reason.`,
          sourceType: 'testExecution',
          sourceId: execution.id,
        });
      }
    }
  }

  for (const defect of defects) {
    if (isUnresolvedBlockingDefect(defect)) {
      if (defect.severity === 'critical' || defect.severity === 'high') {
        unmetConditions.push({
          id: `critical-high-blocking-defect:${defect.id}`,
          severity: 'blocker',
          message: `${defect.severity === 'critical' ? 'Critical' : 'High'} severity defect "${defect.title}" is unresolved.`,
          sourceType: 'defect',
          sourceId: defect.id,
        });
      } else {
        unmetConditions.push({
          id: `impacting-medium-low-blocking-defect:${defect.id}`,
          severity: 'blocker',
          message: `${defect.severity === 'medium' ? 'Medium' : 'Low'} severity defect "${defect.title}" impacts release decision and is unresolved.`,
          sourceType: 'defect',
          sourceId: defect.id,
        });
      }
    }
  }

  for (const defect of defects) {
    if (isUnresolvedNonImpactingDefect(defect)) {
      warningConditions.push({
        id: `medium-low-blocking-defect:${defect.id}`,
        severity: 'warning',
        message: `${defect.severity === 'medium' ? 'Medium' : 'Low'} severity defect "${defect.title}" is unresolved but does not impact release decision.`,
        sourceType: 'defect',
        sourceId: defect.id,
      });
    }
  }

  for (const risk of risks) {
    if (risk.impact === 'high') {
      if (
        risk.status === 'draft' ||
        risk.status === 'pendingApproval' ||
        risk.status === 'rejected'
      ) {
        const statusLabel =
          risk.status === 'draft'
            ? 'in draft'
            : risk.status === 'pendingApproval'
              ? 'pending approval'
              : 'rejected';
        unmetConditions.push({
          id: `high-risk-unapproved:${risk.id}`,
          severity: 'blocker',
          message: `High impact risk "${risk.title}" is ${statusLabel}.`,
          sourceType: 'risk',
          sourceId: risk.id,
        });
      }
    }

    if (risk.impact === 'medium') {
      if (risk.status === 'rejected') {
        unmetConditions.push({
          id: `medium-risk-rejected:${risk.id}`,
          severity: 'blocker',
          message: `Medium impact risk "${risk.title}" is rejected.`,
          sourceType: 'risk',
          sourceId: risk.id,
        });
      }
    }

    if (risk.impact === 'high' && risk.status === 'accepted') {
      warningConditions.push({
        id: `high-risk-accepted:${risk.id}`,
        severity: 'warning',
        message: `High impact risk "${risk.title}" is accepted.`,
        sourceType: 'risk',
        sourceId: risk.id,
      });
    }

    if (
      risk.impact === 'medium' &&
      (risk.status === 'draft' || risk.status === 'pendingApproval' || risk.status === 'accepted')
    ) {
      warningConditions.push({
        id: `medium-risk-open-or-accepted:${risk.id}`,
        severity: 'warning',
        message: `Medium impact risk "${risk.title}" is ${risk.status
          .replace(/([A-Z])/g, ' $1')
          .toLowerCase()
          .trim()}.`,
        sourceType: 'risk',
        sourceId: risk.id,
      });
    }

    if (risk.impact === 'low') {
      if (risk.status === 'pendingApproval' || risk.status === 'rejected') {
        warningConditions.push({
          id: `low-risk-pending-or-rejected:${risk.id}`,
          severity: 'warning',
          message: `Low impact risk "${risk.title}" is ${risk.status === 'pendingApproval' ? 'pending approval' : 'rejected'}.`,
          sourceType: 'risk',
          sourceId: risk.id,
        });
      }
    }
  }

  const now = getEffectiveNow(snapshot);
  if (
    !isBlank(now) &&
    isAfter(now, release.plannedEndDate) &&
    release.status !== 'decided' &&
    release.status !== 'archived'
  ) {
    warningConditions.push({
      id: `qa-period-overdue:${release.id}`,
      severity: 'warning',
      message: `QA period is overdue. Planned end date was ${release.plannedEndDate}.`,
      sourceType: 'schedule',
      sourceId: release.id,
    });
  }

  for (const defect of defects) {
    if (defect.status === 'wontFix' && defect.linkedTestExecutionId) {
      const linkedRisk = risks.find(
        (r) => r.linkedDefectId === defect.id && r.status === 'accepted',
      );
      if (linkedRisk) {
        warningConditions.push({
          id: `wont-fix-risk-accepted:${defect.id}`,
          severity: 'warning',
          message: `Defect "${defect.title}" is wontFix but linked risk "${linkedRisk.title}" is accepted.`,
          sourceType: 'risk',
          sourceId: linkedRisk.id,
        });
      }
    }
  }

  const latestDecision = getLatestDecision(decisions);
  const qaComment = draftInput?.qaCompletionComment ?? latestDecision?.qaCompletionComment ?? '';
  if (isBlank(qaComment)) {
    unmetConditions.push({
      id: 'qa-completion-comment-missing',
      severity: 'blocker',
      message: 'QA completion comment is missing.',
      sourceType: 'decision',
    });
  }

  if (!hasTestResultEvidence(evidenceItems)) {
    unmetConditions.push({
      id: 'test-result-evidence-missing',
      severity: 'blocker',
      message: 'Test Result evidence is missing.',
      sourceType: 'evidence',
    });
  }

  if (unmetConditions.length > 0) {
    return { readiness: 'notReady', unmetConditions, warningConditions };
  }

  if (warningConditions.length > 0) {
    return { readiness: 'atRisk', unmetConditions, warningConditions };
  }

  return { readiness: 'ready', unmetConditions, warningConditions };
}
