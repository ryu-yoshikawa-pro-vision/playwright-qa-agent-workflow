import type { ReleaseReadiness } from '@/db/types';

type Props = {
  readiness: ReleaseReadiness;
  preview?: boolean;
};

const labelMap: Record<ReleaseReadiness, string> = {
  ready: 'Ready',
  atRisk: 'At Risk',
  notReady: 'Not Ready',
};

export function ReadinessBadge({ readiness, preview }: Props) {
  const prefix = preview ? 'Preview readiness' : 'Readiness';
  const label = `${prefix}: ${labelMap[readiness]}`;

  return <span aria-label={label}>{label}</span>;
}
