import { vibrate } from '@aippy/runtime/device';

export type HapticKind = 'hit' | 'perfect' | 'golden' | 'mistake' | 'ui';

const BASE_MS: Record<HapticKind, number> = {
  hit: 9,
  perfect: 16,
  golden: 22,
  mistake: 34,
  ui: 5,
};

/**
 * Uses the verified Aippy device bridge (`vibrate`) and stays silent when the
 * platform has no haptics. Never invents API surface.
 */
export function haptic(kind: HapticKind, enabled: boolean, intensity: number): void {
  if (!enabled || intensity <= 0.02) return;
  const ms = Math.round(BASE_MS[kind] * intensity);
  if (ms <= 0) return;
  try {
    vibrate(ms);
  } catch {
    // Device without vibration support — gameplay continues.
  }
}