import type { Side } from '@/game/types';

export type MouthStyle = 'smile' | 'grin' | 'open' | 'grit' | 'wobble' | 'flat' | 'pout' | 'smirk';

export type Mood =
  | 'idle'
  | 'curious'
  | 'satisfied'
  | 'ecstatic'
  | 'celebrate'
  | 'disgust'
  | 'embarrassed'
  | 'cocky'
  | 'manic'
  | 'exhausted'
  | 'record';

export interface ArmPose {
  /** -0.25 (wound up) … 1.2 (full stretch). */
  reach: number;
  /** Hand lifted upward, 0…1. */
  raise: number;
  /** Finger spread, 0…1. */
  spread: number;
  handScale: number;
  handRot: number;
}

export interface CharacterPose {
  mood: Mood;
  breathe: number;
  bobY: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  lean: number;
  eyeScale: number;
  eyeOffsetX: number;
  eyeOffsetY: number;
  pupilX: number;
  pupilY: number;
  blink: number;
  browLeft: number;
  browRight: number;
  mouth: MouthStyle;
  mouthOpen: number;
  cheek: number;
  tongue: number;
  sweat: number;
  sparkle: number;
  glow: number;
  jitter: number;
  /** Elapsed walk-cycle phase in radians. */
  walk: number;
  /** Leg stride offsets, -1…1, opposite phases. */
  stepLeft: number;
  stepRight: number;
  /** Hem bounce, 0…1, from the walk cycle. */
  hemBounce: number;
  /** Bag pendulum, -1…1. */
  bagSwing: number;
  /** Torso sway in design pixels. */
  sway: number;
  left: ArmPose;
  right: ArmPose;
}

/** Local-space anchors, in design pixels at scale 1. */
export const CHAR = {
  halfWidth: 78,
  halfHeight: 102,
  shoulderLeftX: -50,
  shoulderRightX: 52,
  shoulderY: -8,
  restX: 88,
  restY: 62,
  extendX: 118,
  extendY: -20,
};

const restArm = (): ArmPose => ({ reach: 0, raise: 0, spread: 0, handScale: 1, handRot: 0 });

/** Where a hand ends up in local space, given reach / raise / stretch. */
export function armEnd(
  side: Side,
  arm: ArmPose,
  stretch: number,
): { x: number; y: number; dir: number } {
  const dir = side === 'left' ? -1 : 1;
  const far = CHAR.extendX + (stretch - 1) * 34;
  const rx = CHAR.restX + (far - CHAR.restX) * arm.reach;
  const ry = CHAR.restY + (CHAR.extendY - CHAR.restY) * arm.reach - arm.raise * 62;
  return { x: dir * rx, y: ry, dir };
}

export function neutralPose(): CharacterPose {
  return {
    mood: 'idle',
    breathe: 0,
    bobY: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    lean: 0,
    eyeScale: 1,
    eyeOffsetX: 0,
    eyeOffsetY: 0,
    pupilX: 0,
    pupilY: 0,
    blink: 0,
    browLeft: 0,
    browRight: 0,
    mouth: 'smile',
    mouthOpen: 0,
    cheek: 0.5,
    tongue: 0,
    sweat: 0,
    sparkle: 0,
    glow: 0,
    jitter: 0,
    walk: 0,
    stepLeft: 0,
    stepRight: 0,
    hemBounce: 0,
    bagSwing: 0,
    sway: 0,
    left: restArm(),
    right: restArm(),
  };
}

export { restArm };