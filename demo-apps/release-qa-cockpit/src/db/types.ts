export type UserRole = 'qaLead' | 'qaMember' | 'releaseManager' | 'viewer';

export type ReleaseStatus = 'draft' | 'inQa' | 'decisionPending' | 'decided' | 'archived';

export type ReleaseReadiness = 'ready' | 'atRisk' | 'notReady';

export type ReleaseDecisionType = 'ready' | 'atRisk' | 'notReady';

export type TestPriority = 'critical' | 'high' | 'medium' | 'low';

export type TestExecutionStatus =
  | 'notStarted'
  | 'inProgress'
  | 'pass'
  | 'fail'
  | 'blocked'
  | 'skipped'
  | 'retest';

export type DefectSeverity = 'critical' | 'high' | 'medium' | 'low';

export type DefectStatus =
  | 'open'
  | 'triaged'
  | 'inProgress'
  | 'fixed'
  | 'readyForRetest'
  | 'reopened'
  | 'closed'
  | 'wontFix'
  | 'duplicate';

export type RiskImpact = 'high' | 'medium' | 'low';

export type RiskStatus =
  | 'draft'
  | 'pendingApproval'
  | 'accepted'
  | 'rejected'
  | 'mitigated'
  | 'closed';

export type EvidenceType = 'testResult' | 'releaseDecision' | 'manualNote' | 'externalReference';

export type SourceEntityType =
  | 'release'
  | 'testExecution'
  | 'defect'
  | 'risk'
  | 'decision'
  | 'evidencePack'
  | 'demoScenario'
  | 'user'
  | 'session'
  | 'appSettings';

export type User = {
  id: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  currentUserId: string;
  currentReleaseId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Release = {
  id: string;
  name: string;
  version: string;
  status: ReleaseStatus;
  plannedStartDate: string;
  plannedEndDate: string;
  createdAt: string;
  updatedAt: string;
};

export type ReleaseScope = {
  id: string;
  releaseId: string;
  title: string;
  description: string;
  area: string;
  inScope: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TestItem = {
  id: string;
  releaseId: string;
  title: string;
  area: string;
  priority: TestPriority;
  required: boolean;
  expectedBehavior: string;
  createdAt: string;
  updatedAt: string;
};

export type TestExecution = {
  id: string;
  releaseId: string;
  testItemId: string;
  status: TestExecutionStatus;
  assigneeUserId?: string;
  resultNote?: string;
  blockedReason?: string;
  skipReason?: string;
  linkedDefectId?: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
};

export type Defect = {
  id: string;
  releaseId: string;
  title: string;
  description: string;
  severity: DefectSeverity;
  status: DefectStatus;
  impactsReleaseDecision: boolean;
  linkedTestExecutionId?: string;
  ownerUserId?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type Risk = {
  id: string;
  releaseId: string;
  title: string;
  description: string;
  impact: RiskImpact;
  status: RiskStatus;
  ownerUserId?: string;
  acceptedReason?: string;
  rejectedReason?: string;
  mitigationNote?: string;
  linkedDefectId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Decision = {
  id: string;
  releaseId: string;
  decision: ReleaseDecisionType;
  qaCompletionComment: string;
  decisionComment: string;
  readinessSnapshot: ReadinessResult;
  decidedByUserId: string;
  createdAt: string;
};

export type EvidenceItem = {
  id: string;
  releaseId: string;
  type: EvidenceType;
  title: string;
  contentMarkdown: string;
  sourceEntityType?: SourceEntityType;
  sourceEntityId?: string;
  createdByUserId: string;
  createdAt: string;
};

export type ActivityLog = {
  id: string;
  releaseId?: string;
  actorUserId: string;
  action: string;
  targetEntityType: SourceEntityType;
  targetEntityId?: string;
  summary: string;
  createdAt: string;
};

export type DemoScenario = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AppSettings = {
  id: string;
  demoMode: boolean;
  schemaVersion: number;
  demoNow?: string;
  lastResetAt?: string;
  updatedAt: string;
};

export const unresolvedBlockingDefectStatuses = [
  'open',
  'triaged',
  'inProgress',
  'fixed',
  'readyForRetest',
  'reopened',
] as const;

export type ReadinessConditionSeverity = 'blocker' | 'warning';

export type ReadinessConditionSource =
  | 'testItem'
  | 'testExecution'
  | 'defect'
  | 'risk'
  | 'decision'
  | 'evidence'
  | 'schedule';

export type ReadinessCondition = {
  id: string;
  severity: ReadinessConditionSeverity;
  message: string;
  sourceType: ReadinessConditionSource;
  sourceId?: string;
};

export type ReadinessResult = {
  readiness: ReleaseReadiness;
  unmetConditions: ReadinessCondition[];
  warningConditions: ReadinessCondition[];
};

export type ReadinessDraftInput = {
  qaCompletionComment?: string;
  decisionComment?: string;
};

export type ReadinessSnapshot = {
  release: Release;
  testItems: TestItem[];
  testExecutions: TestExecution[];
  defects: Defect[];
  risks: Risk[];
  decisions: Decision[];
  evidenceItems: EvidenceItem[];
  appSettings: AppSettings;
};
