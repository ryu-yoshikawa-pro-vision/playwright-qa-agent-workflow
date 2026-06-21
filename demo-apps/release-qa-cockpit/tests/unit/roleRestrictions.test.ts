import { describe, it, expect } from 'vitest';
import {
  canMutateTestExecution,
  canMutateTestExecutionStatus,
  canMutateDefect,
  canMutateDefectAny,
  canMutateRisk,
  canMutateRiskAny,
  canCreateEvidence,
  canViewScreen,
  getDisabledReason,
} from '../../src/domain/roleRestrictions';

describe('canViewScreen', () => {
  it('allows all known roles', () => {
    expect(canViewScreen('qaLead')).toBe(true);
    expect(canViewScreen('qaMember')).toBe(true);
    expect(canViewScreen('releaseManager')).toBe(true);
    expect(canViewScreen('viewer')).toBe(true);
  });

  it('denies unknown role', () => {
    expect(canViewScreen('unknown' as never)).toBe(false);
  });
});

describe('canMutateTestExecutionStatus', () => {
  it('allows QA Lead valid transition', () => {
    expect(canMutateTestExecutionStatus('qaLead', 'inProgress', 'pass')).toBe(true);
  });

  it('denies QA Lead invalid transition', () => {
    expect(canMutateTestExecutionStatus('qaLead', 'pass', 'fail')).toBe(false);
  });

  it('denies Viewer valid transition', () => {
    expect(canMutateTestExecutionStatus('viewer', 'inProgress', 'pass')).toBe(false);
  });

  it('denies Viewer invalid transition', () => {
    expect(canMutateTestExecutionStatus('viewer', 'pass', 'fail')).toBe(false);
  });

  it('denies Release Manager', () => {
    expect(canMutateTestExecutionStatus('releaseManager', 'inProgress', 'pass')).toBe(false);
  });
});

describe('canMutateTestExecution', () => {
  it('allows QA Lead', () => {
    expect(canMutateTestExecution('qaLead')).toBe(true);
  });

  it('allows QA Member', () => {
    expect(canMutateTestExecution('qaMember')).toBe(true);
  });

  it('denies Release Manager', () => {
    expect(canMutateTestExecution('releaseManager')).toBe(false);
  });

  it('denies Viewer', () => {
    expect(canMutateTestExecution('viewer')).toBe(false);
  });
});

describe('canMutateDefect', () => {
  it('allows QA Lead to move open -> triaged', () => {
    expect(canMutateDefect('qaLead', 'open', 'triaged')).toBe(true);
  });

  it('allows QA Lead to close defect', () => {
    expect(canMutateDefect('qaLead', 'readyForRetest', 'closed')).toBe(true);
  });

  it('allows QA Lead to mark wontFix', () => {
    expect(canMutateDefect('qaLead', 'open', 'wontFix')).toBe(true);
  });

  it('allows QA Lead to mark duplicate', () => {
    expect(canMutateDefect('qaLead', 'open', 'duplicate')).toBe(true);
  });

  it('allows QA Lead to reopen closed', () => {
    expect(canMutateDefect('qaLead', 'closed', 'reopened')).toBe(true);
  });

  it('allows QA Member to move open -> triaged', () => {
    expect(canMutateDefect('qaMember', 'open', 'triaged')).toBe(true);
  });

  it('allows QA Member to move triaged -> inProgress', () => {
    expect(canMutateDefect('qaMember', 'triaged', 'inProgress')).toBe(true);
  });

  it('allows QA Member to move inProgress -> fixed', () => {
    expect(canMutateDefect('qaMember', 'inProgress', 'fixed')).toBe(true);
  });

  it('allows QA Member to move fixed -> readyForRetest', () => {
    expect(canMutateDefect('qaMember', 'fixed', 'readyForRetest')).toBe(true);
  });

  it('allows QA Member to reopen from readyForRetest', () => {
    expect(canMutateDefect('qaMember', 'readyForRetest', 'reopened')).toBe(true);
  });

  it('denies QA Member to close defect', () => {
    expect(canMutateDefect('qaMember', 'readyForRetest', 'closed')).toBe(false);
  });

  it('denies QA Member to mark wontFix', () => {
    expect(canMutateDefect('qaMember', 'open', 'wontFix')).toBe(false);
  });

  it('denies QA Member to mark duplicate', () => {
    expect(canMutateDefect('qaMember', 'open', 'duplicate')).toBe(false);
  });

  it('denies Release Manager any defect mutation', () => {
    expect(canMutateDefect('releaseManager', 'open', 'triaged')).toBe(false);
    expect(canMutateDefect('releaseManager', 'readyForRetest', 'closed')).toBe(false);
  });

  it('denies Viewer any defect mutation', () => {
    expect(canMutateDefect('viewer', 'open', 'triaged')).toBe(false);
    expect(canMutateDefect('viewer', 'readyForRetest', 'closed')).toBe(false);
  });
});

