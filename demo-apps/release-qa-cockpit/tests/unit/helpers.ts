import { db } from '../../src/db/schema';
import { getSeedData } from '../../src/stores/seed';

export async function clearDb() {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
}

export async function seedDb() {
  const seed = getSeedData();

  await db.transaction('rw', db.tables, async () => {
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
    await db.appSettings.bulkPut(seed.appSettings);
  });
}
