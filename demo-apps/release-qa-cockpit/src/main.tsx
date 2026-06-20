import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { db } from './db/schema';
import { getSeedData } from './stores/seed';

async function initializeApp() {
  const count = await db.releases.count();
  if (count === 0) {
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

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

initializeApp().catch(console.error);
