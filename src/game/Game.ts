import { Body } from 'matter-js';
import { CharacterMotion } from '@/art/CharacterMotion';
import { Effects } from '@/art/Effects';
import { buildPalette, type ArtPalette } from '@/art/palette';
import { normalizeConfig, type GameConfig } from '@/config/defaults';
import { loadBestScore, saveBestScore } from '@/config/storage';
import { isRankedConfig } from '@/game/eligibility';
import { PhysicsWorld } from '@/game/PhysicsWorld';
import { clamp } from '@/game/rng';
import { applyScore, bagMultiplier, babyPenalty, finalTally, pointsForHit, type FinalTally } from '@/game/Scoring';
import { SpawnDirector } from '@/game/SpawnDirector';
import { hitWindows, MISS_LINGER_MS, targetVisual } from '@/game/targetMath';
import type {
  CostumeKind,
  GameEvent,
  HitQuality,
  HudSnapshot,
  Phase,
  Side,
  SpilledCandy,
  Stain,
  StainKind,
  Target,
  WorldLayout,
} from '@/game/types';

const FINISH_MS = 900;
const MAX_STAINS = 6;
const SPILL_ART = ['candyCorn', 'wrapped', 'lollipop', 'gummy', 'chocBar'] as const;

const MILESTONES: Array<{ at: number; text: string }> = [
  { at: 3, text: 'CANDY RUSH' },
  { at: 6, text: 'HANDS RATED E FOR EVERYONE (WAIT)' },
  { at: 10, text: 'BAG IS DOING GREAT' },
  { at: 15, text: 'SUGAR OVERLOAD' },
  { at: 20, text: 'MAXIMUM CANDY AURA' },
];

const AMBIENT: string[] = [
  'TRICK OR TREAT',
  'SWEET TOOTH ACTIVATED',
  'THAT BAG IS LOADED',
  'NAUGHTY LIST: CANCELLED',
  'POLITE BUT DANGEROUS',
  'BONK SEASON',
];

const BABY_DODGE: string[] = [
  'BABY DODGED. CHARACTER DEVELOPMENT.',
  'WELL DONE. SOMEHOW.',
  'THE BABY LIVES. GOOD BOY.',
];

export function computeLayout(width: number, height: number, cfg: GameConfig): WorldLayout {
  const scale = Math.min(width / 360, height / 620);
  return {
    width,
    height,
    centerX: width / 2,
    centerY: height * 0.68 + cfg.characterYOffset,
    charScale: clamp(scale * cfg.characterScale, 0.5, 1.7),
  };
}

export class Game {
  phase: Phase = 'READY';
  costume: CostumeKind = 'ghost';
  cfg: GameConfig;
  layout: WorldLayout;
  readonly effects = new Effects();
  readonly motion = new CharacterMotion();
  readonly physics: PhysicsWorld;

  private palette: ArtPalette;
  private director = new SpawnDirector();
  private targets: Target[] = [];
  private stainsList: Stain[] = [];
  private spill: SpilledCandy[] = [];
  private events: GameEvent[] = [];
  private clockMs = 0;
  private roundMs = 0;
  private finishMs = 0;
  private score = 0;
  private candyCount = 0;
  private maxCandy = 0;
  private best = loadBestScore();
  private nextId = 1;
  private hitStop = 0;
  private meltdownFired = false;
  private newRecord = false;
  private emitted: Record<Side, number> = { left: 0, right: 0 };
  private resumePhase: Phase = 'PLAYING';
  private stats = { hits: 0, perfects: 0, misses: 0, babyHits: 0, pumpkins: 0 };
  private nextCaptionAt = 0;
  private captionIndex = 0;
  private runId = '';
  private babyDodgeIndex = 0;
  private demoCueSide: Side | null = null;
  private demoCueUntil = 0;
  private demoBabyPunchlineAt = -1;
  private tally: FinalTally | null = null;
  /** Latched at round start; sticky once any non-ranked tweak is used. */
  private runEligible = true;
  private cfgRanked = true;

