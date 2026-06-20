import { useState, useEffect, useRef } from 'react';
import { db } from '@/db/schema';
import { demoReset } from '@/stores/reset';

export function DemoControlsPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [scenarioName, setScenarioName] = useState<string>('');
  const [lastReset, setLastReset] = useState<string | undefined>();
  const resetTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    db.demoScenarios.get('scenario-weekly-release-at-risk').then((scenario) => {
      if (scenario) setScenarioName(scenario.name);
    });
    db.appSettings.get('app-settings').then((settings) => {
      if (settings?.lastResetAt) setLastReset(settings.lastResetAt);
    });

    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleReset = async () => {
    setResetError(null);
    setIsResetting(true);

    try {
      await demoReset(db);
      setShowConfirm(false);
      setResetComplete(true);

      const settings = await db.appSettings.get('app-settings');
      if (settings?.lastResetAt) setLastReset(settings.lastResetAt);

      resetTimerRef.current = window.setTimeout(() => {
        setResetComplete(false);
      }, 5000);
    } catch {
      setResetError('Failed to reset demo data. Please reload and try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div>
      <h1>Demo Controls</h1>

      {scenarioName && <p>Current scenario: {scenarioName}</p>}
      {lastReset && <p>Last reset: {lastReset}</p>}

      {!showConfirm && (
        <button onClick={() => setShowConfirm(true)} disabled={isResetting}>
          Reset demo data
        </button>
      )}

      {showConfirm && (
        <div role="dialog" aria-label="Confirm demo data reset" aria-modal="true">
          <h2>Confirm demo data reset</h2>
          <button onClick={handleReset} disabled={isResetting}>
            Confirm reset demo data
          </button>
          <button onClick={() => setShowConfirm(false)} disabled={isResetting}>
            Cancel reset demo data
          </button>
        </div>
      )}

      {resetComplete && <p role="status">Demo data reset complete</p>}
      {resetError && <p role="alert">{resetError}</p>}
    </div>
  );
}
