import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '@/db/schema';
import { calculatePersistedReadiness } from '@/adapters/readiness';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import { unresolvedBlockingDefectStatuses } from '@/db/types';
import type {
  Release,
  ReleaseScope,
  TestItem,
  TestExecution,
  Defect,
  Risk,
  Decision,
  ReadinessResult,
} from '@/db/types';

export function ReleaseOverviewPage() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const [release, setRelease] = useState<Release | null>(null);
  const [scopes, setScopes] = useState<ReleaseScope[]>([]);
  const [readinessResult, setReadinessResult] = useState<ReadinessResult | null>(null);
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [testExecutions, setTestExecutions] = useState<TestExecution[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [latestDecision, setLatestDecision] = useState<Decision | null>(null);
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
      const rel = await db.releases.get(releaseId);
      if (!rel) {
        setError('Release not found.');
        setLoading(false);
        return;
      }

      const [result, relScopes, items, execs, defs, rks, decs] = await Promise.all([
        calculatePersistedReadiness(releaseId),
        db.releaseScopes.where({ releaseId }).toArray(),
        db.testItems.where({ releaseId }).toArray(),
        db.testExecutions.where({ releaseId }).toArray(),
        db.defects.where({ releaseId }).toArray(),
        db.risks.where({ releaseId }).toArray(),
        db.decisions.where({ releaseId }).toArray(),
      ]);

      setRelease(rel);
      setReadinessResult(result);
      setScopes(relScopes.filter((s) => s.inScope));
      setTestItems(items);
      setTestExecutions(execs);
      setDefects(defs);
      setRisks(rks);
      setLatestDecision(
        decs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null,
      );
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

  const requiredCount = testItems.filter((ti) => ti.required).length;
  const passedCount = testExecutions.filter((te) => te.status === 'pass').length;
  const failedBlockedCount = testExecutions.filter(
    (te) => te.status === 'fail' || te.status === 'blocked',
  ).length;
  const blockingDefectCount = defects.filter((d) => {
    const statusBlocking = (unresolvedBlockingDefectStatuses as readonly string[]).includes(
      d.status,
    );
    const severityBlocking = d.severity === 'critical' || d.severity === 'high';
    const impactsBlocking = d.impactsReleaseDecision;
    return statusBlocking && (severityBlocking || impactsBlocking);
  }).length;
  const activeRiskCount = risks.filter(
    (r) => r.status !== 'closed' && r.status !== 'mitigated',
  ).length;

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

      <div>
        <h2>Test Summary</h2>
        <p>Required: {requiredCount}</p>
        <p>Passed: {passedCount}</p>
        <p>Failed or Blocked: {failedBlockedCount}</p>
      </div>

      <div>
        <h2>Defect Summary</h2>
        <p>Unresolved blocking defects: {blockingDefectCount}</p>
      </div>

      <div>
        <h2>Risk Summary</h2>
        <p>Active risks: {activeRiskCount}</p>
      </div>

      {latestDecision && (
        <div>
          <h2>Latest Decision</h2>
          <p>Decision: {latestDecision.decision}</p>
          <p>QA comment: {latestDecision.qaCompletionComment}</p>
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