  constructor(cfg: GameConfig, layout: WorldLayout) {
    this.cfg = normalizeConfig(cfg);
    this.cfgRanked = isRankedConfig(this.cfg);
    this.layout = layout;
    this.palette = buildPalette(this.cfg);
    this.physics = new PhysicsWorld(this.cfg);
    this.effects.setConfig(this.cfg);
    this.effects.setCenterX(layout.centerX);
    this.motion.applyConfig(this.cfg);
    this.resetRound();
  }

  setConfig(cfg: GameConfig): void {
    this.cfg = normalizeConfig(cfg);
    this.cfgRanked = isRankedConfig(this.cfg);
    // Non-default difficulty/art/scoring used DURING a run kills that run for
    // good — resetting the sliders mid-run does not launder it.
    if (
      !this.cfgRanked &&
      (this.phase === 'PLAYING' || this.phase === 'FINISHING' || this.phase === 'PAUSED')
    ) {
      this.runEligible = false;
    }
    this.palette = buildPalette(this.cfg);
    this.physics.applyConfig(this.cfg);
    this.effects.setConfig(this.cfg);
    this.motion.applyConfig(this.cfg);
  }

  setLayout(layout: WorldLayout): void {
    this.layout = layout;
    this.effects.setCenterX(layout.centerX);
  }

  resetRound(): void {
    this.phase = 'READY';
    this.effects.reset();
    this.physics.reset();
    this.motion.reset();
    this.motion.applyConfig(this.cfg);
    this.motion.setExhausted(false);
    this.targets = [];
    this.stainsList = [];
    this.spill = [];
    this.costume = (['ghost', 'frankenstein', 'vampire'] as const)[Math.floor(Math.random() * 3)];
    this.events = [];
    this.clockMs = 0;
    this.roundMs = 0;
    this.finishMs = 0;
    this.score = 0;
    this.candyCount = 0;
    this.maxCandy = 0;
    this.hitStop = 0;
    this.meltdownFired = false;
    this.newRecord = false;
    this.stats = { hits: 0, perfects: 0, misses: 0, babyHits: 0, pumpkins: 0 };
    this.emitted = { left: 0, right: 0 };
    this.nextCaptionAt = 0;
    this.captionIndex = 0;
    this.nextId = 1;
    this.babyDodgeIndex = 0;
    this.demoCueSide = null;
    this.demoCueUntil = 0;
    this.demoBabyPunchlineAt = -1;
    this.tally = null;
    this.cfgRanked = isRankedConfig(this.cfg);
    this.runEligible = this.cfgRanked;
    this.runId = `run-${Date.now().toString(36)}-${Math.floor(Math.random() * 1679616).toString(36)}`;
    this.director.reset((Date.now() % 100000) + 7);
  }

  setPaused(on: boolean): void {
    if (on) {
      if (this.phase === 'PAUSED' || this.phase === 'RESULTS') return;
      this.resumePhase = this.phase;
      this.phase = 'PAUSED';
    } else if (this.phase === 'PAUSED') {
      this.phase = this.resumePhase;
    }
  }

  tap(side: Side): void {
    if (this.phase === 'READY') {
      // The very first tap only starts the round — it must never register
      // as a whiff or play a bad-slap sound.
      this.startRound();
      return;
    }
    if (this.phase !== 'PLAYING') return;
    const now = this.clockMs;
    const window = hitWindows(this.cfg.normalWindowMs, this.cfg.perfectWindowMs);
    let best: Target | null = null;
    let bestDelta = Number.POSITIVE_INFINITY;
    for (const t of this.targets) {
      if (t.resolved || t.side !== side) continue;
      const d = now - t.impactTime;
      const punchable = t.category === 'baby'
        ? now >= t.spawnTime + 100 && d <= window.normal
        : d >= -window.early && d <= window.normal;
      if (punchable && Math.abs(d) < Math.abs(bestDelta)) {
        best = t;
        bestDelta = d;
      }
    }
    if (!best) {
      this.motion.slap(side, 'whiff');
      this.effects.addShake(1.5);
      this.events.push({ type: 'WHIFF', side });
      return;
    }
    const quality: HitQuality =
      Math.abs(now - best.impactTime) <= window.perfect ? 'perfect' : 'normal';
    this.resolve(best, quality, side);
  }

