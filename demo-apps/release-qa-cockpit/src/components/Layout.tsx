import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { db } from '@/db/schema';
import type { User, Release } from '@/db/types';
import { RoleSwitchPanel } from './RoleSwitchPanel';

export function Layout() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRelease, setCurrentRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    setLoading(true);
    try {
      const session = await db.sessions.get('session-default');

      if (!session?.currentUserId) {
        setCurrentUser(null);
        setCurrentRelease(null);
        navigate('/login');
        return;
      }

      const user = await db.users.get(session.currentUserId);

      if (!user) {
        setCurrentUser(null);
        setCurrentRelease(null);
        navigate('/login');
        return;
      }

      setCurrentUser(user);

      if (session.currentReleaseId) {
        const release = await db.releases.get(session.currentReleaseId);
        setCurrentRelease(release ?? null);
      } else {
        setCurrentRelease(null);
      }
    } catch {
      setCurrentUser(null);
      setCurrentRelease(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [loading, currentUser, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!currentUser) return null;

  return (
    <div>
      <header>
        <h1>Release QA Cockpit</h1>
        <RoleSwitchPanel currentUser={currentUser} onRoleChange={loadSession} />
        {currentRelease && (
          <Link to={`/releases/${currentRelease.id}`} data-testid="current-release">
            {currentRelease.name}
          </Link>
        )}
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/releases">Releases</Link>
          <Link to="/activity-log">Activity Log</Link>
          <Link to="/demo-controls">Demo Controls</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
