import { useState, useEffect } from 'react';
import { db } from '@/db/schema';
import { demoReset } from '@/stores/reset';

export function DemoControlsPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [scenarioName, setScenarioName] = useState<string>('');
  const [lastReset, setLastReset] = useState<string | undefined>();

  useEffect(() => {
    db.demoScenarios.get('scenario-weekly-release-at-risk').then((scenario) => {
      if (scenario) setScenarioName(scenario.name);
    });
    db.appSettings.get('app-settings').then((settings) => {
      if (settings?.lastResetAt) setLastReset(settings.lastResetAt);
    });
  }, []);

  const handleReset = async () => {
    await demoReset(db);
    setShowConfirm(false);
    setResetComplete(true);

    const settings = await db.appSettings.get('app-settings');
    if (settings?.lastResetAt) setLastReset(settings.lastResetAt);

    setTimeout(() => setResetComplete(false), 5000);
  };

  return (
    <div>
      <h1>Demo Controls</h1>

      {scenarioName && <p>Current scenario: {scenarioName}</p>}
      {lastReset && <p>Last reset: {lastReset}</p>}

      {!showConfirm && (
        <button onClick={() => setShowConfirm(true)}>
          Reset demo data
        </button>
      )}

      {showConfirm && (
        <div role="dialog" aria-label="Confirm demo data reset" aria-modal="true">
          <h2>Confirm demo data reset</h2>
          <button onClick={handleReset}>Confirm reset demo data</button>
          <button onClick={() => setShowConfirm(false)}>Cancel reset demo data</button>
        </div>
      )}

      {resetComplete && (
        <p role="status">Demo data reset complete</p>
      )}
    </div>
  );
}
