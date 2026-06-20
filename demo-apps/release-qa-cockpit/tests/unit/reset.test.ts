import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db/schema';
import { demoReset } from '../../src/stores/reset';
import { clearDb, seedDb } from './helpers';

beforeEach(async () => {
  await clearDb();
  await seedDb();
});

describe('demoReset', () => {
  it('restores seed data after reset', async () => {
    await db.testExecutions.update('exec-recording-playback', { status: 'pass' });
    await db.activityLogs.add({
      id: 'custom-log-1',
      actorUserId: 'user-qa-lead',
      action: 'test.execution.updated',
      targetEntityType: 'testExecution',
      targetEntityId: 'exec-recording-playback',
      summary: 'QA Lead set test to pass',
      createdAt: new Date().toISOString(),
    });
    await db.evidenceItems.add({
      id: 'ev-reset-test',
      releaseId: 'rel-weekly-2026-06',
      type: 'testResult',
      title: 'Pre-reset evidence',
      contentMarkdown: 'Should be cleared',
      sourceEntityType: 'testExecution',
      sourceEntityId: 'exec-recording-playback',
      createdByUserId: 'user-qa-lead',
      createdAt: new Date().toISOString(),
    });

    await demoReset(db);

    const users = await db.users.toArray();
    expect(users).toHaveLength(4);

    const exec = await db.testExecutions.get('exec-recording-playback');
    expect(exec!.status).toBe('fail');

    const logs = await db.activityLogs.toArray();
    expect(logs).toHaveLength(1);
    expect(logs[0].id).toBe('log-seed-created');

    const evidenceItems = await db.evidenceItems.toArray();
    expect(evidenceItems).toHaveLength(0);

    const decisions = await db.decisions.toArray();
    expect(decisions).toHaveLength(0);

    const settings = await db.appSettings.get('app-settings');
    expect(settings).toBeDefined();
    expect(settings!.demoNow).toBe('2026-06-15T12:00:00.000Z');
    expect(settings!.lastResetAt).toBeDefined();
  });
});
