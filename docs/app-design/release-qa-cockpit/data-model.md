# Release QA Cockpit data model

This document defines the MVP IndexedDB schema and TypeScript domain model.

The implementation must not infer additional stores or rename fields without updating this document first.

## Store list

The MVP must create these stores:

```text
users
sessions
releases
releaseScopes
testItems
testExecutions
defects
risks
decisions
evidenceItems
activityLogs
demoScenarios
appSettings
```

The MVP must not create these stores:

```text
comments
reportExports
reports
reportHistory
remoteSync
integrations
attachmentsBinary
```

## Shared scalar conventions

| Convention      | Rule                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------- |
| IDs             | Use deterministic string IDs for seed data. Runtime-created records may use UUID-style strings. |
| Date/time       | Store ISO 8601 strings.                                                                         |
| Deletion        | Hard delete is allowed only during Demo Data Reset. Normal user actions should update status.   |
| Release scoping | Operational data should include `releaseId` unless it is global app configuration.              |
| Audit           | Domain mutations must create `activityLogs` entries.                                            |

## Enums

```ts
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

export type EvidenceType =
  | 'testResult'
  | 'releaseDecision'
  | 'manualNote'
  | 'externalReference';

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
```

`EvidenceType` intentionally does not include `export` in the MVP. Evidence Pack generation is an export action, not an evidence item. Persisting export artifacts or report history is out of scope unless a future design change adds a dedicated store or evidence type.

## Entity model

### User

```ts
export type User = {
  id: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### Session

```ts
export type Session = {
  id: string;
  currentUserId: string;
  currentReleaseId?: string;
  createdAt: string;
  updatedAt: string;
};
```

The MVP may keep a single session record with a deterministic ID such as `session-default`.

Role switch actions must update this record and create an `activityLogs` record with `targetEntityType: 'session'`.

### Release

```ts
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
```

Readiness must not be stored on `Release`. It must be calculated from current release state.

### ReleaseScope

```ts
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
```

### TestItem

```ts
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
```

### TestExecution

```ts
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
```

`skipReason` is required when `status` is `skipped`.

`blockedReason` is required when `status` is `blocked`.

### Defect

```ts
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
```

A defect is a blocking defect when:

- `status` is included in `unresolvedBlockingDefectStatuses`
- and either severity is `critical` or `high`, or `impactsReleaseDecision` is `true`

`resolutionNote` is required when `status` is `wontFix` or `duplicate`.

### Risk

```ts
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
```

`acceptedReason` is required when `status` is `accepted`.

`rejectedReason` is required when `status` is `rejected`.

`mitigationNote` is required when `status` is `mitigated`.

### Decision

```ts
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
```

`readinessSnapshot` must capture the result at save time.

### EvidenceItem

```ts
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
```

Only `type: 'testResult'` satisfies the Test Result evidence readiness condition.

`manualNote` and `externalReference` do not satisfy that condition by themselves.

Evidence Pack generation must not create an `EvidenceItem` in the MVP. It must create an `activityLogs` entry only.

### ActivityLog

```ts
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
```

### DemoScenario

```ts
export type DemoScenario = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### AppSettings

```ts
export type AppSettings = {
  id: string;
  demoMode: boolean;
  schemaVersion: number;
  demoNow?: string;
  lastResetAt?: string;
  updatedAt: string;
};
```

`demoNow` is a deterministic clock override for demo-mode readiness checks. When `demoNow` is present, schedule-based readiness conditions must use it instead of the host system clock.

## Readiness result types

```ts
export type ReadinessConditionSeverity = 'blocker' | 'warning';

export type ReadinessConditionSource =
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
```

## Dexie schema

The implementation should use this index shape unless there is a documented reason to change it:

```ts
db.version(1).stores({
  users: 'id, role, active',
  sessions: 'id, currentUserId, currentReleaseId',
  releases: 'id, status, updatedAt',
  releaseScopes: 'id, releaseId, area, inScope',
  testItems: 'id, releaseId, area, priority, required',
  testExecutions: 'id, releaseId, testItemId, status, assigneeUserId, linkedDefectId',
  defects: 'id, releaseId, severity, status, impactsReleaseDecision, linkedTestExecutionId',
  risks: 'id, releaseId, impact, status, linkedDefectId',
  decisions: 'id, releaseId, decision, createdAt',
  evidenceItems: 'id, releaseId, type, sourceEntityType, sourceEntityId, createdAt',
  activityLogs: 'id, releaseId, actorUserId, targetEntityType, createdAt',
  demoScenarios: 'id, active',
  appSettings: 'id',
});
```

## Relationship rules

| Relationship                   | Rule                                                              |
| ------------------------------ | ----------------------------------------------------------------- |
| `TestExecution.testItemId`     | Must refer to a `TestItem` in the same release.                   |
| `Defect.linkedTestExecutionId` | Must refer to a `TestExecution` in the same release when present. |
| `Risk.linkedDefectId`          | Must refer to a `Defect` in the same release when present.        |
| `Decision.releaseId`           | Must refer to the release being decided.                          |
| `EvidenceItem.sourceEntityId`  | Must match `sourceEntityType` when present.                       |
| `ActivityLog.targetEntityId`   | Should refer to the changed entity when present.                  |

## Activity logging rules

Create an `activityLogs` entry when a user:

- switches current role
- switches current release
- changes a test execution status
- creates Test Result evidence
- changes a defect status
- changes a risk status
- saves a release decision
- exports an Evidence Pack
- resets demo data

Evidence Pack export activity logs must use `targetEntityType: 'evidencePack'`.

Do not create activity logs for passive page navigation.

## Validation rules

The implementation must validate these rules before saving:

| Entity          | Rule                                                           |
| --------------- | -------------------------------------------------------------- |
| `TestExecution` | `blocked` requires `blockedReason`.                            |
| `TestExecution` | `skipped` requires `skipReason`.                               |
| `Defect`        | `wontFix` requires `resolutionNote`.                           |
| `Defect`        | `duplicate` requires `resolutionNote`.                         |
| `Risk`          | `accepted` requires `acceptedReason`.                          |
| `Risk`          | `rejected` requires `rejectedReason`.                          |
| `Risk`          | `mitigated` requires `mitigationNote`.                         |
| `Decision`      | `qaCompletionComment` is required for Ready and At Risk saves. |
| `Decision`      | `decisionComment` is required for At Risk and Not Ready saves. |
| `EvidenceItem`  | `testResult` evidence must include `contentMarkdown`.          |

## Completion criteria

This data model is implemented when:

- all MVP stores exist
- no out-of-scope stores exist
- entity fields match this document
- seed data uses deterministic IDs
- reset clears all MVP stores and restores deterministic records
- readiness and screen logic do not duplicate incompatible model definitions
