import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/db/schema';
import type { User } from '@/db/types';

export function LoginPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    db.users
      .toArray()
      .then((result) => {
        if (result.length === 0) {
          setError('Demo data is missing');
        } else {
          setUsers(result);
        }
      })
      .catch(() => {
        setError('Failed to load users. Please reset demo data and try again.');
      });
  }, []);

  const handleSelect = async (user: User) => {
    try {
      await db.transaction('rw', db.sessions, db.activityLogs, async () => {
        const session = await db.sessions.get('session-default');

        if (!session) {
          throw new Error('Default session is missing.');
        }

        await db.sessions.put({
          ...session,
          currentUserId: user.id,
          updatedAt: new Date().toISOString(),
        });

        await db.activityLogs.add({
          id: crypto.randomUUID(),
          actorUserId: user.id,
          action: 'role.changed',
          targetEntityType: 'session',
          targetEntityId: 'session-default',
          summary: `Role switched to ${user.name}`,
          createdAt: new Date().toISOString(),
        });
      });

      navigate('/');
    } catch {
      setError('Failed to switch role. Please reset demo data and try again.');
    }
  };

  if (error) {
    return (
      <div>
        <h1>Select role</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/demo-controls')}>Reset demo data</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Select role</h1>
      {users.map((user) => (
        <button key={user.id} onClick={() => handleSelect(user)}>
          Continue as {user.name}
        </button>
      ))}
    </div>
  );
}
