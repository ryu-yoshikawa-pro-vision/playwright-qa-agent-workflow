import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '@/db/schema';
import type { Defect, DefectStatus, User, UserRole } from '@/db/types';
import {
  isTransitionAllowed,
  getRequiredReasonField,
  getTransitionAction,
  getTransitionLabel,
  getFieldLabel,
} from '@/domain/transitions';
import { canMutateDefect, canMutateDefectAny, getDisabledReason } from '@/domain/roleRestrictions';

type PendingAction = {
  defectId: string;
  targetStatus: DefectStatus;
  requiredField: string;
} | null;

export function DefectTriagePage() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [reasonValue, setReasonValue] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!releaseId) return;
    setLoading(true);
    setLoadError(null);
    setActionError(null);
    try {
      const [defs, session] = await Promise.all([
        db.defects.where({ releaseId }).toArray(),
        db.sessions.get('session-default'),
      ]);
      setDefects(defs);
      if (session?.currentUserId) {
        const user = await db.users.get(session.currentUserId);
        setCurrentUser(user ?? null);
      }
    } catch {
      setLoadError('Failed to load defect data.');
    } finally {
      setLoading(false);
    }
  }, [releaseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTransitionClick = (defect: Defect, targetStatus: DefectStatus) => {
    const requiredField = getRequiredReasonField('defect', defect.status, targetStatus);
    if (requiredField) {
      setPendingAction({ defectId: defect.id, targetStatus, requiredField });
      setReasonValue('');
      return;
    }
    executeTransition(defect, targetStatus, undefined);
  };

  const handleConfirmReason = () => {
    if (!pendingAction) return;
    const defect = defects.find((d) => d.id === pendingAction.defectId);
    if (!defect) return;

    if (!reasonValue.trim()) {
      setActionError(`${getFieldLabel(pendingAction.requiredField)} is required.`);
      return;
    }

    setActionError(null);
    executeTransition(defect, pendingAction.targetStatus, reasonValue.trim());
    setPendingAction(null);
    setReasonValue('');
  };

  const handleCancelReason = () => {
    setPendingAction(null);
    setReasonValue('');
    setActionError(null);
  };

  const executeTransition = async (
    defect: Defect,
    targetStatus: DefectStatus,
    reasonValue: string | undefined,
  ) => {
    if (!currentUser || !releaseId) return;
    setActionError(null);

    try {
      await db.transaction('rw', db.defects, db.activityLogs, async () => {
        const now = new Date().toISOString();
        const latestDefect = await db.defects.get(defect.id);

        if (!latestDefect) {
          throw new Error('Defect not found.');
        }

        if (!isTransitionAllowed('defect', latestDefect.status, targetStatus)) {
          throw new Error(
            `Invalid defect transition from ${latestDefect.status} to ${targetStatus}.`,
          );
        }

        if (!canMutateDefect(currentUser!.role, latestDefect.status, targetStatus)) {
          throw new Error(
            `Current role cannot move defect from ${latestDefect.status} to ${targetStatus}.`,
          );
        }

        const beforeStatus = latestDefect.status;
        const updates: Partial<Defect> = {
          status: targetStatus,
          updatedAt: now,
        };

        if (reasonValue !== undefined) {
          const requiredField = getRequiredReasonField('defect', beforeStatus, targetStatus);
          if (requiredField === 'resolutionNote') updates.resolutionNote = reasonValue;
        }

        await db.defects.update(defect.id, updates);

        await db.activityLogs.add({
          id: crypto.randomUUID(),
          releaseId,
          actorUserId: currentUser.id,
          action: getTransitionAction('defect', targetStatus),
          targetEntityType: 'defect',
          targetEntityId: defect.id,
          summary: `${currentUser.name} moved defect "${defect.title}" from ${beforeStatus} to ${targetStatus}.`,
          createdAt: now,
        });
      });

      await loadData();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to update defect. Please try again.',
      );
    }
  };

  const getRoleDisplay = (): string => {
    if (!currentUser) return 'Unknown';
    const roleLabels: Record<UserRole, string> = {
      qaLead: 'QA Lead',
      qaMember: 'QA Member',
      releaseManager: 'Release Manager',
      viewer: 'Viewer',
    };
    return roleLabels[currentUser.role];
  };

  const statusLabelMap: Record<DefectStatus, string> = {
    open: 'Open',
    triaged: 'Triaged',
    inProgress: 'In Progress',
    fixed: 'Fixed',
    readyForRetest: 'Ready for Retest',
    reopened: 'Reopened',
    closed: 'Closed',
    wontFix: "Won't Fix",
    duplicate: 'Duplicate',
  };

  const targetStatuses: DefectStatus[] = [
    'triaged',
    'inProgress',
    'fixed',
    'readyForRetest',
    'closed',
    'reopened',
    'wontFix',
    'duplicate',
  ];

  if (loading) return <div>Loading...</div>;

  if (loadError) {
    return (
      <div>
        <h1>Defect Triage</h1>
        <p role="alert">{loadError}</p>
        <button onClick={loadData}>Retry</button>
        <Link to={`/releases/${releaseId}`}>Back to Release Overview</Link>
      </div>
    );
  }

  const userRole = currentUser?.role ?? 'viewer';
  const canMutateAny = canMutateDefectAny(userRole);
  const roleDisabledReason = getDisabledReason(userRole, 'change defect status');

  return (
    <div>
      <h1>Defect Triage</h1>
      {currentUser && <p>Current role: {getRoleDisplay()}</p>}

      {roleDisabledReason && <p>{roleDisabledReason}</p>}

      {actionError && <p role="alert">{actionError}</p>}

      {defects.length === 0 ? (
        <p>No defects found for this release.</p>
      ) : (
        defects.map((defect) => {
          const isPendingThisItem = pendingAction?.defectId === defect.id;

          return (
            <div key={defect.id} data-testid="defect-row">
              <div>
                <strong>{defect.title}</strong>
                <span> — Severity: {defect.severity}</span>
                {defect.impactsReleaseDecision && <span> — Impacts release decision</span>}
              </div>
              <div>
                Status: <span>{statusLabelMap[defect.status]}</span>
              </div>

              {canMutateAny && (
                <div>
                  {targetStatuses.map((targetStatus) => {
                    if (!isTransitionAllowed('defect', defect.status, targetStatus)) {
                      return null;
                    }
                    if (!canMutateDefect(userRole, defect.status, targetStatus)) {
                      return null;
                    }
                    const label = getTransitionLabel('defect', targetStatus, defect.title);
                    return (
                      <button
                        key={targetStatus}
                        onClick={() => handleTransitionClick(defect, targetStatus)}
                        aria-label={label}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {isPendingThisItem && (
                <div>
                  <label htmlFor={`reason-${defect.id}`}>
                    {getFieldLabel(pendingAction.requiredField)}
                  </label>
                  <input
                    id={`reason-${defect.id}`}
                    type="text"
                    value={reasonValue}
                    onChange={(e) => setReasonValue(e.target.value)}
                  />
                  <button onClick={handleConfirmReason}>Confirm</button>
                  <button onClick={handleCancelReason}>Cancel</button>
                </div>
              )}
            </div>
          );
        })
      )}

      <nav>
        <Link to={`/releases/${releaseId}`}>Back to Release Overview</Link>
      </nav>
    </div>
  );
}
