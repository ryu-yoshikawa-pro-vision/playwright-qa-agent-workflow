import type { ReadinessResult } from '@/db/types';

export type SaveValidation = {
  allowed: boolean;
  reasons: string[];
};

function nonEmpty(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateReadySave(
  preview: ReadinessResult,
  qaCompletionComment?: string | null,
): SaveValidation {
  const reasons: string[] = [];
  if (preview.readiness !== 'ready') {
    reasons.push(
      'Preview readiness must be Ready. Resolve all blocker and warning conditions before saving Ready.',
    );
  }
  if (!nonEmpty(qaCompletionComment)) {
    reasons.push('QA completion comment is required for Ready save.');
  }
  return { allowed: reasons.length === 0, reasons };
}

export function validateAtRiskSave(
  preview: ReadinessResult,
  qaCompletionComment?: string | null,
  decisionComment?: string | null,
): SaveValidation {
  const reasons: string[] = [];
  if (preview.readiness !== 'atRisk') {
    reasons.push(
      'Preview readiness must be At Risk. Resolve all blocker conditions before saving At Risk.',
    );
  }
  if (!nonEmpty(qaCompletionComment)) {
    reasons.push('QA completion comment is required for At Risk save.');
  }
  if (!nonEmpty(decisionComment)) {
    reasons.push('Decision comment is required for At Risk save.');
  }
  return { allowed: reasons.length === 0, reasons };
}

export function validateNotReadySave(
  preview: ReadinessResult,
  decisionComment?: string | null,
): SaveValidation {
  const reasons: string[] = [];
  if (preview.readiness !== 'notReady') {
    reasons.push('Preview readiness must be Not Ready.');
  }
  if (!nonEmpty(decisionComment)) {
    reasons.push('Decision comment is required for Not Ready save.');
  }
  return { allowed: reasons.length === 0, reasons };
}
