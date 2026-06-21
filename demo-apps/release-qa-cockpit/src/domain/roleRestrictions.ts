import type { DefectStatus, RiskStatus, TestExecutionStatus, UserRole } from '@/db/types';
import {
  isTransitionAllowed,
  defectAllowedTransitions,
  riskAllowedTransitions,
} from './transitions';

const screenViewableRoles: UserRole[] = ['qaLead', 'qaMember', 'releaseManager', 'viewer'];

export function canViewScreen(userRole: UserRole): boolean {
  return screenViewableRoles.includes(userRole);
}

export function canMutateTestExecution(userRole: UserRole): boolean {
  return userRole === 'qaLead' || userRole === 'qaMember';
}

export function canMutateTestExecutionStatus(
  userRole: UserRole,
  fromStatus: TestExecutionStatus,
  toStatus: TestExecutionStatus,
): boolean {
  if (!isTransitionAllowed('testExecution', fromStatus, toStatus)) return false;
  return canMutateTestExecution(userRole);
}

export function canMutateDefect(
  userRole: UserRole,
  fromStatus: DefectStatus,
  toStatus: DefectStatus,
): boolean {
  if (!isTransitionAllowed('defect', fromStatus, toStatus)) return false;
  if (userRole === 'viewer' || userRole === 'releaseManager') return false;
  if (userRole === 'qaLead') return true;
  if (userRole === 'qaMember') {
    const qaMemberBlocked: Partial<Record<DefectStatus, DefectStatus[]>> = {
      open: ['wontFix', 'duplicate'],
      triaged: ['wontFix'],
      readyForRetest: ['closed'],
    };
    const blocked = qaMemberBlocked[fromStatus];
    if (blocked && blocked.includes(toStatus)) return false;
    const allowed = defectAllowedTransitions[fromStatus];
    return allowed ? allowed.includes(toStatus) : false;
  }
  return false;
}

export function canMutateDefectAny(userRole: UserRole): boolean {
  return userRole === 'qaLead' || userRole === 'qaMember';
}

export function canMutateRisk(
  userRole: UserRole,
  fromStatus: RiskStatus,
  toStatus: RiskStatus,
): boolean {
  if (!isTransitionAllowed('risk', fromStatus, toStatus)) return false;
  if (userRole === 'viewer') return false;
  if (userRole === 'qaLead') {
    const allowed = riskAllowedTransitions[fromStatus];
    return allowed ? allowed.includes(toStatus) : false;
  }
  if (userRole === 'qaMember') {
    const allowed = ['pendingApproval'] as RiskStatus[];
    return fromStatus === 'draft' && allowed.includes(toStatus);
  }
  if (userRole === 'releaseManager') {
    const managerAllowed: Partial<Record<RiskStatus, RiskStatus[]>> = {
      pendingApproval: ['accepted', 'rejected'],
      accepted: ['closed', 'mitigated'],
      mitigated: ['closed'],
    };
    const allowed = managerAllowed[fromStatus];
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

export function getDisabledReason(userRole: UserRole, actionDescription: string): string | null {
  if (userRole === 'viewer') {
    return `Viewer cannot ${actionDescription}.`;
  }
  return null;
}