  update(dtMs: number): void {
    const dt = Math.min(dtMs, 50);
    if (this.phase === 'PAUSED') return;

    const slow = this.phase === 'FINISHING' ? 0.55 : 1;
    this.effects.update(dt * slow);
    this.motion.update(dt);

    if (this.phase === 'RESULTS') return;

    this.clockMs += dt;
    this.hitStop = Math.max(0, this.hitStop - dt);
    const timeScale = (this.hitStop > 0 ? 0.2 : 1) * slow;
    this.physics.setBounds(
      this.layout.width,
      this.layout.height,
      this.cfg.floorBounceEnabled,
      this.cfg.wallBounceEnabled,
    );
    this.physics.step(dt, timeScale);
    this.advanceSpill(dt * slow);

    if (this.phase === 'PLAYING') {
      this.roundMs += dt;
      const meltdownAt = this.cfg.meltdownStartTime * 1000;
      if (this.roundMs >= meltdownAt && this.roundMs < this.cfg.roundDuration * 1000) {
        this.motion.react('manic');
        if (!this.meltdownFired) {
          this.meltdownFired = true;
          this.events.push({ type: 'MELTDOWN' });
          this.events.push({ type: 'CAPTION', text: 'FINAL MELTDOWN', tone: 'meltdown' });
          this.effects.addFlash('#FF7518', 0.8);
          this.effects.addShake(9);
        }
      }
      this.tickCaptions();
      if (this.roundMs >= this.cfg.roundDuration * 1000) {
        this.phase = 'FINISHING';
        this.finishMs = 0;
        this.targets = [];
        this.effects.addFlash('#FFFDD0', 0.6);
      }
    } else if (this.phase === 'FINISHING') {
      this.finishMs += dt;
      if (this.finishMs >= FINISH_MS) this.toResults();
    }

    if (this.phase === 'READY' || this.phase === 'PLAYING') {
      this.advanceTargets();
      this.steerCharacter();
      if (this.phase === 'READY') {
        this.advanceDemo();
        if (this.demoBabyPunchlineAt >= 0 && this.clockMs >= this.demoBabyPunchlineAt) {
          this.events.push({ type: 'CAPTION', text: 'WHY IS SOMEONE THROWING BABIES?!', tone: 'mistake' });
          this.demoBabyPunchlineAt = -1;
        }
      }
    }
  }

  drainEvents(): GameEvent[] {
    if (this.events.length === 0) return [];
    const out = this.events;
    this.events = [];
    return out;
  }

  get hud(): HudSnapshot {
    const total = this.cfg.roundDuration * 1000;
    const meltdownAt = this.cfg.meltdownStartTime * 1000;
    return {
      phase: this.phase,
      score: this.score,
      candy: this.candyCount,
      maxCandy: this.maxCandy,
      multiplier: bagMultiplier(this.candyCount, this.cfg),
      best: this.best,
      timeLeft: Math.max(0, (total - this.roundMs) / 1000),
      meltdown: this.roundMs >= meltdownAt,
      hits: this.stats.hits,
      perfects: this.stats.perfects,
      misses: this.stats.misses,
      mistakes: this.stats.babyHits,
      golden: this.stats.pumpkins,
      newRecord: this.newRecord,
      practice: this.phase === 'READY' ? !this.cfgRanked : !this.runEligible,
      eligible: this.runEligible,
    };
  }

  get list(): readonly Target[] {
    return this.targets;
  }

  get spilledCandy(): readonly SpilledCandy[] {
    return this.spill;
  }

  get stains(): readonly Stain[] {
    return this.stainsList;
  }

  get candy(): number {
    return this.candyCount;
  }

  get clock(): number {
    return this.clockMs;
  }

  get currentRunId(): string {
    return this.runId;
  }

  get demoSide(): Side | null {
    return this.phase === 'READY' && this.clockMs < this.demoCueUntil ? this.demoCueSide : null;
  }

  get resultTally(): FinalTally | null { return this.tally; }

  get meltdownAmount(): number {
    const meltdownAt = this.cfg.meltdownStartTime * 1000;
    if (this.roundMs < meltdownAt) return 0;
    return clamp((this.roundMs - meltdownAt) / 500, 0, 1);
  }

