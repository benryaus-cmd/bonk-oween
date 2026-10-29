import { DEFAULT_CONFIG, type GameConfig } from '@/config/defaults';

export type ParticleShape = 'dot' | 'spark' | 'star' | 'confetti' | 'sliver';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
  size: number;
  color: string;
  shape: ParticleShape;
  rot: number;
  spin: number;
  gravity: number;
  drag: number;
}

interface Ring {
  x: number;
  y: number;
  r: number;
  maxR: number;
  speed: number;
  life: number;
  ttl: number;
  color: string;
  width: number;
}

interface Floater {
  x: number;
  originX: number;
  y: number;
  vy: number;
  life: number;
  ttl: number;
  text: string;
  color: string;
  size: number;
}

/** A candy travelling on a curved arc into the trick-or-treat bag. */
interface CandyArc {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  life: number;
  ttl: number;
  color: string;
  size: number;
}

const MAX_PARTICLES = 320;
const MAX_RINGS = 24;
const MAX_FLOATERS = 18;
const MAX_ARCS = 20;
const FONT = '900 %spx ui-rounded, "Trebuchet MS", system-ui, sans-serif';

export interface BurstOptions {
  spread?: number;
  angle?: number;
  size?: number;
  lifetime?: number;
  shapes?: ParticleShape[];
}

/** Cheap custom particle system — never uses physics bodies or DOM nodes. */
export class Effects {
  private cfg: GameConfig = DEFAULT_CONFIG;
  private particles: Particle[] = [];
  private rings: Ring[] = [];
  private floaters: Floater[] = [];
  private arcs: CandyArc[] = [];
  private flash = 0;
  private flashColor = '#FFFFFF';
  private shakeAmp = 0;
  private pulseAmount = 0;
  private centerX = 200;

  setCenterX(x: number): void { this.centerX = x; }

  setConfig(cfg: GameConfig): void {
    this.cfg = cfg;
    if (cfg.reducedMotion) this.shakeAmp = 0;
  }

  reset(): void {
    this.particles = [];
    this.rings = [];
    this.floaters = [];
    this.arcs = [];
    this.flash = 0;
    this.shakeAmp = 0;
    this.pulseAmount = 0;
  }

  private quality(): number {
    return this.cfg.reducedMotion ? 0.35 : this.cfg.effectsQuality;
  }

