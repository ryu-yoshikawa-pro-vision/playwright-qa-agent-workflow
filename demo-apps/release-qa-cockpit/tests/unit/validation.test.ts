import { describe, it, expect } from 'vitest';
import {
  validateReadySave,
  validateAtRiskSave,
  validateNotReadySave,
} from '../../src/domain/validation';
import type { ReadinessResult } from '../../src/db/types';

function readyResult(): ReadinessResult {
  return {
    readiness: 'ready',
    unmetConditions: [],
    warningConditions: [],
  };
}

function atRiskResult(): ReadinessResult {
  return {
    readiness: 'atRisk',
    unmetConditions: [],
    warningConditions: [
      {
        id: 'high-risk-accepted:risk-1',
        severity: 'warning',
        message: 'High impact risk is accepted.',
        sourceType: 'risk',
        sourceId: 'risk-1',
      },
    ],
  };
}

function notReadyResult(): ReadinessResult {
  return {
    readiness: 'notReady',
    unmetConditions: [
      {
        id: 'required-test-failed:exec-1',
        severity: 'blocker',
        message: 'Required test failed.',
        sourceType: 'testExecution',
        sourceId: 'exec-1',
      },
    ],
    warningConditions: [],
  };
}

describe('validateReadySave', () => {
  it('allows save when preview is ready and QA comment is present', () => {
    const result = validateReadySave(readyResult(), 'QA completed successfully.');
    expect(result.allowed).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('blocks save when preview is not ready', () => {
    const result = validateReadySave(notReadyResult(), 'QA completed');
    expect(result.allowed).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons[0]).toContain('Ready');
  });

  it('blocks save when QA completion comment is empty', () => {
    const result = validateReadySave(readyResult(), '');
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('qa completion'))).toBe(true);
  });

  it('blocks save when QA completion comment is whitespace only', () => {
    const result = validateReadySave(readyResult(), '   ');
    expect(result.allowed).toBe(false);
  });

  it('blocks save when both conditions are violated', () => {
    const result = validateReadySave(notReadyResult(), '');
    expect(result.allowed).toBe(false);
    expect(result.reasons.length).toBeGreaterThanOrEqual(2);
  });

  it('blocks save when QA completion comment is undefined or null', () => {
    expect(validateReadySave(readyResult(), undefined).allowed).toBe(false);
    expect(validateReadySave(readyResult(), null).allowed).toBe(false);
  });
});

describe('validateAtRiskSave', () => {
  it('allows save when preview is atRisk, QA comment present, decision comment present', () => {
    const result = validateAtRiskSave(atRiskResult(), 'QA completed.', 'Accepting risk.');
    expect(result.allowed).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('blocks save when preview is not atRisk', () => {
    const result = validateAtRiskSave(notReadyResult(), 'QA completed', 'Decision made');
    expect(result.allowed).toBe(false);
    expect(result.reasons[0]).toContain('At Risk');
  });

  it('blocks save when QA completion comment is empty', () => {
    const result = validateAtRiskSave(atRiskResult(), '', 'Decision comment');
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('qa completion'))).toBe(true);
  });

  it('blocks save when decision comment is empty', () => {
    const result = validateAtRiskSave(atRiskResult(), 'QA completed', '');
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('decision comment'))).toBe(true);
  });

  it('blocks save when all conditions are violated', () => {
    const result = validateAtRiskSave(readyResult(), '', '');
    expect(result.allowed).toBe(false);
    expect(result.reasons.length).toBeGreaterThanOrEqual(3);
  });

  it('blocks save when QA completion comment is whitespace only', () => {
    const result = validateAtRiskSave(atRiskResult(), '   ', 'Decision comment');
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('qa completion'))).toBe(true);
  });

  it('blocks save when QA completion comment is newline/tab only', () => {
    const result = validateAtRiskSave(atRiskResult(), '\n\t', 'Decision comment');
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('qa completion'))).toBe(true);
  });

  it('blocks save when decision comment is whitespace only', () => {
    const result = validateAtRiskSave(atRiskResult(), 'QA completed', '   ');
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('decision comment'))).toBe(true);
  });

  it('blocks save when decision comment is newline/tab only', () => {
    const result = validateAtRiskSave(atRiskResult(), 'QA completed', '\n\t');
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('decision comment'))).toBe(true);
  });

  it('blocks save when QA completion comment is undefined or null', () => {
    expect(validateAtRiskSave(atRiskResult(), undefined, 'Decision comment').allowed).toBe(false);
    expect(validateAtRiskSave(atRiskResult(), null, 'Decision comment').allowed).toBe(false);
  });

  it('blocks save when decision comment is undefined or null', () => {
    expect(validateAtRiskSave(atRiskResult(), 'QA completed', undefined).allowed).toBe(false);
    expect(validateAtRiskSave(atRiskResult(), 'QA completed', null).allowed).toBe(false);
  });
});

describe('validateNotReadySave', () => {
  it('allows save when preview is notReady and decision comment is present', () => {
    const result = validateNotReadySave(notReadyResult(), 'Blockers identified.');
    expect(result.allowed).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('allows save without QA completion comment', () => {
    const result = validateNotReadySave(notReadyResult(), 'Blockers identified.');
    expect(result.allowed).toBe(true);
  });

  it('blocks save when preview is not notReady', () => {
    const result = validateNotReadySave(readyResult(), 'Decision comment');
    expect(result.allowed).toBe(false);
    expect(result.reasons[0]).toContain('Not Ready');
  });

  it('blocks save when decision comment is empty', () => {
    const result = validateNotReadySave(notReadyResult(), '');
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('decision comment'))).toBe(true);
  });

  it('blocks save when decision comment is whitespace only', () => {
    const result = validateNotReadySave(notReadyResult(), '   ');
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('decision comment'))).toBe(true);
  });

  it('blocks save when decision comment is newline/tab only', () => {
    const result = validateNotReadySave(notReadyResult(), '\n\t');
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes('decision comment'))).toBe(true);
  });

  it('blocks save when decision comment is undefined or null', () => {
    expect(validateNotReadySave(notReadyResult(), undefined).allowed).toBe(false);
    expect(validateNotReadySave(notReadyResult(), null).allowed).toBe(false);
  });
});
