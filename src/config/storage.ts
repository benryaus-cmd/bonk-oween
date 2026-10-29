import type { GameConfig } from '@/config/defaults';

const BEST_KEY = 'bonk.best.v1';
const SETTINGS_KEY = 'bonk.settings.v2';
const LEGACY_SETTINGS_KEY = 'bonk.settings.v1';
const MUTED_KEY = 'bonk.muted.v1';
const CURRENT_VERSION = 2;

export interface StoredSettings {
  version: number;
  overrides: Partial<GameConfig>;
  muted: boolean;
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private mode — gameplay continues regardless.
  }
}

export function loadBestScore(): number {
  const raw = read(BEST_KEY);
  const parsed = raw === null ? 0 : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

export function saveBestScore(score: number): void {
  write(BEST_KEY, String(Math.floor(score)));
}

function parseOverrides(raw: string | null): Partial<GameConfig> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as { overrides?: unknown; version?: number };
    if (parsed && typeof parsed.overrides === 'object' && parsed.overrides !== null) {
      return parsed.overrides as Partial<GameConfig>;
    }
  } catch {
    // Corrupt payload — fall back to defaults rather than crashing.
  }
  return {};
}

/**
 * Reads settings, migrating the phase-1 payload (unversioned v1 key) into the
 * current shape. Unknown keys survive the round-trip and are clamped later.
 */
export function loadSettings(): StoredSettings {
  const muted = read(MUTED_KEY) === '1';
  const current = read(SETTINGS_KEY);
  if (current !== null) {
    return { version: CURRENT_VERSION, overrides: parseOverrides(current), muted };
  }
  const legacy = read(LEGACY_SETTINGS_KEY);
  if (legacy !== null) {
    const overrides = parseOverrides(legacy);
    write(SETTINGS_KEY, JSON.stringify({ version: CURRENT_VERSION, overrides }));
    return { version: CURRENT_VERSION, overrides, muted };
  }
  return { version: CURRENT_VERSION, overrides: {}, muted };
}

export function saveSettings(settings: StoredSettings): void {
  write(
    SETTINGS_KEY,
    JSON.stringify({ version: CURRENT_VERSION, overrides: settings.overrides }),
  );
  write(MUTED_KEY, settings.muted ? '1' : '0');
}