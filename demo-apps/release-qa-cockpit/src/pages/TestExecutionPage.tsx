import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '@/db/schema';
import type { TestItem, TestExecution, TestExecutionStatus, User, UserRole } from '@/db/types';
import {
  isTransitionAllowed,
  getRequiredReasonField,
  getTransitionAction,
  getTransitionLabel,
  getFieldLabel,
} from '@/domain/transitions';
import {
  canMutateTestExecution,
  canMutateTestExecutionStatus,
  canCreateEvidence,
  getDisabledReason,
} from '@/domain/roleRestrictions';

type PendingAction = {
  testItemId: string;
  executionId: string;
  targetStatus: TestExecutionStatus;
  requiredField: string;
} | null;

export function TestExecutionPage() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
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
      const [items, execs, session] = await Promise.all([
        db.testItems.where({ releaseId }).toArray(),
        db.testExecutions.where({ releaseId }).toArray(),
        db.sessions.get('session-default'),
      ]);
      setTestItems(items);
      setExecutions(execs);
      if (session?.currentUserId) {
        const user = await db.users.get(session.currentUserId);
        setCurrentUser(user ?? null);
      }
    } catch {
      setLoadError('Failed to load test execution data.');
    } finally {
      setLoading(false);
    }
  }, [releaseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getExecution = (testItemId: string): TestExecution | undefined =>
    executions.find((e) => e.testItemId === testItemId);

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

  const handleTransitionClick = (
    testItem: TestItem,
    execution: TestExecution,
    targetStatus: TestExecutionStatus,
  ) => {
    const requiredField = getRequiredReasonField('testExecution', execution.status, targetStatus);
    if (requiredField) {
      setPendingAction({
        testItemId: testItem.id,
        executionId: execution.id,
        targetStatus,
        requiredField,
      });
      setReasonValue('');
      return;
    }
    executeTransition(execution, targetStatus, testItem.title, undefined);
  };

  const handleConfirmReason = () => {
    if (!pendingAction) return;
    const execution = executions.find((e) => e.id === pendingAction.executionId);
    if (!execution) return;
    const testItem = testItems.find((t) => t.id === pendingAction.testItemId);
    if (!testItem) return;

    if (!reasonValue.trim()) {
      setActionError(`${getFieldLabel(pendingAction.requiredField)} is required.`);
      return;
    }

    setActionError(null);
    executeTransition(execution, pendingAction.targetStatus, testItem.title, reasonValue.trim());
    setPendingAction(null);
    setReasonValue('');
  };

  const handleCancelReason = () => {
    setPendingAction(null);
    setReasonValue('');
    setActionError(null);
  };

  const executeTransition = async (
    execution: TestExecution,
    targetStatus: TestExecutionStatus,
    testTitle: string,
    reasonValue: string | undefined,
  ) => {
    if (!currentUser || !releaseId) return;
    setActionError(null);

    try {
      await db.transaction('rw', db.testExecutions, db.activityLogs, async () => {
        const now = new Date().toISOString();
        const latestExecution = await db.testExecutions.get(execution.id);

        if (!latestExecution) {
          throw new Error('Test execution not found.');
        }

        if (!isTransitionAllowed('testExecution', latestExecution.status, targetStatus)) {
          throw new Error(
            `Invalid test execution transition from ${latestExecution.status} to ${targetStatus}.`,
          );
        }

        if (
          !canMutateTestExecutionStatus(currentUser!.role, latestExecution.status, targetStatus)
        ) {
          throw new Error('Current role cannot update test executions.');
        }

        const beforeStatus = latestExecution.status;
        const updates: Partial<TestExecution> = {
          status: targetStatus,
          updatedAt: now,
        };

        if (reasonValue !== undefined) {
          const requiredField = getRequiredReasonField('testExecution', beforeStatus, targetStatus);
          if (requiredField === 'skipReason') updates.skipReason = reasonValue;
          if (requiredField === 'blockedReason') updates.blockedReason = reasonValue;
        }

        if (targetStatus === 'pass' || targetStatus === 'fail') {
          updates.completedAt = now;
        }
        if (targetStatus === 'inProgress') {
          updates.startedAt = now;
          updates.completedAt = undefined;
        }
        if (targetStatus === 'retest') {
          updates.startedAt = now;
          updates.completedAt = undefined;
        }
        if (targetStatus === 'blocked' || targetStatus === 'skipped') {
          updates.completedAt = undefined;
        }

        await db.testExecutions.update(execution.id, updates);

        await db.activityLogs.add({
          id: crypto.randomUUID(),
          releaseId,
          actorUserId: currentUser.id,
          action: getTransitionAction('testExecution', targetStatus),
          targetEntityType: 'testExecution',
          targetEntityId: execution.id,
          summary: `${currentUser.name} moved test "${testTitle}" from ${beforeStatus} to ${targetStatus}.`,
          createdAt: now,
        });
      });

      await loadData();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to update test execution. Please try again.',
      );
    }
  };

  const handleCreateEvidence = async (execution: TestExecution, testItem: TestItem) => {
    if (!currentUser || !releaseId) return;
    setActionError(null);
    const canCreateForStatus = execution.status === 'pass' || execution.status === 'fail';
    if (!canCreateForStatus) {
      setActionError('Evidence can only be created for passed or failed tests.');
      return;
    }
    try {
      await db.transaction('rw', db.evidenceItems, db.activityLogs, async () => {
        const now = new Date().toISOString();
        const evidenceId = crypto.randomUUID();
        await db.evidenceItems.add({
          id: evidenceId,
          releaseId,
          type: 'testResult',
          title: `Test Result: ${testItem.title}`,
          contentMarkdown: `Test "${testItem.title}" completed with status: ${execution.status}.`,
          sourceEntityType: 'testExecution',
          sourceEntityId: execution.id,
          createdByUserId: currentUser.id,
          createdAt: now,
        });
        await db.activityLogs.add({
          id: crypto.randomUUID(),
          releaseId,
          actorUserId: currentUser.id,
          action: 'evidence.testResult.created',
          targetEntityType: 'evidenceItems',
          targetEntityId: evidenceId,
          summary: `${currentUser.name} created Test Result evidence for "${testItem.title}".`,
          createdAt: now,
        });
      });
      await loadData();
    } catch {
      setActionError('Failed to create evidence. Please try again.');
    }
  };

  const statusLabelMap: Record<TestExecutionStatus, string> = {
    notStarted: 'Not Started',
    inProgress: 'In Progress',
    pass: 'Passed',
    fail: 'Failed',
    blocked: 'Blocked',
    skipped: 'Skipped',
    retest: 'Retest',
  };

  if (loading) return <div>Loading...</div>;

  if (loadError) {
    return (
      <div>
        <h1>Test Execution</h1>
        <p role="alert">{loadError}</p>
        <button onClick={loadData}>Retry</button>
        <Link to={`/releases/${releaseId}`}>Back to Release Overview</Link>
      </div>
    );
  }

  const userRole = currentUser?.role ?? 'viewer';
  const canMutate = canMutateTestExecution(userRole);
  const canCreateEv = canCreateEvidence(userRole);
  const roleDisabledReason = getDisabledReason(userRole, 'update test executions');

  return (
    <div>
      <h1>Test Execution</h1>
      {currentUser && <p>Current role: {getRoleDisplay()}</p>}

      {roleDisabledReason && <p>{roleDisabledReason}</p>}

      {actionError && <p role="alert">{actionError}</p>}

      {testItems.length === 0 ? (
        <p>No test items found for this release.</p>
      ) : (
        testItems.map((item) => {
          const execution = getExecution(item.id);
          const currentStatus = execution?.status ?? null;
          const isPendingThisItem = pendingAction?.testItemId === item.id;

          return (
            <div key={item.id} data-testid="test-execution-row">
              <div>
                <strong>{item.title}</strong>
                <span> ({item.area})</span>
                {item.required && <span> — Required</span>}
                <span> — Priority: {item.priority}</span>
              </div>
              <div>
                Status:{' '}
                <span>{currentStatus ? statusLabelMap[currentStatus] : 'No execution'}</span>
                {execution?.assigneeUserId && <span> — Assigned</span>}
              </div>

              {execution && currentStatus && canMutate && (
                <div>
                  {(
                    [
                      'inProgress',
                      'pass',
                      'fail',
                      'blocked',
                      'skipped',
                      'retest',
                    ] as TestExecutionStatus[]
                  ).map((targetStatus) => {
                    if (!isTransitionAllowed('testExecution', currentStatus, targetStatus)) {
                      return null;
                    }
                    const label = getTransitionLabel('testExecution', targetStatus, item.title);
                    return (
                      <button
                        key={targetStatus}
                        onClick={() => handleTransitionClick(item, execution, targetStatus)}
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
                  <label htmlFor={`reason-${item.id}`}>
                    {getFieldLabel(pendingAction.requiredField)}
                  </label>
                  <input
                    id={`reason-${item.id}`}
                    type="text"
                    value={reasonValue}
                    onChange={(e) => setReasonValue(e.target.value)}
                  />
                  <button onClick={handleConfirmReason}>Confirm</button>
                  <button onClick={handleCancelReason}>Cancel</button>
                </div>
              )}

              {execution &&
                canCreateEv &&
                (execution.status === 'pass' || execution.status === 'fail') && (
                  <button
                    onClick={() => handleCreateEvidence(execution, item)}
                    aria-label={`Create Test Result evidence for ${item.title}`}
                  >
                    Create Test Result evidence for {item.title}
                  </button>
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
