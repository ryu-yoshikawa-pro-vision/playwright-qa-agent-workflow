import { describe, it, expect } from 'vitest';
import {
  isTransitionAllowed,
  getRequiredReasonField,
  getTransitionAction,
  getTransitionLabel,
  getFieldLabel,
} from '../../src/domain/transitions';

describe('isTransitionAllowed', () => {
  describe('testExecution', () => {
    it('allows notStarted -> inProgress', () => {
      expect(isTransitionAllowed('testExecution', 'notStarted', 'inProgress')).toBe(true);
    });

    it('allows notStarted -> skipped', () => {
      expect(isTransitionAllowed('testExecution', 'notStarted', 'skipped')).toBe(true);
    });

    it('allows inProgress -> pass', () => {
      expect(isTransitionAllowed('testExecution', 'inProgress', 'pass')).toBe(true);
    });

    it('allows inProgress -> fail', () => {
      expect(isTransitionAllowed('testExecution', 'inProgress', 'fail')).toBe(true);
    });

    it('allows inProgress -> blocked', () => {
      expect(isTransitionAllowed('testExecution', 'inProgress', 'blocked')).toBe(true);
    });

    it('allows fail -> retest', () => {
      expect(isTransitionAllowed('testExecution', 'fail', 'retest')).toBe(true);
    });

    it('allows blocked -> inProgress', () => {
      expect(isTransitionAllowed('testExecution', 'blocked', 'inProgress')).toBe(true);
    });

    it('allows skipped -> inProgress', () => {
      expect(isTransitionAllowed('testExecution', 'skipped', 'inProgress')).toBe(true);
    });

    it('allows retest -> pass', () => {
      expect(isTransitionAllowed('testExecution', 'retest', 'pass')).toBe(true);
    });

    it('allows retest -> fail', () => {
      expect(isTransitionAllowed('testExecution', 'retest', 'fail')).toBe(true);
    });

    it('rejects pass -> fail', () => {
      expect(isTransitionAllowed('testExecution', 'pass', 'fail')).toBe(false);
    });

    it('rejects pass -> retest', () => {
      expect(isTransitionAllowed('testExecution', 'pass', 'retest')).toBe(false);
    });

    it('rejects unknown status transition', () => {
      expect(isTransitionAllowed('testExecution', 'notStarted', 'pass')).toBe(false);
    });

    it('rejects pass -> any when pass has no outgoing', () => {
      expect(isTransitionAllowed('testExecution', 'pass', 'inProgress')).toBe(false);
      expect(isTransitionAllowed('testExecution', 'pass', 'blocked')).toBe(false);
      expect(isTransitionAllowed('testExecution', 'pass', 'skipped')).toBe(false);
    });
  });

  describe('defect', () => {
    it('allows open -> triaged', () => {
      expect(isTransitionAllowed('defect', 'open', 'triaged')).toBe(true);
    });

    it('allows open -> wontFix', () => {
      expect(isTransitionAllowed('defect', 'open', 'wontFix')).toBe(true);
    });

    it('allows open -> duplicate', () => {
      expect(isTransitionAllowed('defect', 'open', 'duplicate')).toBe(true);
    });

    it('allows triaged -> inProgress', () => {
      expect(isTransitionAllowed('defect', 'triaged', 'inProgress')).toBe(true);
    });

    it('allows inProgress -> fixed', () => {
      expect(isTransitionAllowed('defect', 'inProgress', 'fixed')).toBe(true);
    });

    it('allows fixed -> readyForRetest', () => {
      expect(isTransitionAllowed('defect', 'fixed', 'readyForRetest')).toBe(true);
    });

    it('allows readyForRetest -> closed', () => {
      expect(isTransitionAllowed('defect', 'readyForRetest', 'closed')).toBe(true);
    });

    it('allows readyForRetest -> reopened', () => {
      expect(isTransitionAllowed('defect', 'readyForRetest', 'reopened')).toBe(true);
    });

    it('allows reopened -> inProgress', () => {
      expect(isTransitionAllowed('defect', 'reopened', 'inProgress')).toBe(true);
    });

    it('allows closed -> reopened', () => {
      expect(isTransitionAllowed('defect', 'closed', 'reopened')).toBe(true);
    });

    it('allows wontFix -> reopened', () => {
      expect(isTransitionAllowed('defect', 'wontFix', 'reopened')).toBe(true);
    });

    it('rejects open -> closed (must go through chain)', () => {
      expect(isTransitionAllowed('defect', 'open', 'closed')).toBe(false);
    });

    it('rejects closed -> inProgress', () => {
      expect(isTransitionAllowed('defect', 'closed', 'inProgress')).toBe(false);
    });
  });

  describe('risk', () => {
    it('allows draft -> pendingApproval', () => {
      expect(isTransitionAllowed('risk', 'draft', 'pendingApproval')).toBe(true);
    });

    it('allows draft -> mitigated', () => {
      expect(isTransitionAllowed('risk', 'draft', 'mitigated')).toBe(true);
    });

    it('allows pendingApproval -> accepted', () => {
      expect(isTransitionAllowed('risk', 'pendingApproval', 'accepted')).toBe(true);
    });

    it('allows pendingApproval -> rejected', () => {
      expect(isTransitionAllowed('risk', 'pendingApproval', 'rejected')).toBe(true);
    });

    it('allows accepted -> closed', () => {
      expect(isTransitionAllowed('risk', 'accepted', 'closed')).toBe(true);
    });

    it('allows accepted -> mitigated', () => {
      expect(isTransitionAllowed('risk', 'accepted', 'mitigated')).toBe(true);
    });

    it('allows rejected -> pendingApproval', () => {
      expect(isTransitionAllowed('risk', 'rejected', 'pendingApproval')).toBe(true);
    });

    it('allows mitigated -> closed', () => {
      expect(isTransitionAllowed('risk', 'mitigated', 'closed')).toBe(true);
    });

    it('rejects closed -> pendingApproval', () => {
      expect(isTransitionAllowed('risk', 'closed', 'pendingApproval')).toBe(false);
    });

    it('rejects draft -> accepted (must go through pendingApproval)', () => {
      expect(isTransitionAllowed('risk', 'draft', 'accepted')).toBe(false);
    });
  });
});

