import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '@/db/schema';
import { calculatePersistedReadiness } from '@/adapters/readiness';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import type { Release, ReleaseReadiness } from '@/db/types';

type ReleaseWithReadiness = {
  release: Release;
  readiness: ReleaseReadiness | null;
};

export function ReleasesPage() {
  const navigate = useNavigate();
  const [releases, setReleases] = useState<ReleaseWithReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const allReleases = await db.releases.toArray();

      const withReadiness = await Promise.all(
        allReleases.map(async (release) => {
          try {
            const result = await calculatePersistedReadiness(release.id);
            return { release, readiness: result.readiness };
          } catch {
            return { release, readiness: null };
          }
        }),
      );

      setReleases(withReadiness);
    } catch {
      setError('Failed to load releases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const shouldUseBrowserDefaultNavigation = (event: React.MouseEvent<HTMLAnchorElement>): boolean =>
    event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

  const handleViewRelease = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    releaseId: string,
  ) => {
    if (shouldUseBrowserDefaultNavigation(event)) {
      return;
    }

    event.preventDefault();

    try {
      await db.transaction('rw', db.sessions, db.activityLogs, db.users, db.releases, async () => {
        const session = await db.sessions.get('session-default');
        if (!session) return;

        await db.sessions.put({
          ...session,
          currentReleaseId: releaseId,
          updatedAt: new Date().toISOString(),
        });

        const user = await db.users.get(session.currentUserId);
        if (user) {
          const release = await db.releases.get(releaseId);
          await db.activityLogs.add({
            id: crypto.randomUUID(),
            actorUserId: user.id,
            action: 'release.selected',
            targetEntityType: 'release',
            targetEntityId: releaseId,
            summary: `Selected release: ${release?.name ?? releaseId}`,
            createdAt: new Date().toISOString(),
          });
        }
      });
    } catch (error) {
      console.error('Failed to persist selected release.', error);
    } finally {
      navigate(`/releases/${releaseId}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div>
        <h1>Releases</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (releases.length === 0) {
    return (
      <div>
        <h1>Releases</h1>
        <p>No releases found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Releases</h1>
      {releases.map(({ release, readiness }) => (
        <div key={release.id}>
          <h2>{release.name}</h2>
          <p>Version: {release.version}</p>
          <p>Status: {release.status}</p>
          <p>
            Planned: {release.plannedStartDate} – {release.plannedEndDate}
          </p>
          {readiness && <ReadinessBadge readiness={readiness} />}
          <Link
            to={`/releases/${release.id}`}
            onClick={(event) => handleViewRelease(event, release.id)}
            aria-label={`View release ${release.name}`}
          >
            View release
          </Link>
        </div>
      ))}
    </div>
  );
}
