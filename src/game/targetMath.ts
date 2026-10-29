import { clamp, lerp } from '@/game/rng';
import type { Target } from '@/game/types';

export interface TargetVisual {
  x: number;
  y: number;
  rot: number;
  alpha: number;
  scale: number;
  urgency: number;
}

const FADE_IN_MS = 140;

/** Position of a scripted target at a given active-round clock value. */
export function targetVisual(t: Target, nowMs: number): TargetVisual {
  const end = Math.max(t.spawnTime + 1, t.impactTime);
  const raw = Math.max(0, (nowMs - t.spawnTime) / (end - t.spawnTime));
  const p = Math.min(raw, 1);
  // Keep a nonzero velocity through impact instead of freezing at the contact point.
  const eased = p + 0.17 * Math.sin(Math.PI * p);
  const travel = eased + Math.max(0, raw - 1) * (1 - 0.17 * Math.PI);
  let x = lerp(t.startX, t.endX, travel);
  let y = lerp(t.startY, t.endY, travel) + Math.sin(p * Math.PI * 2) * 7;
  let alpha = clamp((nowMs - t.spawnTime) / FADE_IN_MS, 0, 1);
  let scale = 0.88 + Math.min(1.08, travel) * 0.12;
  const remaining = t.impactTime - nowMs;
  const urgency = !t.resolved && remaining < 200 && remaining > -130
    ? clamp(1 - Math.abs(remaining - 15) / 215, 0, 1)
    : 0;

  if (t.resolved && t.outcome === 'miss') {
    const k = clamp((nowMs - t.resolvedAt) / 420, 0, 1);
    const dir = t.side === 'left' ? 1 : -1;
    x += dir * k * 110;
    alpha *= 1 - k;
    scale = 1 + k * 0.15;
  }

  return {
    x,
    y,
    rot: t.spin * p * 2.2,
    alpha,
    scale,
    urgency,
  };
}

/** Impact point in world space (where the hand meets the object). */
export function impactPoint(t: Target): { x: number; y: number } {
  return { x: t.endX, y: t.endY };
}