  private startRound(): void {
    // A fresh approach starts after the first tap, with the same costume
    // shown on the ready screen and a full reaction interval.
    this.targets = [];
    this.director.reset((Date.now() % 100000) + 7);
    this.emitted = { left: 0, right: 0 };
    this.clockMs = 0;
    this.roundMs = 0;
    this.director.deferUntil(500); // Let the first tap breathe before the street starts throwing.
    this.score = 0;
    this.candyCount = 0;
    this.maxCandy = 0;
    this.stainsList = [];
    this.spill = [];
    this.demoCueSide = null;
    this.demoCueUntil = 0;
    this.demoBabyPunchlineAt = -1;
    this.stats = { hits: 0, perfects: 0, misses: 0, babyHits: 0, pumpkins: 0 };
    this.meltdownFired = false;
    this.newRecord = false;
    this.nextCaptionAt = this.cfg.captionFrequency > 0 ? this.cfg.captionFrequency * 1000 : 0;
    // Latch ranked eligibility NOW for the whole run.
    this.cfgRanked = isRankedConfig(this.cfg);
    this.runEligible = this.cfgRanked;
    this.phase = 'PLAYING';
  }

  private toResults(): void {
    this.phase = 'RESULTS';
    this.targets = [];
    this.motion.setExhausted(true);
    this.tally = finalTally(this.score, {
      candy: this.candyCount, perfects: this.stats.perfects, pumpkins: this.stats.pumpkins,
      stains: this.stainsList.length, babyHits: this.stats.babyHits, hits: this.stats.hits,
    }, this.cfg);
    this.score = this.tally.total;
    this.newRecord = this.runEligible && this.score > this.best;
    if (this.runEligible && this.score > this.best) {
      this.best = this.score;
      saveBestScore(this.best);
    }
    this.events.push({
      type: 'RUN_FINISHED',
      score: this.score,
      candy: this.candyCount,
      maxCandy: this.maxCandy,
      runId: this.runId,
      hits: this.stats.hits,
      perfects: this.stats.perfects,
      misses: this.stats.misses,
      babyHits: this.stats.babyHits,
      pumpkins: this.stats.pumpkins,
      stains: this.stainsList.length,
      eligible: this.runEligible,
    });
  }

  private tickCaptions(): void {
    const freq = this.cfg.captionFrequency * 1000;
    if (freq <= 0) return;
    if (this.nextCaptionAt === 0) this.nextCaptionAt = this.roundMs + freq;
    if (this.roundMs < this.nextCaptionAt) return;
    this.nextCaptionAt = this.roundMs + freq;
    if (this.candyCount >= 5 || this.meltdownFired) return;
    const text = AMBIENT[this.captionIndex % AMBIENT.length];
    this.captionIndex += 1;
    this.events.push({ type: 'CAPTION', text, tone: 'hype' });
  }

  /** Ghost eye-tracking + wind-up while objects approach. */
  private steerCharacter(): void {
    const window = hitWindows(this.cfg.normalWindowMs, this.cfg.perfectWindowMs);
    let closest: Target | null = null;
    let closestDelta = Number.POSITIVE_INFINITY;
    for (const t of this.targets) {
      if (t.resolved) continue;
      const d = t.impactTime - this.clockMs;
      if (d < -window.normal) continue;
      if (Math.abs(d) < closestDelta) {
        closestDelta = Math.abs(d);
        closest = t;
      }
    }
    if (!closest) return;
    const nx = clamp((closest.endX - this.layout.centerX) / 190, -1, 1);
    const ny = clamp((closest.endY - this.layout.centerY) / 190, -1, 1);
    this.motion.lookAt(nx, ny);
    if (closestDelta < this.cfg.anticipationDuration && closestDelta > -40) {
      this.motion.anticipate(closest.side);
    }
  }

  private lastImpact(side: Side): number {
    let max = this.emitted[side];
    for (const t of this.targets) {
      if (t.side === side && !t.resolved && t.impactTime > max) max = t.impactTime;
    }
    return max;
  }

