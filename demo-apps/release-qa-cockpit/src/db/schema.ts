import Dexie, { type EntityTable } from 'dexie';
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
} from './types';

export class ReleaseQACockpitDB extends Dexie {
  users!: EntityTable<User, 'id'>;
  sessions!: EntityTable<Session, 'id'>;
  releases!: EntityTable<Release, 'id'>;
  releaseScopes!: EntityTable<ReleaseScope, 'id'>;
  testItems!: EntityTable<TestItem, 'id'>;
  testExecutions!: EntityTable<TestExecution, 'id'>;
  defects!: EntityTable<Defect, 'id'>;
  risks!: EntityTable<Risk, 'id'>;
  decisions!: EntityTable<Decision, 'id'>;
  evidenceItems!: EntityTable<EvidenceItem, 'id'>;
  activityLogs!: EntityTable<ActivityLog, 'id'>;
  demoScenarios!: EntityTable<DemoScenario, 'id'>;
  appSettings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('ReleaseQACockpit');
    this.version(1).stores({
      users: 'id, role, active',
      sessions: 'id, currentUserId, currentReleaseId',
      releases: 'id, status, updatedAt',
      releaseScopes: 'id, releaseId, area, inScope',
      testItems: 'id, releaseId, area, priority, required',
      testExecutions:
        'id, releaseId, testItemId, status, assigneeUserId, linkedDefectId',
      defects: 'id, releaseId, severity, status, impactsReleaseDecision, linkedTestExecutionId',
      risks: 'id, releaseId, impact, status, linkedDefectId',
      decisions: 'id, releaseId, decision, createdAt',
      evidenceItems: 'id, releaseId, type, sourceEntityType, sourceEntityId, createdAt',
      activityLogs: 'id, releaseId, actorUserId, targetEntityType, createdAt',
      demoScenarios: 'id, active',
      appSettings: 'id',
    });
  }
}

export const db = new ReleaseQACockpitDB();
