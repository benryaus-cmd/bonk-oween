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
export const MISS_LINGER_MS = 50;

/** The ring, tap check, miss check and travel all share these actual windows. */
export function hitWindows(normalMs: number, perfectMs: number): { normal: number; perfect: number } {
  const normal = normalMs * 1.1;
  return { normal, perfect: Math.min(normal - 10, perfectMs * 0.82) };
}

/** Position of a scripted target at a given active-round clock value. */
export function targetVisual(t: Target, nowMs: number, normalWindowMs = 154): TargetVisual {
  const end = Math.max(t.spawnTime + 1, t.impactTime);
  const raw = Math.max(0, (nowMs - t.spawnTime) / (end - t.spawnTime));
  const p = Math.min(raw, 1);
  // Fast approach, gentle slow-down at the catch point, then a quick inward
  // continuation into the kid. The 50 ms miss tail fades behind the costume.
  const eased = p + 0.16 * Math.sin(Math.PI * p);
  const late = Math.max(0, nowMs - t.impactTime) / Math.max(1, normalWindowMs);
  const travel = eased + 0.24 * Math.pow(Math.min(1.35, late), 1.65);
  let x = lerp(t.startX, t.endX, travel);
  let y = lerp(t.startY, t.endY, travel) + Math.sin(p * Math.PI * 2) * 7;
  let alpha = clamp((nowMs - t.spawnTime) / FADE_IN_MS, 0, 1);
  const scale = 0.88 + Math.min(1.08, travel) * 0.12;
  const remaining = t.impactTime - nowMs;
  const urgency = !t.resolved && remaining < 200 && remaining > -130
    ? clamp(1 - Math.abs(remaining - 15) / 215, 0, 1)
    : 0;

  if (t.resolved && t.outcome === 'miss') {
    alpha *= 1 - clamp((nowMs - t.resolvedAt) / MISS_LINGER_MS, 0, 1);
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