  private advanceTargets(): void {
    const now = this.clockMs;
    const window = hitWindows(this.cfg.normalWindowMs, this.cfg.perfectWindowMs);
    const pending = this.targets.filter((t) => !t.resolved).length;
    this.director.update(
      now,
      this.layout,
      this.cfg,
      { lastImpact: { left: this.lastImpact('left'), right: this.lastImpact('right') }, pending },
      (req) => {
        this.emitted[req.side] = Math.max(this.emitted[req.side], req.impactTime);
        if (req.category === 'baby') {
          if (this.phase === 'PLAYING') this.events.push({ type: 'BABY_INCOMING' });
          else {
            this.events.push({ type: 'CAPTION', text: 'DO NOT HIT THE BABY', tone: 'mistake' });
            this.demoBabyPunchlineAt = now + 650;
          }
        }
        this.targets.push({
          ...req,
          id: this.nextId++,
          resolved: false,
          outcome: null,
          resolvedAt: 0,
        });
      },
    );

    for (const t of this.targets) {
      if (t.resolved) continue;
      if (now > t.impactTime + window.normal) {
        t.resolved = true;
        t.outcome = 'miss';
        t.resolvedAt = now;
        if (this.phase !== 'PLAYING') continue;
        this.handleUnblocked(t);
      }
    }
    this.targets = this.targets.filter((t) => !t.resolved || now - t.resolvedAt <
      (t.outcome === 'miss' ? MISS_LINGER_MS : 460));
  }

  /** Silent, non-scoring attract play: shows the thumb action without teaching text. */
  private advanceDemo(): void {
    const target = this.targets.find((t) => !t.resolved && t.category !== 'baby' &&
      Math.abs(t.impactTime - this.clockMs) < 38);
    if (!target) return;
    const visual = targetVisual(target, this.clockMs, hitWindows(this.cfg.normalWindowMs, this.cfg.perfectWindowMs).normal);
    target.resolved = true;
    target.outcome = 'hit';
    target.resolvedAt = this.clockMs;
    this.demoCueSide = target.side;
    this.demoCueUntil = this.clockMs + 620;
    this.motion.slap(target.side, 'normal', {
      x: (visual.x - this.layout.centerX) / this.layout.charScale,
      y: (visual.y - this.layout.centerY) / this.layout.charScale,
    });
    if (target.category === 'junk' || target.category === 'pumpkin') {
      this.physics.launch(target.art, visual.x, visual.y,
        target.side === 'left' ? -1 : 1, target.size, this.cfg, target.category === 'pumpkin' ? 1.2 : 1);
      this.effects.ring(visual.x, visual.y, target.category === 'pumpkin' ? '#FFD700' : '#FFFDD0');
      this.effects.burst(visual.x, visual.y, target.category === 'pumpkin' ? ['#FF7518', '#FFB347'] : ['#FFFDD0', '#FFCF73'],
        7, 2, { shapes: ['spark', 'sliver'] });
    } else {
      this.effects.arcTo(visual.x, visual.y, this.layout.centerX + 34 * this.layout.charScale,
        this.layout.centerY + 30 * this.layout.charScale, '#FF9EC4', 5);
      this.effects.burst(visual.x, visual.y, ['#FFFDD0', '#FFCF73'], 4, 1.6, { shapes: ['spark'] });
    }
  }

  private addStain(kind: StainKind, worldX: number, worldY: number): void {
    if (this.stainsList.length >= MAX_STAINS) this.stainsList.shift();
    // Project the actual missed object onto the costume. High throws can mark
    // the face; low throws hit the torso. Small splashes vary the silhouette.
    const localX = (worldX - this.layout.centerX) / this.layout.charScale;
    const localY = (worldY - this.layout.centerY) / this.layout.charScale;
    this.stainsList.push({
      kind,
      x: clamp(localX * 0.58 + (Math.random() - 0.5) * 35, -63, 63),
      y: clamp(localY + (Math.random() - 0.5) * 26, -94, 72),
      rot: (Math.random() - 0.5) * 0.9,
      size: 0.82 + Math.random() * 0.4,
    });
  }

