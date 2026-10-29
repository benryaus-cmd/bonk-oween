import type { GameConfig } from '@/config/defaults';
import { difficultyAt } from '@/game/Scoring';
import { makeRng, pick, range, type Rng } from '@/game/rng';
import type {
  ObjectArt,
  Side,
  TargetCategory,
  TargetKind,
  WorldLayout,
} from '@/game/types';

/** Wrapped sweets, lollipop, chocolate bar, gummy packet, candy corn. */
const CANDY_ART: readonly ObjectArt[] = ['candyCorn', 'lollipop', 'chocBar', 'gummy', 'wrapped'];
/** Thrown junk: eggs and toilet rolls. */
const JUNK_ART: readonly ObjectArt[] = ['egg', 'tpRoll'];

export interface SpawnRequest {
  kind: TargetKind;
  category: TargetCategory;
  art: ObjectArt;
  side: Side;
  spawnTime: number;
  impactTime: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  spin: number;
  size: number;
}

export interface SpawnState {
  lastImpact: Record<Side, number>;
  pending: number;
}

/**
 * Builds the scripted target schedule ahead of time. Pure timing — no physics,
 * no hit detection. The Game consumes requests and owns resolution.
 */
export class SpawnDirector {
  private rng: Rng = makeRng(1);
  private nextSpawnTime = 0;
  private sameSideStreak = 0;
  private lastSide: Side | null = null;
  private lastNormalArt: ObjectArt | null = null;
  private lastCategory: TargetCategory = 'candy';
  private lastAnyImpact = -Infinity;
  private lastBabyImpact = -Infinity;
  private queuedBaby: SpawnRequest | null = null;

  reset(seed: number): void {
    this.rng = makeRng(seed);
    this.nextSpawnTime = 0;
    this.sameSideStreak = 0;
    this.lastSide = null;
    this.lastNormalArt = null;
    this.lastCategory = 'candy';
    this.lastAnyImpact = -Infinity;
    this.lastBabyImpact = -Infinity;
    this.queuedBaby = null;
  }

  /** Let a scripted consequence have the road to itself for a moment. */
  deferUntil(timeMs: number): void {
    this.nextSpawnTime = Math.max(this.nextSpawnTime, timeMs);
  }

  /** Shift the whole pending schedule when the warm-up clock is rebased. */
  shift(offsetMs: number): void {
    this.nextSpawnTime -= offsetMs;
    this.lastAnyImpact -= offsetMs;
    this.lastBabyImpact -= offsetMs;
    if (this.queuedBaby) {
      this.queuedBaby.spawnTime -= offsetMs;
      this.queuedBaby.impactTime -= offsetMs;
    }
  }

