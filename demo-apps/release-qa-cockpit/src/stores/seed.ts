import type {
  User,
  Session,
  Release,
  ReleaseScope,
  TestItem,
  TestExecution,
  Defect,
  Risk,
  Decision,
  EvidenceItem,
  ActivityLog,
  DemoScenario,
  AppSettings,
} from '@/db/types';

const FIXED_TIME = '2026-06-01T09:00:00.000Z';

export type SeedData = {
  users: User[];
  sessions: Session[];
  releases: Release[];
  releaseScopes: ReleaseScope[];
  testItems: TestItem[];
  testExecutions: TestExecution[];
  defects: Defect[];
  risks: Risk[];
  decisions: Decision[];
  evidenceItems: EvidenceItem[];
  activityLogs: ActivityLog[];
  demoScenarios: DemoScenario[];
  appSettings: AppSettings[];
};

export function getSeedData(): SeedData {
  return {
    users: [
      {
        id: 'user-qa-lead',
        name: 'QA Lead',
        role: 'qaLead',
        active: true,
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
      {
        id: 'user-qa-member',
        name: 'QA Member',
        role: 'qaMember',
        active: true,
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
      {
        id: 'user-release-manager',
        name: 'Release Manager',
        role: 'releaseManager',
        active: true,
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
      {
        id: 'user-viewer',
        name: 'Viewer',
        role: 'viewer',
        active: true,
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    sessions: [
      {
        id: 'session-default',
        currentUserId: 'user-qa-lead',
        currentReleaseId: 'rel-weekly-2026-06',
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    releases: [
      {
        id: 'rel-weekly-2026-06',
        name: 'Weekly Release 2026-06',
        version: '2026.06.1',
        status: 'inQa',
        plannedStartDate: '2026-06-01T00:00:00.000Z',
        plannedEndDate: '2026-06-30T23:59:59.000Z',
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    releaseScopes: [
      {
        id: 'scope-recording-core',
        releaseId: 'rel-weekly-2026-06',
        title: 'Recording core workflow',
        description: 'Core recording and playback workflow',
        area: 'Recording',
        inScope: true,
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
      {
        id: 'scope-export-evidence',
        releaseId: 'rel-weekly-2026-06',
        title: 'Evidence Pack export',
        description: 'Evidence Pack Markdown export functionality',
        area: 'Reporting',
        inScope: true,
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
      {
        id: 'scope-risk-review',
        releaseId: 'rel-weekly-2026-06',
        title: 'Release risk review',
        description: 'Release risk review workflow',
        area: 'Release Management',
        inScope: true,
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    testItems: [
      {
        id: 'test-recording-playback',
        releaseId: 'rel-weekly-2026-06',
        title: 'Recording playback is available after processing',
        area: 'Recording',
        priority: 'critical',
        required: true,
        expectedBehavior: 'Recording playback should be available after processing completes',
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
      {
        id: 'test-evidence-export',
        releaseId: 'rel-weekly-2026-06',
        title: 'Evidence Pack Markdown includes QA summary',
        area: 'Reporting',
        priority: 'high',
        required: true,
        expectedBehavior: 'Evidence Pack Markdown should include a QA summary section',
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
      {
        id: 'test-viewer-readonly',
        releaseId: 'rel-weekly-2026-06',
        title: 'Viewer can inspect release without mutation controls',
        area: 'Permissions',
        priority: 'medium',
        required: true,
        expectedBehavior: 'Viewer role should see release data without mutation controls',
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    testExecutions: [
      {
        id: 'exec-recording-playback',
        releaseId: 'rel-weekly-2026-06',
        testItemId: 'test-recording-playback',
        status: 'fail',
        assigneeUserId: 'user-qa-member',
        linkedDefectId: 'defect-recording-playback-fails',
        updatedAt: FIXED_TIME,
      },
      {
        id: 'exec-evidence-export',
        releaseId: 'rel-weekly-2026-06',
        testItemId: 'test-evidence-export',
        status: 'pass',
        assigneeUserId: 'user-qa-member',
        updatedAt: FIXED_TIME,
      },
      {
        id: 'exec-viewer-readonly',
        releaseId: 'rel-weekly-2026-06',
        testItemId: 'test-viewer-readonly',
        status: 'pass',
        assigneeUserId: 'user-qa-member',
        updatedAt: FIXED_TIME,
      },
    ],
    defects: [
      {
        id: 'defect-recording-playback-fails',
        releaseId: 'rel-weekly-2026-06',
        title: 'Recording playback fails after processing',
        description: 'Recording playback fails immediately after processing completes',
        severity: 'high',
        status: 'open',
        impactsReleaseDecision: true,
        linkedTestExecutionId: 'exec-recording-playback',
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    risks: [
      {
        id: 'risk-recording-regression',
        releaseId: 'rel-weekly-2026-06',
        title: 'Recording regression risk remains after fix',
        description: 'Risk of recording regression even after the fix is applied',
        impact: 'high',
        status: 'draft',
        linkedDefectId: 'defect-recording-playback-fails',
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    decisions: [],
    evidenceItems: [],
    activityLogs: [
      {
        id: 'log-seed-created',
        actorUserId: 'user-qa-lead',
        action: 'demo.seeded',
        targetEntityType: 'demoScenario',
        targetEntityId: 'scenario-weekly-release-at-risk',
        summary: 'Seeded Weekly Release At Risk Demo data.',
        createdAt: FIXED_TIME,
      },
    ],
    demoScenarios: [
      {
        id: 'scenario-weekly-release-at-risk',
        name: 'Weekly Release At Risk Demo',
        description: 'Standard demo scenario with a blocking defect and high impact risk',
        active: true,
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    appSettings: [
      {
        id: 'app-settings',
        demoMode: true,
        schemaVersion: 1,
        demoNow: '2026-06-15T12:00:00.000Z',
        updatedAt: FIXED_TIME,
      },
    ],
  };
}
