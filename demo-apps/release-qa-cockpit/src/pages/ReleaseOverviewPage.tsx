import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '@/db/schema';
import {
  loadReadinessSnapshot,
  calculateReleaseSummaryFromReadinessSnapshot,
} from '@/adapters/readiness';
import { calculateReadinessFromSnapshot } from '@/domain/readiness';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import type { Release, ReleaseScope, ReadinessResult } from '@/db/types';
import type { ReleaseSummary } from '@/adapters/readiness';

export function ReleaseOverviewPage() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const [release, setRelease] = useState<Release | null>(null);
  const [scopes, setScopes] = useState<ReleaseScope[]>([]);
  const [readinessResult, setReadinessResult] = useState<ReadinessResult | null>(null);
  const [summary, setSummary] = useState<ReleaseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!releaseId) {
      setError('Release ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [snapshot, relScopes] = await Promise.all([
        loadReadinessSnapshot(releaseId),
        db.releaseScopes.where({ releaseId }).toArray(),
      ]);

      const readinessResult = calculateReadinessFromSnapshot(snapshot);
      const summary = calculateReleaseSummaryFromReadinessSnapshot(snapshot);

      setRelease(snapshot.release);
      setReadinessResult(readinessResult);
      setSummary(summary);
      setScopes(relScopes.filter((s) => s.inScope));
    } catch {
      setError('Failed to load release overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [releaseId]);

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div>
        <h1>Release Overview</h1>
        <p>{error}</p>
        <Link to="/releases">Back to Releases</Link>
      </div>
    );
  }

  if (!release) return null;

  return (
    <div>
      <h1>{release.name}</h1>
      <p>Version: {release.version}</p>
      <p>Status: {release.status}</p>
      <p>
        Planned: {release.plannedStartDate} – {release.plannedEndDate}
      </p>

      {readinessResult && <ReadinessBadge readiness={readinessResult.readiness} />}

      <div role="region" aria-label="Unmet readiness conditions">
        <h2 id="unmet-heading">Unmet readiness conditions</h2>
        {readinessResult && readinessResult.unmetConditions.length > 0 ? (
          <ul aria-labelledby="unmet-heading">
            {readinessResult.unmetConditions.map((condition) => (
              <li key={condition.id}>{condition.message}</li>
            ))}
          </ul>
        ) : (
          <p>No unmet readiness conditions</p>
        )}
      </div>

      <div role="region" aria-label="Readiness warnings">
        <h2 id="warnings-heading">Readiness warnings</h2>
        {readinessResult && readinessResult.warningConditions.length > 0 ? (
          <ul aria-labelledby="warnings-heading">
            {readinessResult.warningConditions.map((condition) => (
              <li key={condition.id}>{condition.message}</li>
            ))}
          </ul>
        ) : (
          <p>No readiness warnings</p>
        )}
      </div>

      <div>
        <h2>Scope</h2>
        {scopes.length > 0 ? (
          <ul>
            {scopes.map((scope) => (
              <li key={scope.id}>
                {scope.title} ({scope.area})
              </li>
            ))}
          </ul>
        ) : (
          <p>No scope items defined.</p>
        )}
      </div>

      {summary && (
        <div>
          <h2>Test Summary</h2>
          <p>Required: {summary.requiredTestItemCount}</p>
          <p>Passed: {summary.passedTestItemCount}</p>
          <p>Failed or Blocked: {summary.failedOrBlockedTestItemCount}</p>
        </div>
      )}

      {summary && (
        <div>
          <h2>Defect Summary</h2>
          <p>Unresolved blocking defects: {summary.unresolvedBlockingDefectCount}</p>
        </div>
      )}

      {summary && (
        <div>
          <h2>Risk Summary</h2>
          <p>Active risks: {summary.activeRiskCount}</p>
        </div>
      )}

      {summary?.latestDecision && (
        <div>
          <h2>Latest Decision</h2>
          <p>Decision: {summary.latestDecision.decision}</p>
          <p>QA comment: {summary.latestDecision.qaCompletionComment}</p>
        </div>
      )}

      <nav>
        <Link to={`/releases/${release.id}/tests`}>Open Test Execution</Link>
        <Link to={`/releases/${release.id}/defects`}>Open Defect Triage</Link>
        <Link to={`/releases/${release.id}/risks`}>Open Risk Review</Link>
        <Link to={`/releases/${release.id}/decision`}>Open Release Decision</Link>
        <Link to={`/releases/${release.id}/evidence-pack`}>Export Evidence Pack</Link>
      </nav>
    </div>
  );
}
