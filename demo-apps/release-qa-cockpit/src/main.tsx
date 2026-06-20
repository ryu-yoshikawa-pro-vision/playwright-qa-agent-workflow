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
      await db.users.bulkAdd(seed.users);
      await db.sessions.bulkAdd(seed.sessions);
      await db.releases.bulkAdd(seed.releases);
      await db.releaseScopes.bulkAdd(seed.releaseScopes);
      await db.testItems.bulkAdd(seed.testItems);
      await db.testExecutions.bulkAdd(seed.testExecutions);
      await db.defects.bulkAdd(seed.defects);
      await db.risks.bulkAdd(seed.risks);
      await db.activityLogs.bulkAdd(seed.activityLogs);
      await db.demoScenarios.bulkAdd(seed.demoScenarios);
      await db.appSettings.bulkAdd(seed.appSettings);
    });
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

initializeApp().catch(console.error);
