import type { ReleaseQACockpitDB } from '@/db/schema';
import { getSeedData } from './seed';

export async function demoReset(db: ReleaseQACockpitDB): Promise<void> {
  const seed = getSeedData();

  await db.transaction('rw', db.tables, async () => {
    await db.users.clear();
    await db.sessions.clear();
    await db.releases.clear();
    await db.releaseScopes.clear();
    await db.testItems.clear();
    await db.testExecutions.clear();
    await db.defects.clear();
    await db.risks.clear();
    await db.decisions.clear();
    await db.evidenceItems.clear();
    await db.activityLogs.clear();
    await db.demoScenarios.clear();
    await db.appSettings.clear();

    await db.users.bulkPut(seed.users);
    await db.sessions.bulkPut(seed.sessions);
    await db.releases.bulkPut(seed.releases);
    await db.releaseScopes.bulkPut(seed.releaseScopes);
    await db.testItems.bulkPut(seed.testItems);
    await db.testExecutions.bulkPut(seed.testExecutions);
    await db.defects.bulkPut(seed.defects);
    await db.risks.bulkPut(seed.risks);
    await db.decisions.bulkPut(seed.decisions);
    await db.evidenceItems.bulkPut(seed.evidenceItems);
    await db.activityLogs.bulkPut(seed.activityLogs);
    await db.demoScenarios.bulkPut(seed.demoScenarios);

    const appSettings = seed.appSettings[0];
    appSettings.lastResetAt = new Date().toISOString();
    await db.appSettings.put(appSettings);
  });
}
