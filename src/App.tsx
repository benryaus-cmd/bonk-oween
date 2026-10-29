import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_CONFIG, normalizeConfig, type GameConfig } from '@/config/defaults';
import { loadSettings, saveSettings } from '@/config/storage';
import { useTweakValues } from '@/hooks/useTweakValues';
import GameScreen from '@/ui/GameScreen';

const App = () => {
  const tweakValues = useTweakValues();
  const stored = useMemo(() => loadSettings(), []);
  const [overrides, setOverrides] = useState<Partial<GameConfig>>(stored.overrides);
  const [muted, setMuted] = useState(stored.muted);

  useEffect(() => {
    saveSettings({ version: stored.version, overrides, muted });
  }, [overrides, muted, stored.version]);

  const config = normalizeConfig({ ...tweakValues, ...overrides });

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden" style={{ background: DEFAULT_CONFIG.backgroundColour }}>
      <GameScreen
        config={config}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        onChangeSetting={(key, value) =>
          setOverrides((prev) => ({ ...prev, [key]: value }))
        }
        onResetSettings={() => setOverrides({})}
      />
    </div>
  );
};

export default App;
