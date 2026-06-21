import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '@/db/schema';
import type { Risk, RiskStatus, User, UserRole } from '@/db/types';
import {
  isTransitionAllowed,
  getRequiredReasonField,
  getTransitionAction,
  getTransitionLabel,
  getFieldLabel,
} from '@/domain/transitions';
import { canMutateRisk, canMutateRiskAny, getDisabledReason } from '@/domain/roleRestrictions';

type PendingAction = {
  riskId: string;
  targetStatus: RiskStatus;
  requiredField: string;
} | null;

export function RiskReviewPage() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const [risks, setRisks] = useState<Risk[]>([]);
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
      const [rks, session] = await Promise.all([
        db.risks.where({ releaseId }).toArray(),
        db.sessions.get('session-default'),
      ]);
      setRisks(rks);
      if (session?.currentUserId) {
        const user = await db.users.get(session.currentUserId);
        setCurrentUser(user ?? null);
      }
    } catch {
      setLoadError('Failed to load risk data.');
    } finally {
      setLoading(false);
    }
  }, [releaseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTransitionClick = (risk: Risk, targetStatus: RiskStatus) => {
    const requiredField = getRequiredReasonField('risk', risk.status, targetStatus);
    if (requiredField) {
      setPendingAction({ riskId: risk.id, targetStatus, requiredField });
      setReasonValue('');
      return;
    }
    executeTransition(risk, targetStatus, undefined);
  };

  const handleConfirmReason = () => {
    if (!pendingAction) return;
    const risk = risks.find((r) => r.id === pendingAction.riskId);
    if (!risk) return;

    if (!reasonValue.trim()) {
      setActionError(`${getFieldLabel(pendingAction.requiredField)} is required.`);
      return;
    }

    setActionError(null);
    executeTransition(risk, pendingAction.targetStatus, reasonValue.trim());
    setPendingAction(null);
    setReasonValue('');
  };

  const handleCancelReason = () => {
    setPendingAction(null);
    setReasonValue('');
    setActionError(null);
  };

  const executeTransition = async (
    risk: Risk,
    targetStatus: RiskStatus,
    reasonValue: string | undefined,
  ) => {
    if (!currentUser || !releaseId) return;
    setActionError(null);

    try {
      await db.transaction('rw', db.risks, db.activityLogs, async () => {
        const now = new Date().toISOString();
        const latestRisk = await db.risks.get(risk.id);

        if (!latestRisk) {
          throw new Error('Risk not found.');
        }

        if (!isTransitionAllowed('risk', latestRisk.status, targetStatus)) {
          throw new Error(`Invalid risk transition from ${latestRisk.status} to ${targetStatus}.`);
        }

        if (!canMutateRisk(currentUser!.role, latestRisk.status, targetStatus)) {
          throw new Error(
            `Current role cannot move risk from ${latestRisk.status} to ${targetStatus}.`,
          );
        }

        const beforeStatus = latestRisk.status;
        const updates: Partial<Risk> = {
          status: targetStatus,
          updatedAt: now,
        };

        if (reasonValue !== undefined) {
          const requiredField = getRequiredReasonField('risk', beforeStatus, targetStatus);
          if (requiredField === 'acceptedReason') updates.acceptedReason = reasonValue;
          if (requiredField === 'rejectedReason') updates.rejectedReason = reasonValue;
          if (requiredField === 'mitigationNote') updates.mitigationNote = reasonValue;
        }

        await db.risks.update(risk.id, updates);

        await db.activityLogs.add({
          id: crypto.randomUUID(),
          releaseId,
          actorUserId: currentUser.id,
          action: getTransitionAction('risk', targetStatus),
          targetEntityType: 'risk',
          targetEntityId: risk.id,
          summary: `${currentUser.name} moved risk "${risk.title}" from ${beforeStatus} to ${targetStatus}.`,
          createdAt: now,
        });
      });

      await loadData();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to update risk. Please try again.',
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

  const statusLabelMap: Record<RiskStatus, string> = {
    draft: 'Draft',
    pendingApproval: 'Pending Approval',
    accepted: 'Accepted',
    rejected: 'Rejected',
    mitigated: 'Mitigated',
    closed: 'Closed',
  };

  const targetStatuses: RiskStatus[] = [
    'pendingApproval',
    'accepted',
    'rejected',
    'mitigated',
    'closed',
  ];

  if (loading) return <div>Loading...</div>;

  if (loadError) {
    return (
      <div>
        <h1>Risk Review</h1>
        <p role="alert">{loadError}</p>
        <button onClick={loadData}>Retry</button>
        <Link to={`/releases/${releaseId}`}>Back to Release Overview</Link>
      </div>
    );
  }

  const userRole = currentUser?.role ?? 'viewer';
  const canMutateAny = canMutateRiskAny(userRole);
  const roleDisabledReason = getDisabledReason(userRole, 'change risk status');

  return (
    <div>
      <h1>Risk Review</h1>
      {currentUser && <p>Current role: {getRoleDisplay()}</p>}

      {roleDisabledReason && <p>{roleDisabledReason}</p>}

      {actionError && <p role="alert">{actionError}</p>}

      {risks.length === 0 ? (
        <p>No risks found for this release.</p>
      ) : (
        risks.map((risk) => {
          const isPendingThisItem = pendingAction?.riskId === risk.id;

          return (
            <div key={risk.id} data-testid="risk-row">
              <div>
                <strong>{risk.title}</strong>
                <span> — Impact: {risk.impact}</span>
              </div>
              <div>
                Status: <span>{statusLabelMap[risk.status]}</span>
              </div>

              {canMutateAny && (
                <div>
                  {targetStatuses.map((targetStatus) => {
                    if (!isTransitionAllowed('risk', risk.status, targetStatus)) {
                      return null;
                    }
                    if (!canMutateRisk(userRole, risk.status, targetStatus)) {
                      return null;
                    }
                    const label = getTransitionLabel('risk', targetStatus, risk.title);
                    return (
                      <button
                        key={targetStatus}
                        onClick={() => handleTransitionClick(risk, targetStatus)}
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
                  <label htmlFor={`reason-${risk.id}`}>
                    {getFieldLabel(pendingAction.requiredField)}
                  </label>
                  <input
                    id={`reason-${risk.id}`}
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
