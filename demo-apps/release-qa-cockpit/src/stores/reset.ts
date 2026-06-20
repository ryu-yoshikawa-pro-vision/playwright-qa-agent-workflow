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

      await db.users.bulkAdd(seed.users);
      await db.sessions.bulkAdd(seed.sessions);
      await db.releases.bulkAdd(seed.releases);
      await db.releaseScopes.bulkAdd(seed.releaseScopes);
      await db.testItems.bulkAdd(seed.testItems);
      await db.testExecutions.bulkAdd(seed.testExecutions);
      await db.defects.bulkAdd(seed.defects);
      await db.risks.bulkAdd(seed.risks);
      await db.decisions.bulkAdd(seed.decisions);
      await db.evidenceItems.bulkAdd(seed.evidenceItems);
      await db.activityLogs.bulkAdd(seed.activityLogs);
      await db.demoScenarios.bulkAdd(seed.demoScenarios);

      const appSettings = seed.appSettings[0];
      appSettings.lastResetAt = new Date().toISOString();
      await db.appSettings.add(appSettings);
    },
  );
}