describe('getRequiredReasonField', () => {
  describe('testExecution', () => {
    it('returns skipReason for skipped', () => {
      expect(getRequiredReasonField('testExecution', 'notStarted', 'skipped')).toBe('skipReason');
    });

    it('returns blockedReason for blocked', () => {
      expect(getRequiredReasonField('testExecution', 'inProgress', 'blocked')).toBe(
        'blockedReason',
      );
    });

    it('returns null for pass', () => {
      expect(getRequiredReasonField('testExecution', 'inProgress', 'pass')).toBeNull();
    });

    it('returns null for fail', () => {
      expect(getRequiredReasonField('testExecution', 'inProgress', 'fail')).toBeNull();
    });

    it('returns null for retest', () => {
      expect(getRequiredReasonField('testExecution', 'fail', 'retest')).toBeNull();
    });
  });

  describe('defect', () => {
    it('returns resolutionNote for wontFix', () => {
      expect(getRequiredReasonField('defect', 'open', 'wontFix')).toBe('resolutionNote');
    });

    it('returns resolutionNote for duplicate', () => {
      expect(getRequiredReasonField('defect', 'open', 'duplicate')).toBe('resolutionNote');
    });

    it('returns resolutionNote for closed -> reopened', () => {
      expect(getRequiredReasonField('defect', 'closed', 'reopened')).toBe('resolutionNote');
    });

    it('returns null for open -> triaged', () => {
      expect(getRequiredReasonField('defect', 'open', 'triaged')).toBeNull();
    });

    it('returns null for readyForRetest -> closed', () => {
      expect(getRequiredReasonField('defect', 'readyForRetest', 'closed')).toBeNull();
    });
  });

  describe('risk', () => {
    it('returns acceptedReason for accepted', () => {
      expect(getRequiredReasonField('risk', 'pendingApproval', 'accepted')).toBe('acceptedReason');
    });

    it('returns rejectedReason for rejected', () => {
      expect(getRequiredReasonField('risk', 'pendingApproval', 'rejected')).toBe('rejectedReason');
    });

    it('returns mitigationNote for mitigated', () => {
      expect(getRequiredReasonField('risk', 'draft', 'mitigated')).toBe('mitigationNote');
    });

    it('returns acceptedReason for pendingApproval -> accepted', () => {
      expect(getRequiredReasonField('risk', 'pendingApproval', 'accepted')).toBe('acceptedReason');
    });

    it('returns null for closed (no required reason)', () => {
      expect(getRequiredReasonField('risk', 'accepted', 'closed')).toBeNull();
    });
  });
});

describe('getTransitionAction', () => {
  it('returns test.execution.passed for pass', () => {
    expect(getTransitionAction('testExecution', 'pass')).toBe('test.execution.passed');
  });

  it('returns test.execution.failed for fail', () => {
    expect(getTransitionAction('testExecution', 'fail')).toBe('test.execution.failed');
  });

  it('returns defect.closed for closed', () => {
    expect(getTransitionAction('defect', 'closed')).toBe('defect.closed');
  });

  it('returns risk.accepted for accepted', () => {
    expect(getTransitionAction('risk', 'accepted')).toBe('risk.accepted');
  });
});

describe('getTransitionLabel', () => {
  it('includes test title in label', () => {
    const label = getTransitionLabel('testExecution', 'pass', 'Recording playback');
    expect(label).toContain('Recording playback');
    expect(label).toContain('passed');
  });

  it('includes defect title in label', () => {
    const label = getTransitionLabel('defect', 'closed', 'Login bug');
    expect(label).toContain('Login bug');
    expect(label).toContain('Close');
  });

  it('includes risk title in label', () => {
    const label = getTransitionLabel('risk', 'accepted', 'Performance risk');
    expect(label).toContain('Performance risk');
    expect(label).toContain('Accept');
  });
});

describe('getFieldLabel', () => {
  it('returns human-readable labels', () => {
    expect(getFieldLabel('skipReason')).toBe('Skip reason');
    expect(getFieldLabel('blockedReason')).toBe('Blocked reason');
    expect(getFieldLabel('resolutionNote')).toBe('Resolution note');
    expect(getFieldLabel('acceptedReason')).toBe('Accepted reason');
    expect(getFieldLabel('rejectedReason')).toBe('Rejected reason');
    expect(getFieldLabel('mitigationNote')).toBe('Mitigation note');
  });

  it('falls back to field name for unknown fields', () => {
    expect(getFieldLabel('customField')).toBe('customField');
  });
});
