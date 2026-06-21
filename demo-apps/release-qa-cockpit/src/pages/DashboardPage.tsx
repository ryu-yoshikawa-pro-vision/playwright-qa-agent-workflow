import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/db/schema';
import { calculatePersistedReadiness } from '@/adapters/readiness';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import { unresolvedBlockingDefectStatuses } from '@/db/types';
import type {
  Release,
  ReleaseReadiness,
  TestExecution,
  TestItem,
  Defect,
  Risk,
  Decision,
} from '@/db/types';

export function DashboardPage() {
  const [release, setRelease] = useState<Release | null>(null);
  const [readiness, setReadiness] = useState<ReleaseReadiness | null>(null);
  const [testExecutions, setTestExecutions] = useState<TestExecution[]>([]);
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [latestDecision, setLatestDecision] = useState<Decision | null>(null);
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

      const rel = await db.releases.get(session.currentReleaseId);
      if (!rel) {
        setError('Release not found.');
        setLoading(false);
        return;
      }

      setRelease(rel);

      const [result, execs, items, defs, rks, decs] = await Promise.all([
        calculatePersistedReadiness(rel.id),
        db.testExecutions.where({ releaseId: rel.id }).toArray(),
        db.testItems.where({ releaseId: rel.id }).toArray(),
        db.defects.where({ releaseId: rel.id }).toArray(),
        db.risks.where({ releaseId: rel.id }).toArray(),
        db.decisions.where({ releaseId: rel.id }).toArray(),
      ]);

      setReadiness(result.readiness);
      setTestExecutions(execs);
      setTestItems(items);
      setDefects(defs);
      setRisks(rks);
      setLatestDecision(
        decs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null,
      );
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
      <h1>Dashboard</h1>

      {release && (
        <div>
          <h2>{release.name}</h2>
          <p>Version: {release.version}</p>
          <p>Status: {release.status}</p>

          {readiness && (
            <div>
              <ReadinessBadge readiness={readiness} />
            </div>
          )}
        </div>
      )}

      {release && (
        <div>
          <h3>Test Summary</h3>
          <p>Required: {requiredCount}</p>
          <p>Passed: {passedCount}</p>
          <p>Failed or Blocked: {failedBlockedCount}</p>
        </div>
      )}

      {release && (
        <div>
          <h3>Defect Summary</h3>
          <p>Unresolved blocking defects: {blockingDefectCount}</p>
        </div>
      )}

      {release && (
        <div>
          <h3>Risk Summary</h3>
          <p>Active risks: {activeRiskCount}</p>
        </div>
      )}

      {release && latestDecision && (
        <div>
          <h3>Latest Decision</h3>
          <p>Decision: {latestDecision.decision}</p>
          <p>QA comment: {latestDecision.qaCompletionComment}</p>
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