  private advanceSpill(dtMs: number): void {
    if (this.spill.length === 0) return;
    const step = dtMs / 16.667;
    for (const piece of this.spill) {
      piece.ageMs += dtMs;
      piece.x += piece.vx * step;
      piece.y += piece.vy * step;
      piece.vy = Math.min(2.4, piece.vy + 0.11 * step);
      piece.vx *= Math.pow(0.985, step);
      piece.angle += piece.vx * 0.013 * step;
      if (piece.y > this.layout.centerY + 128) piece.y += 2.1 * step;
    }
    this.spill = this.spill.filter((piece) => piece.ageMs < 2900 && piece.y < this.layout.height + 72);
  }

  private dropCandy(count: number): void {
    const total = Math.min(30, Math.max(12, count * 2));
    for (let i = 0; i < total; i += 1) {
      const lateral = Math.random() * 2 - 1;
      this.spill.push({
        x: this.layout.centerX + 34 * this.layout.charScale + lateral * 14,
        y: this.layout.centerY + 38 * this.layout.charScale,
        angle: Math.random() * Math.PI * 2,
        scale: 0.4 + Math.random() * 0.32,
        art: SPILL_ART[i % SPILL_ART.length],
        ageMs: 0,
        vx: lateral * (2.5 + Math.random() * 4),
        vy: -(3 + Math.random() * 5),
      });
    }
  }

  private throwBabyBarrage(): void {
    const now = this.clockMs;
    const leftArt = Math.random() < 0.5 ? 'egg' : 'tpRoll';
    this.director.deferUntil(now + 1480);
    (['left', 'right'] as const).forEach((side, index) => {
      const dir = side === 'left' ? -1 : 1;
      const impactTime = now + 950 + index * 220;
      this.emitted[side] = Math.max(this.emitted[side], impactTime);
      this.targets.push({
        id: this.nextId++, kind: 'normal', category: 'junk',
        art: index === 0 ? leftArt : leftArt === 'egg' ? 'tpRoll' : 'egg',
        side, spawnTime: now + 140 + index * 220, impactTime,
        startX: side === 'left' ? -84 : this.layout.width + 84,
        startY: this.layout.centerY - 85 + index * 125,
        endX: this.layout.centerX + dir * 118 * this.layout.charScale,
        endY: this.layout.centerY - 25 + index * 40,
        spin: dir * 0.85, size: 56 * this.layout.charScale,
        resolved: false, outcome: null, resolvedAt: 0,
      });
    });
  }

  /** An object reached the ghost without being intercepted. */
  private handleUnblocked(t: Target): void {
    const p = targetVisual(t, this.clockMs, hitWindows(this.cfg.normalWindowMs, this.cfg.perfectWindowMs).normal);
    // The baby is the object you must NOT slap: letting it pass is a dodge.
    if (t.category === 'baby') {
      this.effects.floater(p.x, p.y - 30, 'PHEW', '#FFFDD0', 18);
      this.motion.react('satisfied');
      this.events.push({ type: 'BABY_DODGED' });
      if (this.babyDodgeIndex < 2) {
        this.events.push({
          type: 'CAPTION',
          text: BABY_DODGE[this.babyDodgeIndex % BABY_DODGE.length],
          tone: 'hype',
        });
        this.babyDodgeIndex += 1;
      }
      return;
    }

    this.stats.misses += 1;
    this.events.push({ type: 'MISS', side: t.side, x: p.x, y: p.y, category: t.category });

    if (t.category === 'junk') {
      this.addStain(t.art === 'tpRoll' ? 'tp' : 'egg', p.x, p.y);
      this.motion.react(t.art === 'tpRoll' ? 'embarrassed' : 'disgust');
      this.effects.floater(p.x, p.y - 30, t.art === 'tpRoll' ? 'TOILET PAPER' : 'SPLAT', '#FFD9A0', 17);
      this.effects.burst(p.x, p.y, ['#FFE9A8', '#FFFDD0', '#E5D3A0'], 9, 2.6, { shapes: ['dot', 'sliver'] });
      this.effects.addShake(2.4);
      return;
    }
    if (t.category === 'pumpkin') {
      this.addStain('pumpkin', p.x, p.y);
      this.motion.react('embarrassed');
      this.effects.floater(p.x, p.y - 30, 'SQUASHED', '#FF9A3C', 18);
      this.effects.burst(p.x, p.y, ['#FF7518', '#FFB347'], 10, 2.8, { shapes: ['dot', 'sliver'] });
      this.effects.addShake(2.6);
      return;
    }

    // Missed candy: sad, but it never costs candy already in the bag.
    this.motion.react('embarrassed');
    this.effects.floater(p.x, p.y - 30, 'MISSED', '#FFB3C7', 18);
    this.effects.burst(p.x, p.y, ['#B9A8FF', '#8A6BB5'], 5, 2.2, { shapes: ['dot'] });
    this.effects.addShake(1.4);
  }