describe('canMutateDefectAny', () => {
  it('allows QA Lead', () => {
    expect(canMutateDefectAny('qaLead')).toBe(true);
  });

  it('allows QA Member', () => {
    expect(canMutateDefectAny('qaMember')).toBe(true);
  });

  it('denies Release Manager', () => {
    expect(canMutateDefectAny('releaseManager')).toBe(false);
  });

  it('denies Viewer', () => {
    expect(canMutateDefectAny('viewer')).toBe(false);
  });
});

describe('canMutateRisk', () => {
  it('allows QA Lead to submit for approval', () => {
    expect(canMutateRisk('qaLead', 'draft', 'pendingApproval')).toBe(true);
  });

  it('allows QA Lead to mitigate', () => {
    expect(canMutateRisk('qaLead', 'draft', 'mitigated')).toBe(true);
  });

  it('allows QA Lead to accept', () => {
    expect(canMutateRisk('qaLead', 'pendingApproval', 'accepted')).toBe(true);
  });

  it('allows QA Lead to reject', () => {
    expect(canMutateRisk('qaLead', 'pendingApproval', 'rejected')).toBe(true);
  });

  it('allows QA Lead to close accepted', () => {
    expect(canMutateRisk('qaLead', 'accepted', 'closed')).toBe(true);
  });

  it('allows QA Member only draft -> pendingApproval', () => {
    expect(canMutateRisk('qaMember', 'draft', 'pendingApproval')).toBe(true);
    expect(canMutateRisk('qaMember', 'pendingApproval', 'accepted')).toBe(false);
    expect(canMutateRisk('qaMember', 'draft', 'mitigated')).toBe(false);
  });

  it('allows Release Manager to accept', () => {
    expect(canMutateRisk('releaseManager', 'pendingApproval', 'accepted')).toBe(true);
  });

  it('allows Release Manager to reject', () => {
    expect(canMutateRisk('releaseManager', 'pendingApproval', 'rejected')).toBe(true);
  });

  it('allows Release Manager to close', () => {
    expect(canMutateRisk('releaseManager', 'accepted', 'closed')).toBe(true);
  });

  it('allows Release Manager to mitigate', () => {
    expect(canMutateRisk('releaseManager', 'accepted', 'mitigated')).toBe(true);
  });

  it('denies Release Manager to submit for approval', () => {
    expect(canMutateRisk('releaseManager', 'draft', 'pendingApproval')).toBe(false);
  });

  it('denies Viewer any risk mutation', () => {
    expect(canMutateRisk('viewer', 'draft', 'pendingApproval')).toBe(false);
    expect(canMutateRisk('viewer', 'pendingApproval', 'accepted')).toBe(false);
  });
});

describe('canMutateRiskAny', () => {
  it('allows QA Lead', () => {
    expect(canMutateRiskAny('qaLead')).toBe(true);
  });

  it('allows QA Member', () => {
    expect(canMutateRiskAny('qaMember')).toBe(true);
  });

  it('allows Release Manager', () => {
    expect(canMutateRiskAny('releaseManager')).toBe(true);
  });

  it('denies Viewer', () => {
    expect(canMutateRiskAny('viewer')).toBe(false);
  });
});

describe('canCreateEvidence', () => {
  it('allows QA Lead', () => {
    expect(canCreateEvidence('qaLead')).toBe(true);
  });

  it('allows QA Member', () => {
    expect(canCreateEvidence('qaMember')).toBe(true);
  });

  it('denies Release Manager', () => {
    expect(canCreateEvidence('releaseManager')).toBe(false);
  });

  it('denies Viewer', () => {
    expect(canCreateEvidence('viewer')).toBe(false);
  });
});

describe('getDisabledReason', () => {
  it('returns message for Viewer', () => {
    const reason = getDisabledReason('viewer', 'update test executions');
    expect(reason).toContain('Viewer');
    expect(reason).toContain('update test executions');
  });

  it('returns null for QA Lead', () => {
    expect(getDisabledReason('qaLead', 'update test executions')).toBeNull();
  });

  it('returns null for QA Member', () => {
    expect(getDisabledReason('qaMember', 'update test executions')).toBeNull();
  });

  it('returns null for Release Manager', () => {
    expect(getDisabledReason('releaseManager', 'update test executions')).toBeNull();
  });
});
