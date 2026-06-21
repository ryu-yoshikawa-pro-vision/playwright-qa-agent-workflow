import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/db/schema';
import {
  loadReadinessSnapshot,
  calculateReleaseSummaryFromReadinessSnapshot,
} from '@/adapters/readiness';
import { calculateReadinessFromSnapshot } from '@/domain/readiness';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import type { Release, ReadinessResult } from '@/db/types';
import type { ReleaseSummary } from '@/adapters/readiness';

export function DashboardPage() {
  const [release, setRelease] = useState<Release | null>(null);
  const [readinessResult, setReadinessResult] = useState<ReadinessResult | null>(null);
  const [summary, setSummary] = useState<ReleaseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await db.sessions.get('session-default');
      if (!session?.currentReleaseId) {
        setError('No active release selected.');
        setLoading(false);
        return;
      }

      const snapshot = await loadReadinessSnapshot(session.currentReleaseId);
      const readinessResult = calculateReadinessFromSnapshot(snapshot);
      const summary = calculateReleaseSummaryFromReadinessSnapshot(snapshot);

      setRelease(snapshot.release);
      setReadinessResult(readinessResult);
      setSummary(summary);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>{error}</p>
        <Link to="/demo-controls">Reset demo data</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {release && (
        <div>
          <h2>{release.name}</h2>
          <p>Version: {release.version}</p>
          <p>Status: {release.status}</p>

          {readinessResult && (
            <div>
              <ReadinessBadge readiness={readinessResult.readiness} />
            </div>
          )}
        </div>
      )}

      {release && summary && (
        <div>
          <h3>Test Summary</h3>
          <p>Required: {summary.requiredTestItemCount}</p>
          <p>Passed: {summary.passedTestItemCount}</p>
          <p>Failed or Blocked: {summary.failedOrBlockedTestItemCount}</p>
          <p>Missing: {summary.missingRequiredTestItemCount}</p>
          <p>Not completed: {summary.notCompletedTestItemCount}</p>
        </div>
      )}

      {release && summary && (
        <div>
          <h3>Defect Summary</h3>
          <p>Unresolved blocking defects: {summary.unresolvedBlockingDefectCount}</p>
        </div>
      )}

      {release && summary && (
        <div>
          <h3>Risk Summary</h3>
          <p>Active risks: {summary.activeRiskCount}</p>
        </div>
      )}

      {release && summary?.latestDecision && (
        <div>
          <h3>Latest Decision</h3>
          <p>Decision: {summary.latestDecision.decision}</p>
          <p>QA comment: {summary.latestDecision.qaCompletionComment}</p>
        </div>
      )}

      {release && (
        <nav>
          <Link to={`/releases/${release.id}`}>Open Release Overview</Link>
          <Link to={`/releases/${release.id}/tests`}>Open Test Execution</Link>
          <Link to={`/releases/${release.id}/defects`}>Open Defect Triage</Link>
          <Link to={`/releases/${release.id}/risks`}>Open Risk Review</Link>
          <Link to={`/releases/${release.id}/decision`}>Open Release Decision</Link>
          <Link to={`/releases/${release.id}/evidence-pack`}>Export Evidence Pack</Link>
        </nav>
      )}
    </div>
  );
}
