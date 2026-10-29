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

export interface ScoreLine {
  label: string;
  count: number;
  amount: number;
}

export interface RunAward {
  title: string;
  joke: string;
  reason: string;
  icon: 'cuffs' | 'candy' | 'star' | 'pumpkin' | 'stain' | 'ghost';
  color: string;
}

export const AWARDS: readonly RunAward[] = [
  { title: 'HANDCUFFS', joke: 'The babies have filed a report.', reason: 'Punched at least 2 babies in one run. The street has questions.', icon: 'cuffs', color: '#FF8FA3' },
  { title: 'SWEET TOOTH', joke: 'Dentists hate this one weird bag.', reason: 'Finished a run with at least 8 candies still in the bag.', icon: 'candy', color: '#FF9EC4' },
  { title: 'GOLDEN HANDS', joke: 'Those palms need a license.', reason: 'Landed at least 12 perfect hits in one run.', icon: 'star', color: '#FFD700' },
  { title: 'PUMPKIN MENACE', joke: 'The porch is pressing charges.', reason: 'Smashed at least 3 pumpkins in one run.', icon: 'pumpkin', color: '#FF9A3C' },
  { title: 'LAUNDRY CRIME', joke: 'That sheet has seen things.', reason: 'Finished a run with at least 5 stains on your costume.', icon: 'stain', color: '#C8B4FF' },
  { title: 'CLEAN GETAWAY', joke: 'Mum might believe the alibi.', reason: 'Cleared at least 14 objects with zero stains and zero baby punches.', icon: 'ghost', color: '#FFFDD0' },
  { title: 'STREET LEGEND', joke: 'According to exactly one person.', reason: 'Finished a run. The neighbourhood is still processing it.', icon: 'ghost', color: '#B9A8FF' },
];

export interface FinalTally {
  streetScore: number;
  total: number;
  lines: ScoreLine[];
  award: RunAward;
}

/** End-of-run modifiers are new points on top of the live street score. */
export function finalTally(
  streetScore: number,
  stats: { candy: number; perfects: number; pumpkins: number; stains: number; babyHits: number; hits: number },
  cfg: GameConfig,
): FinalTally {
  const base = Math.max(1, cfg.scorePerHit);
  const lines: ScoreLine[] = [
    { label: 'Candy still in the bag', count: stats.candy, amount: stats.candy * Math.round(base * 0.5) },
    { label: 'Perfect hands', count: stats.perfects, amount: stats.perfects * Math.round(base * 0.4) },
    { label: 'Pumpkin souvenirs', count: stats.pumpkins, amount: stats.pumpkins * Math.round(base * 1.2) },
    { label: 'Laundry bill', count: stats.stains, amount: -stats.stains * Math.round(base * 0.4) },
    { label: 'Baby incident fine', count: stats.babyHits, amount: -stats.babyHits * Math.round(base * 1.5) },
  ];
  const awards = [
    { strength: stats.babyHits / 2, award: AWARDS[0] },
    { strength: stats.candy / 8, award: AWARDS[1] },
    { strength: stats.perfects / 12, award: AWARDS[2] },
    { strength: stats.pumpkins / 3, award: AWARDS[3] },
    { strength: stats.stains / 5, award: AWARDS[4] },
    { strength: stats.stains === 0 && stats.babyHits === 0 ? stats.hits / 14 : 0, award: AWARDS[5] },
  ];
  const strongest = awards.reduce((best, next) => next.strength > best.strength ? next : best);
  const award = strongest.strength >= 1 ? strongest.award : AWARDS[6];
  return {
    streetScore,
    total: applyScore(streetScore, lines.reduce((sum, line) => sum + line.amount, 0)),
    lines,
    award,
  };
}

/** 0 at round start → 1 at meltdown, shaped by spawnAcceleration. */
export function difficultyAt(activeMs: number, cfg: GameConfig): number {
  const span = Math.max(1000, cfg.meltdownStartTime * 1000);
  const t = activeMs / span;
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.pow(clamped, 1 / Math.max(0.2, cfg.spawnAcceleration));
}
