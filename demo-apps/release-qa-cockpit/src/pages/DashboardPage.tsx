import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/db/schema';
import { calculatePersistedReadiness } from '@/adapters/readiness';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import type { Release, ReleaseReadiness } from '@/db/types';

export function DashboardPage() {
  const [release, setRelease] = useState<Release | null>(null);
  const [readiness, setReadiness] = useState<ReleaseReadiness | null>(null);
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
      const result = await calculatePersistedReadiness(rel.id);
      setReadiness(result.readiness);
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

          {readiness && (
            <div>
              <ReadinessBadge readiness={readiness} />
            </div>
          )}
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
