import type { GameConfig } from '@/config/defaults';
import type { HitQuality, TargetCategory } from '@/game/types';

/**
 * The ONE bag multiplier. Candy in the bag is the visible streak —
 * it is the only thing that scales score.
 */
export function bagMultiplier(candy: number, cfg: GameConfig): number {
  return 1 + Math.min(Math.max(candy, 0), 20) * cfg.comboScoreScaling;
}

/** Points for a successful interception. `candy` is the count BEFORE this hit. */
export function pointsForHit(
  category: TargetCategory,
  quality: HitQuality,
  candy: number,
  cfg: GameConfig,
): number {
  if (category === 'baby') return 0;
  const mult = bagMultiplier(candy, cfg);
  const perfect = quality === 'perfect' ? cfg.perfectMultiplier : 1;
  const base = cfg.scorePerHit;
  if (category === 'pumpkin') return Math.round(base * cfg.goldenMultiplier * mult * perfect);
  // A clean junk deflection is worth a little something, but no candy.
  if (category === 'junk') return Math.round(base * 0.6 * perfect);
  return Math.round(base * mult * perfect);
}

/** Score removed for bonking the baby (score is never pushed below zero). */
export function babyPenalty(cfg: GameConfig): number {
  return Math.round(cfg.scorePerHit * 2);
}

export function applyScore(score: number, delta: number): number {
  return Math.max(0, score + delta);
}

/** 0 at round start → 1 at meltdown, shaped by spawnAcceleration. */
export function difficultyAt(activeMs: number, cfg: GameConfig): number {
  const span = Math.max(1000, cfg.meltdownStartTime * 1000);
  const t = activeMs / span;
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.pow(clamped, 1 / Math.max(0.2, cfg.spawnAcceleration));
}