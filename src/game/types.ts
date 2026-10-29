export type Phase = 'READY' | 'PLAYING' | 'PAUSED' | 'FINISHING' | 'RESULTS';

export type Side = 'left' | 'right';

/** Scheduling slot: normal pool, rare gold slot, or the "do not bonk" slot. */
export type TargetKind = 'normal' | 'golden' | 'cursed';

/** What the object actually IS in the Halloween street. */
export type TargetCategory = 'candy' | 'junk' | 'pumpkin' | 'baby';

export type ObjectArt =
  | 'candyCorn'
  | 'lollipop'
  | 'chocBar'
  | 'gummy'
  | 'wrapped'
  | 'egg'
  | 'tpRoll'
  | 'pumpkin'
  | 'baby';

export type StainKind = 'egg' | 'tp' | 'pumpkin';
export type CostumeKind = 'ghost' | 'frankenstein' | 'vampire';

/** Candy bounced out of the bag, then recedes as the kid walks on. */
export interface SpilledCandy {
  x: number;
  y: number;
  angle: number;
  scale: number;
  art: ObjectArt;
  ageMs: number;
  vx: number;
  vy: number;
}

/** A persistent mess left on the ghost sheet. Local character coordinates. */
export interface Stain {
  kind: StainKind;
  x: number;
  y: number;
  rot: number;
  size: number;
}

export type HitQuality = 'perfect' | 'normal';

export type CaptionTone = 'hype' | 'meltdown' | 'perfect' | 'golden' | 'mistake' | 'candy';

export interface Target {
  id: number;
  kind: TargetKind;
  category: TargetCategory;
  art: ObjectArt;
  side: Side;
  /** Active-round milliseconds. */
  spawnTime: number;
  /** Active-round milliseconds when it reaches the ghost. */
  impactTime: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  spin: number;
  size: number;
  resolved: boolean;
  outcome: 'hit' | 'miss' | 'cursed' | null;
  /** Active-round ms when the target was resolved (used for fade-out). */
  resolvedAt: number;
}

export interface WorldLayout {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  charScale: number;
}

export type GameEvent =
  | { type: 'CANDY_COLLECTED'; side: Side; x: number; y: number; points: number; candy: number; perfect: boolean }
  | { type: 'JUNK_DEFLECTED'; side: Side; x: number; y: number; points: number }
  | { type: 'PUMPKIN_SMASHED'; side: Side; x: number; y: number; points: number; candy: number }
  | { type: 'BABY_INCOMING' }
  | { type: 'BABY_HIT'; side: Side; x: number; y: number; droppedCandy: number }
  | { type: 'BAG_DROPPED'; candy: number }
  | { type: 'BABY_DODGED' }
  | { type: 'MISS'; side: Side; x: number; y: number; category: TargetCategory }
  | { type: 'WHIFF'; side: Side }
  | { type: 'CAPTION'; text: string; tone: CaptionTone }
  | { type: 'NEW_RECORD' }
  | { type: 'MELTDOWN' }
  | {
      type: 'RUN_FINISHED';
      score: number;
      candy: number;
      maxCandy: number;
      runId: string;
      hits: number;
      perfects: number;
      misses: number;
      babyHits: number;
      pumpkins: number;
      stains: number;
      /** false → display only, never submit to the ranked leaderboard. */
      eligible: boolean;
    };

export interface HudSnapshot {
  phase: Phase;
  score: number;
  candy: number;
  maxCandy: number;
  multiplier: number;
  best: number;
  timeLeft: number;
  meltdown: boolean;
  hits: number;
  perfects: number;
  misses: number;
  mistakes: number;
  golden: number;
  newRecord: boolean;
  /** true when this run (or the current settings) cannot be ranked. */
  practice: boolean;
  eligible: boolean;
}
