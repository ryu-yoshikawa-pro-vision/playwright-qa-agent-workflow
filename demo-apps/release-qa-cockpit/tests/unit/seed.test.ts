import { describe, it, expect } from 'vitest';
import { getSeedData } from '../../src/stores/seed';

describe('getSeedData', () => {
  const seed = getSeedData();

  it('returns deterministic user records', () => {
    expect(seed.users).toHaveLength(4);
    const qaLead = seed.users.find((u) => u.id === 'user-qa-lead');
    expect(qaLead).toBeDefined();
    expect(qaLead!.name).toBe('QA Lead');
    expect(qaLead!.role).toBe('qaLead');
  });

  it('returns default session with QA Lead and weekly release', () => {
    expect(seed.sessions).toHaveLength(1);
    const session = seed.sessions[0];
    expect(session.currentUserId).toBe('user-qa-lead');
    expect(session.currentReleaseId).toBe('rel-weekly-2026-06');
  });

  it('returns the weekly release', () => {
    const release = seed.releases.find((r) => r.id === 'rel-weekly-2026-06');
    expect(release).toBeDefined();
    expect(release!.status).toBe('inQa');
    expect(release!.version).toBe('2026.06.1');
  });

  it('returns three test items, all required', () => {
    expect(seed.testItems).toHaveLength(3);
    expect(seed.testItems.every((ti) => ti.required)).toBe(true);
  });

  it('returns one failing test execution', () => {
    const failExec = seed.testExecutions.find((te) => te.status === 'fail');
    expect(failExec).toBeDefined();
    expect(failExec!.testItemId).toBe('test-recording-playback');
    expect(failExec!.linkedDefectId).toBe('defect-recording-playback-fails');
  });

  it('returns one open High defect', () => {
    const defect = seed.defects[0];
    expect(defect.severity).toBe('high');
    expect(defect.status).toBe('open');
    expect(defect.impactsReleaseDecision).toBe(true);
  });

  it('returns one High risk in draft', () => {
    const risk = seed.risks[0];
    expect(risk.impact).toBe('high');
    expect(risk.status).toBe('draft');
  });

  it('returns empty decisions array', () => {
    expect(seed.decisions).toEqual([]);
  });

  it('returns empty evidenceItems array', () => {
    expect(seed.evidenceItems).toEqual([]);
  });

  it('returns one activity log entry', () => {
    expect(seed.activityLogs).toHaveLength(1);
    expect(seed.activityLogs[0].id).toBe('log-seed-created');
  });

  it('returns app settings with deterministic demoNow', () => {
    const settings = seed.appSettings[0];
    expect(settings.demoNow).toBe('2026-06-15T12:00:00.000Z');
    expect(settings.schemaVersion).toBe(1);
  });
});