  burst(x: number, y: number, colors: string[], count: number, speed: number, opts: BurstOptions = {}): void {
    const q = this.quality();
    const n = Math.max(0, Math.round(count * q));
    const shapes = opts.shapes ?? ['dot', 'spark', 'star', 'sliver'];
    const spread = opts.spread ?? Math.PI * 2;
    const baseAngle = opts.angle ?? 0;
    for (let i = 0; i < n; i += 1) {
      if (this.particles.length >= MAX_PARTICLES) break;
      const a = baseAngle + (Math.random() - 0.5) * spread;
      const sp = speed * (0.35 + Math.random() * 0.9) * (this.cfg.particleSpeed / 4);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0,
        ttl: (opts.lifetime ?? this.cfg.particleLifetime) * (0.7 + Math.random() * 0.6),
        size: (opts.size ?? 1) * this.cfg.particleSize * (2 + Math.random() * 3.4),
        color: colors[(Math.random() * colors.length) | 0],
        shape: shapes[(Math.random() * shapes.length) | 0],
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.4,
        gravity: this.cfg.particleGravity * (0.4 + Math.random()),
        drag: this.cfg.particleDrag,
      });
    }
  }

  ring(x: number, y: number, color: string, radius?: number, speed?: number, count?: number): void {
    const rings = count ?? this.cfg.impactRingCount;
    const q = this.quality();
    for (let i = 0; i < rings; i += 1) {
      if (this.rings.length >= MAX_RINGS) break;
      const base = (radius ?? this.cfg.impactRingRadius) * (1 + i * 0.45);
      this.rings.push({
        x,
        y,
        r: base * 0.4,
        maxR: base * (2.1 + i * 0.4),
        speed: (speed ?? this.cfg.ringExpansionSpeed) * (1 - i * 0.16) * q,
        life: 0,
        ttl: 300 + i * 60,
        color,
        width: 4 - i * 0.7,
      });
    }
  }

  floater(x: number, y: number, text: string, color: string, size = 26): void {
    if (this.floaters.length >= MAX_FLOATERS) this.floaters.shift();
    this.floaters.push({
      x,
      originX: x,
      y,
      vy: -0.6,
      life: 0,
      ttl: this.cfg.floatingTextDuration,
      text,
      color,
      size: size * this.cfg.floatingTextScale,
    });
  }

  addShake(amount: number): void {
    if (this.cfg.reducedMotion) return;
    this.shakeAmp = Math.min(26, Math.max(this.shakeAmp, amount * this.cfg.shakeStrength));
  }

  addFlash(color: string, strength: number): void {
    if (this.cfg.reducedMotion) return;
    if (strength >= this.flash) {
      this.flashColor = color;
      this.flash = Math.min(1, strength);
    }
  }

  addPulse(strength: number): void {
    if (this.cfg.reducedMotion) return;
    this.pulseAmount = Math.min(1, Math.max(this.pulseAmount, strength));
  }

  get pulse(): number {
    return this.pulseAmount * this.cfg.backgroundPulseStrength;
  }

  get count(): number {
    return this.particles.length;
  }

  update(dtMs: number): void {
    const f = dtMs / 16.667;
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life += dtMs;
      if (p.life >= p.ttl) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * f;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx * f;
      p.y += p.vy * f;
      p.rot += p.spin * f;
    }
    for (let i = this.rings.length - 1; i >= 0; i -= 1) {
      const r = this.rings[i];
      r.life += dtMs;
      r.r += r.speed * f;
      if (r.life >= r.ttl || r.r >= r.maxR) this.rings.splice(i, 1);
    }
    for (let i = this.floaters.length - 1; i >= 0; i -= 1) {
      const t = this.floaters[i];
      t.life += dtMs;
      if (t.life >= t.ttl) {
        this.floaters.splice(i, 1);
        continue;
      }
      t.y += t.vy * f;
      t.vy *= 0.985;
      const k = t.life / t.ttl;
      const towardCenter = Math.max(-25, Math.min(25, this.centerX - t.originX));
      t.x = t.originX + towardCenter * k + Math.sin(k * Math.PI * 5) * 4 * (1 - k);
    }
    for (let i = this.arcs.length - 1; i >= 0; i -= 1) {
      const a = this.arcs[i];
      a.life += dtMs;
      if (a.life >= a.ttl) this.arcs.splice(i, 1);
    }
    this.flash = Math.max(0, this.flash - dtMs / Math.max(60, this.cfg.flashDuration));
    this.pulseAmount = Math.max(0, this.pulseAmount - dtMs / 420);
    this.shakeAmp *= Math.pow(this.cfg.shakeDecay, f);
    if (this.shakeAmp < 0.15) this.shakeAmp = 0;
  }

  shakeOffset(): { x: number; y: number } {
    if (this.shakeAmp <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.shakeAmp * 1.8,
      y: (Math.random() - 0.5) * this.shakeAmp * 1.8,
    };
  }

  /** Curved candy flight from the hit point into the bag. */
  arcTo(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    size = 5,
  ): void {
    if (this.arcs.length >= MAX_ARCS) this.arcs.shift();
    this.arcs.push({
      x0,
      y0,
      x1,
      y1,
      cx: (x0 + x1) / 2,
      cy: Math.min(y0, y1) - 44,
      life: 0,
      ttl: 340,
      color,
      size,
    });
  }

  drawArcs(ctx: CanvasRenderingContext2D): void {
    if (this.arcs.length === 0) return;
    for (const a of this.arcs) {
      const k = Math.min(1, a.life / a.ttl);
      const e = k * k * (3 - 2 * k);
      const inv = 1 - e;
      const x = inv * inv * a.x0 + 2 * inv * e * a.cx + e * e * a.x1;
      const y = inv * inv * a.y0 + 2 * inv * e * a.cy + e * e * a.y1;
      ctx.globalAlpha = Math.min(1, (1 - k) * 1.6);
      ctx.fillStyle = a.color;
      ctx.beginPath();
      ctx.arc(x, y, a.size * (1 - k * 0.25), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = Math.min(0.5, (1 - k) * 0.7);
      ctx.strokeStyle = a.color;
      ctx.lineWidth = a.size * 0.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 8, y - 5);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  drawRings(ctx: CanvasRenderingContext2D): void {
    if (this.rings.length === 0) return;
    for (const r of this.rings) {
      const k = r.life / r.ttl;
      ctx.globalAlpha = Math.max(0, 0.85 * (1 - k));
      ctx.strokeStyle = r.color;
      ctx.lineWidth = Math.max(0.6, r.width * (1 - k));
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const k = 1 - p.life / p.ttl;
      ctx.globalAlpha = Math.min(1, k * 1.4);
      ctx.fillStyle = p.color;
      const size = p.size * (0.35 + k * 0.65);
      if (p.shape === 'spark') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1, size * 0.5);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4);
        ctx.stroke();
      } else if (p.shape === 'star') {
        ctx.beginPath();
        for (let s = 0; s < 8; s += 1) {
          const a = p.rot + (s / 8) * Math.PI * 2;
          const rr = s % 2 === 0 ? size * 1.5 : size * 0.6;
          const sx = p.x + Math.cos(a) * rr;
          const sy = p.y + Math.sin(a) * rr;
          if (s === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'confetti') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-size, -size * 0.4, size * 2, size * 0.8);
        ctx.restore();
      } else if (p.shape === 'sliver') {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(p.rot) * size * 2.4, p.y + Math.sin(p.rot) * size * 2.4);
        ctx.lineTo(p.x + Math.cos(p.rot + 2) * size, p.y + Math.sin(p.rot + 2) * size);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  drawFloaters(ctx: CanvasRenderingContext2D): void {
    if (this.floaters.length === 0) return;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const t of this.floaters) {
      const k = t.life / t.ttl;
      const a = k < 0.12 ? k / 0.12 : 1 - Math.max(0, (k - 0.62) / 0.38);
      const pop = k < 0.14 ? 0.62 + (k / 0.14) * 0.5 : 1.12 - (k - 0.14) * 0.1;
      ctx.globalAlpha = Math.max(0, Math.min(0.5, a * 0.5));
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(Math.sin(k * Math.PI * 6) * 0.075 * (1 - k));
      ctx.font = FONT.replace('%s', String(Math.round(t.size * pop)));
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'rgba(20,4,38,0.9)';
      ctx.strokeText(t.text, 0, 0);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  drawFlash(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.flash <= 0.01) return;
    ctx.globalAlpha = this.flash * this.cfg.flashOpacity;
    ctx.fillStyle = this.flashColor;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }
}
