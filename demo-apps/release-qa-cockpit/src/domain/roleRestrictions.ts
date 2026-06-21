import type { DefectStatus, RiskStatus, UserRole } from '@/db/types';

export function canViewScreen(_userRole: UserRole): boolean {
  return true;
}

export function canMutateTestExecution(userRole: UserRole): boolean {
  return userRole === 'qaLead' || userRole === 'qaMember';
}

const memberAllowedDefectTransitions: Record<DefectStatus, DefectStatus[]> = {
  open: ['triaged'],
  triaged: ['inProgress'],
  inProgress: ['fixed'],
  fixed: ['readyForRetest'],
  readyForRetest: ['reopened'],
  reopened: [],
  closed: [],
  wontFix: [],
  duplicate: [],
};

const leadDefectTransitions: Record<DefectStatus, DefectStatus[]> = {
  open: ['triaged', 'duplicate', 'wontFix'],
  triaged: ['inProgress', 'wontFix'],
  inProgress: ['fixed'],
  fixed: ['readyForRetest', 'reopened'],
  readyForRetest: ['closed', 'reopened'],
  reopened: ['inProgress'],
  closed: ['reopened'],
  wontFix: ['reopened'],
  duplicate: ['reopened'],
};

export function canMutateDefect(
  userRole: UserRole,
  fromStatus: DefectStatus,
  toStatus: DefectStatus,
): boolean {
  if (userRole === 'viewer' || userRole === 'releaseManager') return false;
  if (userRole === 'qaLead') {
    const allowed = leadDefectTransitions[fromStatus];
    return allowed ? allowed.includes(toStatus) : false;
  }
  if (userRole === 'qaMember') {
    const allowed = memberAllowedDefectTransitions[fromStatus];
    return allowed ? allowed.includes(toStatus) : false;
  }
  return false;
}

export function canMutateDefectAny(userRole: UserRole): boolean {
  return userRole === 'qaLead' || userRole === 'qaMember';
}

const memberAllowedRiskTransitions: Record<RiskStatus, RiskStatus[]> = {
  draft: ['pendingApproval'],
  pendingApproval: [],
  accepted: [],
  rejected: [],
  mitigated: [],
  closed: [],
};

const managerAllowedRiskTransitions: Record<RiskStatus, RiskStatus[]> = {
  draft: [],
  pendingApproval: ['accepted', 'rejected'],
  accepted: ['closed', 'mitigated'],
  rejected: [],
  mitigated: ['closed'],
  closed: [],
};

const leadAllowedRiskTransitions: Record<RiskStatus, RiskStatus[]> = {
  draft: ['pendingApproval', 'mitigated'],
  pendingApproval: ['accepted', 'rejected'],
  accepted: ['closed', 'mitigated'],
  rejected: ['pendingApproval'],
  mitigated: ['closed'],
  closed: [],
};

export function canMutateRisk(
  userRole: UserRole,
  fromStatus: RiskStatus,
  toStatus: RiskStatus,
): boolean {
  if (userRole === 'viewer') return false;
  if (userRole === 'qaMember') {
    const allowed = memberAllowedRiskTransitions[fromStatus];
    return allowed ? allowed.includes(toStatus) : false;
  }
  if (userRole === 'releaseManager') {
    const allowed = managerAllowedRiskTransitions[fromStatus];
    return allowed ? allowed.includes(toStatus) : false;
  }
  if (userRole === 'qaLead') {
    const allowed = leadAllowedRiskTransitions[fromStatus];
    return allowed ? allowed.includes(toStatus) : false;
  }
  return false;
}

export function canMutateRiskAny(userRole: UserRole): boolean {
  return userRole === 'qaLead' || userRole === 'qaMember' || userRole === 'releaseManager';
}

export function canCreateEvidence(userRole: UserRole): boolean {
  return userRole === 'qaLead' || userRole === 'qaMember';
}

export function getDisabledReason(
  userRole: UserRole,
  actionDescription: string,
): string | null {
  if (userRole === 'viewer') {
    return `Viewer cannot ${actionDescription}.`;
  }
  return null;
}
