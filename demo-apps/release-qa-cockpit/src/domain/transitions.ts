import type { DefectStatus, RiskStatus, TestExecutionStatus } from '@/db/types';

export const testExecutionAllowedTransitions: Record<TestExecutionStatus, TestExecutionStatus[]> = {
  notStarted: ['inProgress', 'skipped'],
  inProgress: ['pass', 'fail', 'blocked'],
  pass: [],
  fail: ['retest'],
  blocked: ['inProgress'],
  skipped: ['inProgress'],
  retest: ['pass', 'fail'],
};

export const defectAllowedTransitions = {
  open: ['triaged', 'duplicate', 'wontFix'],
  triaged: ['inProgress', 'wontFix'],
  inProgress: ['fixed'],
  fixed: ['readyForRetest', 'reopened'],
  readyForRetest: ['closed', 'reopened'],
  reopened: ['inProgress'],
  closed: ['reopened'],
  wontFix: ['reopened'],
  duplicate: ['reopened'],
} satisfies Record<DefectStatus, DefectStatus[]>;

export const riskAllowedTransitions = {
  draft: ['pendingApproval', 'mitigated'],
  pendingApproval: ['accepted', 'rejected'],
  accepted: ['closed', 'mitigated'],
  rejected: ['pendingApproval'],
  mitigated: ['closed'],
  closed: [],
} satisfies Record<RiskStatus, RiskStatus[]>;

type EntityType = 'testExecution' | 'defect' | 'risk';

export function isTransitionAllowed<T extends string>(entity: EntityType, from: T, to: T): boolean {
  if (entity === 'testExecution') {
    const map = testExecutionAllowedTransitions as Record<string, string[]>;
    const allowed = map[from];
    return allowed ? allowed.includes(to) : false;
  }
  if (entity === 'defect') {
    const allowed = defectAllowedTransitions[from as DefectStatus];
    return allowed ? allowed.includes(to as DefectStatus) : false;
  }
  if (entity === 'risk') {
    const allowed = riskAllowedTransitions[from as RiskStatus];
    return allowed ? allowed.includes(to as RiskStatus) : false;
  }
  return false;
}

export function getRequiredReasonField(
  entity: EntityType,
  currentStatus: string,
  toStatus: string,
): string | null {
  if (entity === 'testExecution') {
    if (toStatus === 'skipped') return 'skipReason';
    if (toStatus === 'blocked') return 'blockedReason';
    return null;
  }
  if (entity === 'defect') {
    if (toStatus === 'duplicate' || toStatus === 'wontFix') return 'resolutionNote';
    if (currentStatus === 'closed' && toStatus === 'reopened') return 'resolutionNote';
    if (currentStatus === 'wontFix' && toStatus === 'reopened') return 'resolutionNote';
    if (currentStatus === 'duplicate' && toStatus === 'reopened') return 'resolutionNote';
    return null;
  }
  if (entity === 'risk') {
    if (toStatus === 'accepted') return 'acceptedReason';
    if (toStatus === 'rejected') return 'rejectedReason';
    if (toStatus === 'mitigated') return 'mitigationNote';
    return null;
  }
  return null;
}

export function getTransitionAction(entity: EntityType, toStatus: string): string {
  if (entity === 'testExecution') {
    const actionMap: Record<string, string> = {
      inProgress: 'test.execution.started',
      pass: 'test.execution.passed',
      fail: 'test.execution.failed',
      blocked: 'test.execution.blocked',
      skipped: 'test.execution.skipped',
      retest: 'test.execution.retest',
    };
    return actionMap[toStatus] ?? `test.execution.updated`;
  }
  if (entity === 'defect') {
    const actionMap: Record<string, string> = {
      triaged: 'defect.triaged',
      inProgress: 'defect.inProgress',
      fixed: 'defect.fixed',
      readyForRetest: 'defect.readyForRetest',
      closed: 'defect.closed',
      reopened: 'defect.reopened',
      wontFix: 'defect.wontFix',
      duplicate: 'defect.duplicate',
    };
    return actionMap[toStatus] ?? `defect.updated`;
  }
  if (entity === 'risk') {
    const actionMap: Record<string, string> = {
      pendingApproval: 'risk.submitted',
      accepted: 'risk.accepted',
      rejected: 'risk.rejected',
      mitigated: 'risk.mitigated',
      closed: 'risk.closed',
    };
    return actionMap[toStatus] ?? `risk.updated`;
  }
  return `${entity}.updated`;
}

export function getTransitionLabel(entity: EntityType, toStatus: string, title: string): string {
  if (entity === 'testExecution') {
    const labelMap: Record<string, string> = {
      inProgress: `Start test ${title}`,
      pass: `Mark test ${title} as passed`,
      fail: `Mark test ${title} as failed`,
      blocked: `Block test ${title}`,
      skipped: `Skip test ${title}`,
      retest: `Move test ${title} to retest`,
    };
    return labelMap[toStatus] ?? `Update test ${title}`;
  }
  if (entity === 'defect') {
    const labelMap: Record<string, string> = {
      triaged: `Move defect ${title} to Triaged`,
      inProgress: `Move defect ${title} to In Progress`,
      fixed: `Move defect ${title} to Fixed`,
      readyForRetest: `Move defect ${title} to Ready for Retest`,
      closed: `Close defect ${title}`,
      reopened: `Reopen defect ${title}`,
      wontFix: `Mark defect ${title} as Won't Fix`,
      duplicate: `Mark defect ${title} as Duplicate`,
    };
    return labelMap[toStatus] ?? `Update defect ${title}`;
  }
  if (entity === 'risk') {
    const labelMap: Record<string, string> = {
      pendingApproval: `Submit risk ${title} for approval`,
      accepted: `Accept risk ${title}`,
      rejected: `Reject risk ${title}`,
      mitigated: `Mitigate risk ${title}`,
      closed: `Close risk ${title}`,
    };
    return labelMap[toStatus] ?? `Update risk ${title}`;
  }
  return `Update ${title}`;
}

export function getFieldLabel(field: string): string {
  const labelMap: Record<string, string> = {
    skipReason: 'Skip reason',
    blockedReason: 'Blocked reason',
    resolutionNote: 'Resolution note',
    acceptedReason: 'Accepted reason',
    rejectedReason: 'Rejected reason',
    mitigationNote: 'Mitigation note',
    resultNote: 'Result note',
  };
  return labelMap[field] ?? field;
}