  update(
    nowMs: number,
    layout: WorldLayout,
    cfg: GameConfig,
    state: SpawnState,
    emit: (req: SpawnRequest) => void,
  ): void {
    if (this.queuedBaby) {
      // The warning must not share a lane with a lingering sweet or egg.
      // Pause ordinary spawns until the road clears, then give the baby a
      // full new flight from offscreen.
      if (this.queuedBaby.spawnTime > nowMs || state.pending > 0) return;
      const baby = this.queuedBaby;
      this.queuedBaby = null;
      baby.impactTime += Math.max(0, nowMs - baby.spawnTime);
      baby.spawnTime = nowMs;
      this.lastBabyImpact = baby.impactTime;
      this.lastAnyImpact = baby.impactTime;
      state.lastImpact[baby.side] = baby.impactTime;
      emit(baby);
    }
    let guard = 0;
    while (this.nextSpawnTime <= nowMs && guard < 4) {
      guard += 1;
      const spawnAt = Math.max(this.nextSpawnTime, nowMs);
      const difficulty = difficultyAt(spawnAt, cfg);
      const meltdown = spawnAt >= cfg.meltdownStartTime * 1000;
      const travel =
        (cfg.travelDuration + (cfg.minimumTravelDuration - cfg.travelDuration) * difficulty) * 1000;
      const impactTime = spawnAt + travel;
      const babyClearance = Math.max(850, cfg.normalWindowMs * 2 + 400);
      if (impactTime - this.lastBabyImpact < babyClearance) {
        this.nextSpawnTime = Math.max(this.nextSpawnTime, spawnAt + babyClearance - (impactTime - this.lastBabyImpact));
        continue;
      }

      const slowBase = cfg.initialSpawnInterval * 1000;
      const fastBase = cfg.minimumSpawnInterval * 1000;
      let interval = slowBase + (fastBase - slowBase) * difficulty;
      if (meltdown) interval *= 0.86;
      this.nextSpawnTime = spawnAt + interval;

      const fairWarning = impactTime - nowMs >= cfg.minimumReactionWindowMs;
      const roomToSpawn = state.pending < cfg.maxIncomingTargets;
      if (!fairWarning || !roomToSpawn) continue;

      const order: Side[] = this.rng() < 0.5 ? ['left', 'right'] : ['right', 'left'];
      let side: Side | null = null;
      for (const candidate of order) {
        const tooSoon = impactTime - state.lastImpact[candidate] < cfg.sameLaneCooldownMs;
        const tooManySame = this.lastSide === candidate && this.sameSideStreak >= 2;
        if (!tooSoon && !tooManySame) {
          side = candidate;
          break;
        }
      }
      if (!side) continue;

      this.sameSideStreak = this.lastSide === side ? this.sameSideStreak + 1 : 1;
      this.lastSide = side;
      const request = this.build(spawnAt, impactTime, side, layout, cfg, meltdown);
      if (request.category === 'baby' && (impactTime - this.lastAnyImpact < babyClearance || state.pending > 0)) {
        const delay = Math.max(0, babyClearance - (impactTime - this.lastAnyImpact));
        request.spawnTime += delay;
        request.impactTime += delay;
        this.queuedBaby = request;
        this.nextSpawnTime = Math.max(this.nextSpawnTime, request.spawnTime + interval);
        break;
      }
      state.lastImpact[side] = impactTime;
      this.lastAnyImpact = impactTime;
      if (request.category === 'baby') this.lastBabyImpact = impactTime;
      emit(request);
    }
    if (this.nextSpawnTime < nowMs) this.nextSpawnTime = nowMs + 120;
  }

  private build(
    spawnTime: number,
    impactTime: number,
    side: Side,
    layout: WorldLayout,
    cfg: GameConfig,
    meltdown: boolean,
  ): SpawnRequest {
    const seconds = spawnTime / 1000;
    const roll = this.rng();

    let kind: TargetKind = 'normal';
    if (seconds >= cfg.cursedIntroductionTime && roll < cfg.cursedChance) {
      kind = 'cursed';
    } else if (
      seconds >= cfg.goldenIntroductionTime &&
      roll >= cfg.cursedChance &&
      roll < cfg.cursedChance + cfg.goldenChance
    ) {
      kind = 'golden';
    }

    let art: ObjectArt;
    let category: TargetCategory;
    if (kind === 'cursed') {
      art = 'baby';
      category = 'baby';
    } else if (kind === 'golden') {
      art = 'pumpkin';
      category = 'pumpkin';
    } else {
      // Candy should feel like the point of the game; junk is the interruption.
      const wantCandy = this.rng() < 0.64 || this.lastCategory === 'junk';
      const pool = wantCandy ? CANDY_ART : JUNK_ART;
      const filtered = pool.filter((a) => a !== this.lastNormalArt);
      art = pick(this.rng, filtered.length > 0 ? filtered : pool);
      category = wantCandy ? 'candy' : 'junk';
      this.lastNormalArt = art;
      this.lastCategory = category;
    }

    const dir = side === 'left' ? -1 : 1;
    const scale = Math.min(1.34, Math.max(0.82, layout.charScale));
    const endX = layout.centerX + dir * 118 * scale;
    const endY = layout.centerY - 18 * scale + range(this.rng, -49, 47);
    const startX = dir < 0 ? -84 : layout.width + 84;
    const startY = endY + range(this.rng, -115, 88);

    const baseSize =
      category === 'pumpkin' ? 66 : category === 'baby' ? 60 : category === 'junk' ? 56 : 52;

    return {
      kind,
      category,
      art,
      side,
      spawnTime,
      impactTime,
      startX,
      startY,
      endX,
      endY,
      spin: range(this.rng, 0.4, 1.15) * (this.rng() < 0.5 ? -1 : 1),
      size: baseSize * scale * (meltdown ? 1.05 : 1),
    };
  }
}