  private resolve(t: Target, quality: HitQuality, side: Side): void {
    const now = this.clockMs;
    const visual = targetVisual(t, now, hitWindows(this.cfg.normalWindowMs, this.cfg.perfectWindowMs).normal);
    const contact = {
      x: (visual.x - this.layout.centerX) / this.layout.charScale,
      y: (visual.y - this.layout.centerY) / this.layout.charScale,
    };
    t.resolved = true;
    t.resolvedAt = now;
    t.outcome = 'hit';
    const dirX = side === 'left' ? -1 : 1;
    const bagX = this.layout.centerX + 34 * this.layout.charScale;
    const bagY = this.layout.centerY + 30 * this.layout.charScale;

    if (t.category === 'baby') {
      t.outcome = 'cursed';
      this.physics.launch(t.art, visual.x, visual.y, dirX, t.size, this.cfg, 0.85);
      const babyBody = this.physics.list[this.physics.list.length - 1]?.body;
      if (babyBody) Body.setAngularVelocity(babyBody, dirX * 0.48);
      const loss = babyPenalty(this.cfg);
      const dropped = this.candyCount;
      this.score = applyScore(this.score, -loss);
      this.candyCount = 0;
      if (dropped > 0) this.dropCandy(dropped);
      this.motion.slap(side, 'whiff', contact);
      this.motion.react('disgust');
      this.stats.babyHits += 1;
      this.throwBabyBarrage();
      this.effects.burst(visual.x, visual.y, ['#FFFFFF', '#FFE9DC', '#FFFDD0'], 12, 2.4, {
        shapes: ['dot'],
      });
      this.effects.ring(visual.x, visual.y, '#FF5A5A', 24, 2.2, 1);
      this.effects.floater(visual.x, visual.y - 26, "THAT'S A BABY, BRO", '#FF5A5A', 21);
      this.effects.floater(visual.x, visual.y + 4, 'OH NO', '#FF8FA3', 17);
      if (dropped > 0) {
        this.effects.floater(this.layout.centerX, this.layout.centerY - 120, 'YOU DROPPED THE BAG', '#FFD700', 19);
      }
      this.effects.addFlash('#FF2D55', 0.6);
      this.effects.addShake(this.cfg.shakeStrength * 5);
      this.hitStop = this.cfg.hitStopMs;
      this.events.push({ type: 'BABY_HIT', side, x: visual.x, y: visual.y, droppedCandy: dropped });
      if (dropped > 0) this.events.push({ type: 'BAG_DROPPED', candy: dropped });
      return;
    }

    const points = pointsForHit(t.category, quality, this.candyCount, this.cfg);
    this.score = applyScore(this.score, points);
    this.stats.hits += 1;
    if (quality === 'perfect') this.stats.perfects += 1;

    this.motion.slap(side, quality, contact);
    this.hitStop =
      t.category === 'pumpkin'
        ? this.cfg.goldenHitStopMs
        : quality === 'perfect'
          ? this.cfg.perfectHitStopMs
          : this.cfg.hitStopMs;

    if (t.category === 'junk') {
      const boost = quality === 'perfect' ? this.cfg.perfectLaunchMultiplier : 1;
      this.physics.launch(t.art, visual.x, visual.y, dirX, t.size, this.cfg, boost);
      this.effects.burst(visual.x, visual.y, [this.palette.cream, this.palette.accent, '#B9A8FF'], this.cfg.particleCount, this.cfg.particleSpeed, {
        angle: dirX > 0 ? 0 : Math.PI,
        spread: Math.PI,
        shapes: ['spark', 'sliver'],
      });
      this.effects.ring(visual.x, visual.y, this.palette.accent);
      this.effects.floater(visual.x, visual.y - 30, `DEFLECTED +${points}`, this.palette.cream, 19);
      this.effects.addShake(this.cfg.shakeStrength * 3);
      this.events.push({ type: 'JUNK_DEFLECTED', side, x: visual.x, y: visual.y, points });
      return;
    }

    if (t.category === 'pumpkin') {
      this.physics.launch(t.art, visual.x, visual.y, dirX, t.size, this.cfg, 1.2);
      this.stats.pumpkins += 1;
      this.candyCount += 3;
      this.maxCandy = Math.max(this.maxCandy, this.candyCount);
      for (let i = 0; i < 3; i += 1) {
        this.effects.arcTo(visual.x, visual.y, bagX, bagY, this.palette.gold, 5);
      }
      this.effects.burst(visual.x, visual.y, [this.palette.gold, '#FFF6B0', '#FF7518'], this.cfg.goldenParticleCount, this.cfg.particleSpeed * 1.7, {
        shapes: ['star', 'confetti', 'spark'],
      });
      this.effects.ring(visual.x, visual.y, this.palette.gold);
      this.effects.addPulse(0.9);
      this.effects.floater(visual.x, visual.y - 34, `PUMPKIN +${points}`, this.palette.gold, 24);
      this.effects.floater(bagX, bagY - 26, '+3 CANDY', '#FFF6B0', 17);
      this.effects.addShake(this.cfg.goldenShake);
      this.effects.addFlash(this.palette.gold, 0.6);
      this.motion.react('celebrate');
      this.events.push({ type: 'PUMPKIN_SMASHED', side, x: visual.x, y: visual.y, points, candy: this.candyCount });
      this.checkMilestones();
      return;
    }

    // CANDY: arcs into the bag, grows the multiplier.
    this.candyCount += 1;
    this.maxCandy = Math.max(this.maxCandy, this.candyCount);
    this.effects.arcTo(visual.x, visual.y, bagX, bagY, quality === 'perfect' ? this.palette.gold : '#FF9EC4', 6);
    const colors = quality === 'perfect'
      ? [this.palette.gold, this.palette.white, this.palette.accent]
      : ['#FF9EC4', this.palette.cream, this.palette.accent];
    const count = quality === 'perfect' ? this.cfg.perfectParticleCount : this.cfg.particleCount;
    this.effects.burst(visual.x, visual.y, colors, count, this.cfg.particleSpeed * (quality === 'perfect' ? 1.5 : 1), {
      angle: dirX > 0 ? 0 : Math.PI,
      spread: Math.PI * 1.35,
      shapes: ['dot', 'spark', 'star'],
    });
    this.effects.ring(visual.x, visual.y, colors[0]);
    this.effects.addPulse(quality === 'perfect' ? 0.7 : 0.3);
    this.motion.react(quality === 'perfect' ? 'ecstatic' : 'satisfied');
    this.effects.floater(
      visual.x,
      visual.y - 30,
      quality === 'perfect' ? `PERFECT +${points}` : `+${points}`,
      quality === 'perfect' ? this.palette.gold : '#FF9EC4',
      quality === 'perfect' ? 26 : 21,
    );
    this.effects.addShake(quality === 'perfect' ? this.cfg.perfectShake : this.cfg.shakeStrength * 3);
    if (quality === 'perfect') this.effects.addFlash('#FFD700', 0.35);
    this.events.push({
      type: 'CANDY_COLLECTED',
      side,
      x: visual.x,
      y: visual.y,
      points,
      candy: this.candyCount,
      perfect: quality === 'perfect',
    });
    this.checkMilestones();
  }

  private checkMilestones(): void {
    const milestone = MILESTONES.find((m) => m.at === this.candyCount);
    if (milestone) this.events.push({ type: 'CAPTION', text: milestone.text, tone: 'candy' });

    if (!this.newRecord && this.runEligible && this.best > 0 && this.score > this.best) {
      this.newRecord = true;
      this.motion.react('record');
      this.events.push({ type: 'NEW_RECORD' });
      this.events.push({ type: 'CAPTION', text: 'NEW RECORD', tone: 'meltdown' });
    }
  }
}
