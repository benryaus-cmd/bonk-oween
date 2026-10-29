import { DEFAULT_CONFIG, normalizeConfig, type GameConfig } from '@/config/defaults';

/**
 * Tweaks that never change scoring, difficulty or the look of the play field.
 * Changing ONLY these keeps a run eligible for the ranked leaderboard.
 */
const NON_RANKED_KEYS = new Set<keyof GameConfig>([
  'masterVolume',
  'musicVolume',
  'sfxVolume',
  'normalHitVolume',
  'perfectHitVolume',
  'goldenHitVolume',
  'mistakeVolume',
  'comboVolume',
  'pitchVariation',
  'maxAudioVoices',
  'soundEnabled',
  'musicEnabled',
  'hapticsEnabled',
  'hapticIntensity',
  'reducedMotion',
]);

/** Compare the EFFECTIVE normalized config against the shipped defaults. */
export function isRankedConfig(cfg: GameConfig): boolean {
  const norm = normalizeConfig(cfg);
  const keys = Object.keys(DEFAULT_CONFIG) as (keyof GameConfig)[];
  for (const key of keys) {
    if (NON_RANKED_KEYS.has(key)) continue;
    const a = norm[key];
    const b = DEFAULT_CONFIG[key];
    if (typeof a === 'number' && typeof b === 'number') {
      if (Math.abs(a - b) > 1e-6) return false;
    } else if (String(a).toLowerCase() !== String(b).toLowerCase()) {
      return false;
    }
  }
  return true;
}