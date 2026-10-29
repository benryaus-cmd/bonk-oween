import { Bodies, Body, Composite, Engine } from 'matter-js';
import type { GameConfig } from '@/config/defaults';
import type { ObjectArt } from '@/game/types';

type MatterBody = ReturnType<typeof Bodies.circle>;

export interface TrailPoint {
  x: number;
  y: number;
  a: number;
}

export interface FlyingItem {
  id: number;
  art: ObjectArt;
  body: MatterBody;
  size: number;
  lifeMs: number;
  maxLifeMs: number;
  trail: TrailPoint[];
}

const STEP_MS = 1000 / 60;
const MAX_TRAIL = 4;

/**
 * Physics for the AFTERMATH of a slap only. Never used for incoming timing
 * or hit detection — those are scripted against the active-round clock.
 */
export class PhysicsWorld {
  private engine: Engine = Engine.create({ gravity: { x: 0, y: 1.1, scale: 0.001 } });
  private items: FlyingItem[] = [];
  private statics: MatterBody[] = [];
  private accumulator = 0;
  private nextId = 1;
  private bounds = { w: 0, h: 0, floor: false, walls: false };

  constructor(cfg: GameConfig) {
    this.applyConfig(cfg);
  }

  applyConfig(cfg: GameConfig): void {
    this.engine.gravity.y = cfg.gravity;
  }

  reset(): void {
    const gravityY = this.engine.gravity.y;
    Composite.clear(this.engine.world, false, true);
    Engine.clear(this.engine);
    this.engine = Engine.create({ gravity: { x: 0, y: gravityY, scale: 0.001 } });
    this.items = [];
    this.statics = [];
    this.accumulator = 0;
    this.nextId = 1;
    this.bounds = { w: 0, h: 0, floor: false, walls: false };
  }

  get list(): readonly FlyingItem[] {
    return this.items;
  }

  /** Rebuilds the invisible floor / walls when the viewport changes. */
  setBounds(width: number, height: number, floor: boolean, walls: boolean): void {
    const changed =
      Math.abs(this.bounds.w - width) > 1 ||
      Math.abs(this.bounds.h - height) > 1 ||
      this.bounds.floor !== floor ||
      this.bounds.walls !== walls;
    if (!changed) return;
    this.bounds = { w: width, h: height, floor, walls };
    this.statics.forEach((body) => Composite.remove(this.engine.world, body));
    this.statics = [];
    if (floor) {
      const body = Bodies.rectangle(width / 2, height - 8, width * 3, 40, {
        isStatic: true,
        restitution: 0.5,
        friction: 0.4,
        label: 'floor',
      });
      this.statics.push(body);
    }
    if (walls) {
      [-26, width + 26].forEach((x) => {
        const body = Bodies.rectangle(x, height / 2, 40, height * 3, {
          isStatic: true,
          restitution: 0.6,
          friction: 0.2,
          label: 'wall',
        });
        this.statics.push(body);
      });
    }
    this.statics.forEach((body) => Composite.add(this.engine.world, body));
  }

  launch(
    art: ObjectArt,
    x: number,
    y: number,
    dirX: number,
    size: number,
    cfg: GameConfig,
    boost = 1,
  ): void {
    if (this.items.length >= cfg.maxBodies) {
      const oldest = this.items.shift();
      if (oldest) Composite.remove(this.engine.world, oldest.body);
    }
    const radius = size * 0.34;
    const body = Bodies.circle(x, y, radius, {
      restitution: cfg.restitution,
      friction: cfg.friction,
      frictionAir: cfg.frictionAir,
      density: 0.0016,
    });
    const speed = cfg.launchSpeed * boost;
    Body.setVelocity(body, {
      x: dirX * speed * (0.85 + Math.random() * 0.4),
      y: -Math.abs(speed) * cfg.launchLift * (0.75 + Math.random() * 0.5),
    });
    const spin = cfg.spinSpeed * (1 + (Math.random() - 0.5) * cfg.spinRandomness * 2);
    Body.setAngularVelocity(body, (Math.random() < 0.5 ? -1 : 1) * spin * 1.4);
    Composite.add(this.engine.world, body);
    this.items.push({
      id: this.nextId++,
      art,
      body,
      size,
      lifeMs: 0,
      maxLifeMs: cfg.bodyLifetime,
      trail: [],
    });
  }

  step(dtMs: number, timeScale = 1): void {
    if (this.items.length === 0) return;
    this.accumulator += dtMs * timeScale;
    let steps = 0;
    while (this.accumulator >= STEP_MS && steps < 3) {
      Engine.update(this.engine, STEP_MS);
      this.accumulator -= STEP_MS;
      steps += 1;
    }
    if (steps === 3) this.accumulator = 0;

    const w = this.bounds.w || 400;
    const h = this.bounds.h || 640;
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const item = this.items[i];
      item.lifeMs += dtMs;
      const p = item.body.position;
      if (steps > 0) {
        item.trail.push({ x: p.x, y: p.y, a: item.body.angle });
        if (item.trail.length > MAX_TRAIL) item.trail.shift();
      }
      const gone =
        item.lifeMs > item.maxLifeMs || p.y > h + 240 || p.x < -260 || p.x > w + 260;
      if (gone) {
        Composite.remove(this.engine.world, item.body);
        this.items.splice(i, 1);
      }
    }
  }
}