import { useEffect, useState } from 'react';
import { db } from '@/db/schema';
import type { User } from '@/db/types';

type Props = {
  currentUser: User | null;
  onRoleChange: () => void;
};

export function RoleSwitchPanel({ currentUser, onRoleChange }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    db.users.toArray().then(setUsers);
  }, []);

  const handleRoleSwitch = async (userId: string) => {
    setSwitching(true);
    try {
      const session = await db.sessions.get('session-default');
      if (session) {
        await db.sessions.update('session-default', {
          currentUserId: userId,
          updatedAt: new Date().toISOString(),
        });
      }
      await db.activityLogs.add({
        id: crypto.randomUUID(),
        actorUserId: userId,
        action: 'role.changed',
        targetEntityType: 'session',
        targetEntityId: 'session-default',
        summary: `Role switched to ${userId}`,
        createdAt: new Date().toISOString(),
      });
      onRoleChange();
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div>
      {currentUser && (
        <span data-testid="current-role">
          Current role: {currentUser.name}
        </span>
      )}
      {users.map((user) => {
        const isActive = currentUser?.id === user.id;
        return (
          <button
            key={user.id}
            onClick={() => handleRoleSwitch(user.id)}
            disabled={isActive || switching}
            aria-pressed={isActive}
          >
            Continue as {user.name}
          </button>
        );
      })}
    </div>
  );
}
