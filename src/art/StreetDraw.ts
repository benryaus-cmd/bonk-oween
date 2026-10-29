import { mixHex } from '@/art/palette';
import type { GameConfig } from '@/config/defaults';

/** Perspective Halloween street. Houses are cached once per canvas size/palette. */
export class StreetDraw {
  private background: HTMLCanvasElement | null = null;
  private house: HTMLCanvasElement | null = null;
  private key = '';
  private horizon = 0;

  private half(w: number, h: number, y: number): number {
    const depth = Math.max(0, Math.min(1, (y - this.horizon) / (h - this.horizon)));
    return w * (0.055 + depth * 0.37);
  }

  private makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] | null {
    const c = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    const g = c.getContext('2d');
    if (!g) return null;
    g.scale(dpr, dpr);
    return [c, g];
  }

  private build(w: number, h: number, cfg: GameConfig): void {
    this.horizon = h * 0.29;
    const made = this.makeCanvas(w, h);
    if (!made) return;
    const [canvas, g] = made;
    const hz = this.horizon;
    const sky = g.createLinearGradient(0, 0, 0, hz + 100);
    sky.addColorStop(0, mixHex(cfg.backgroundColour, cfg.backgroundSecondary, 0.84));
    sky.addColorStop(1, mixHex(cfg.backgroundColour, '#05010C', 0.34));
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      g.globalAlpha = 0.18 + ((i * 13) % 10) / 27;
      g.fillStyle = '#FFF5D6'; g.beginPath();
      g.arc(((i * 137) % 101) / 101 * w, ((i * 61) % 41) / 100 * h, 0.8 + i % 3 * 0.4, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    const mx = w * 0.78, my = Math.max(44, hz * 0.34);
    g.fillStyle = 'rgba(255,225,173,0.11)'; g.beginPath(); g.arc(mx, my, 53, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFE5AB'; g.beginPath(); g.arc(mx, my, 25, 0, Math.PI * 2); g.fill();
    g.fillStyle = mixHex(cfg.backgroundSecondary, '#03020B', 0.65);
    g.beginPath(); g.moveTo(0, hz + 22);
    for (let x = 0; x <= w; x += w / 12) {
      g.lineTo(x, hz - 19 - (Math.sin(x * 0.08) + 1) * 13);
      g.lineTo(x + w / 24, hz + 15);
    }
    g.lineTo(w, hz + 55); g.lineTo(0, hz + 55); g.fill();
    g.fillStyle = '#151126'; g.fillRect(0, hz, w, h - hz);
    const edge = this.half(w, h, h);
    g.fillStyle = '#292333'; g.beginPath();
    g.moveTo(w / 2 - w * 0.06, hz); g.lineTo(w / 2 + w * 0.06, hz);
    g.lineTo(w / 2 + edge, h); g.lineTo(w / 2 - edge, h); g.fill();
    for (const side of [-1, 1]) {
      const sx = w / 2 + side * w * 0.06, ex = w / 2 + side * edge;
      g.fillStyle = side < 0 ? '#292238' : '#241E33'; g.beginPath();
      g.moveTo(sx, hz); g.lineTo(sx + side * w * 0.055, hz);
      g.lineTo(ex + side * w * 0.12, h); g.lineTo(ex, h); g.fill();
      g.strokeStyle = 'rgba(208,174,153,0.35)'; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(sx, hz); g.lineTo(ex, h); g.stroke();
    }
    const glow = g.createLinearGradient(0, hz, 0, h);
    glow.addColorStop(0, 'rgba(255,191,105,0.07)'); glow.addColorStop(1, 'rgba(8,4,15,0.14)');
    g.fillStyle = glow; g.beginPath(); g.moveTo(w / 2, hz);
    g.lineTo(w / 2 + edge, h); g.lineTo(w / 2 - edge, h); g.fill();
    const vig = g.createRadialGradient(w / 2, h * 0.55, w * 0.14, w / 2, h * 0.55, w * 0.81);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(2,0,8,0.61)');
    g.fillStyle = vig; g.fillRect(0, 0, w, h);
    this.background = canvas;

    const sprite = this.makeCanvas(144, 166);
    if (!sprite) return;
    const [house, hg] = sprite;
    // Narrow side wall faces the road; mirroring turns each row inward.
    hg.fillStyle = '#130E20'; hg.beginPath();
    hg.moveTo(8, 57); hg.lineTo(25, 46); hg.lineTo(25, 157); hg.lineTo(8, 148); hg.fill();
    hg.fillStyle = mixHex(cfg.backgroundSecondary, '#100C1C', 0.45);
    hg.fillRect(25, 46, 100, 111);
    hg.fillStyle = '#1A1125'; hg.beginPath();
    hg.moveTo(12, 53); hg.lineTo(71, 6); hg.lineTo(136, 52);
    hg.lineTo(124, 56); hg.lineTo(72, 23); hg.lineTo(24, 59); hg.fill();
    hg.fillStyle = '#36243C'; hg.fillRect(21, 153, 110, 7);
    for (const x of [39, 100]) {
      hg.fillStyle = 'rgba(255,184,76,0.20)'; hg.fillRect(x - 7, 65, 30, 38);
      hg.fillStyle = '#F5B568'; hg.fillRect(x, 72, 17, 26);
      hg.fillStyle = '#3C2133'; hg.fillRect(x + 7, 72, 3, 26); hg.fillRect(x, 83, 17, 3);
    }
    hg.fillStyle = '#342041'; hg.fillRect(64, 108, 28, 47);
    hg.fillStyle = '#EBC380'; hg.beginPath(); hg.arc(84, 132, 2, 0, Math.PI * 2); hg.fill();
    hg.fillStyle = '#4D334A'; hg.fillRect(31, 118, 5, 39); hg.fillRect(116, 118, 5, 39);
    hg.fillStyle = '#E2762C'; hg.beginPath(); hg.ellipse(26, 151, 10, 8, 0, 0, Math.PI * 2); hg.fill();
    hg.fillStyle = '#421C13'; hg.fillRect(24, 140, 3, 5);
    this.house = house;
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, timeMs: number, cfg: GameConfig): void {
    const key = [w, h, cfg.backgroundColour, cfg.backgroundSecondary].join('|');
    if (key !== this.key || !this.background) { this.build(w, h, cfg); this.key = key; }
    if (this.background) ctx.drawImage(this.background, 0, 0, w, h);
    const phase = timeMs / 1000 * cfg.backgroundAnimationSpeed * (cfg.reducedMotion ? 0.32 : 1) * 0.16;
    for (let i = 0; i < 10; i++) {
      const depth = ((i / 10 + phase) % 1 + 1) % 1, d = depth * depth;
      const y = this.horizon + (h - this.horizon) * d;
      const edge = this.half(w, h, y), width = 1 + d * 7;
      ctx.globalAlpha = 0.1 + d * 0.25; ctx.fillStyle = '#D6BA9E';
      for (const side of [-1, 1]) {
        const x = w / 2 + side * edge;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + side * width, y);
        ctx.lineTo(x + side * (width + 3), y + 3 + d * 13);
        ctx.lineTo(x + side * 2, y + 3 + d * 13); ctx.fill();
      }
      ctx.globalAlpha = 0.1 + d * 0.14; ctx.fillStyle = '#E3C495';
      ctx.beginPath(); ctx.moveTo(w / 2 - d * 1.5, y); ctx.lineTo(w / 2 + d * 1.5, y);
      ctx.lineTo(w / 2 + d * 2.5, y + 5 + d * 15);
      ctx.lineTo(w / 2 - d * 2.5, y + 5 + d * 15); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!this.house) return;
    for (let i = 0; i < 5; i++) {
      const depth = ((i / 5 + phase * 0.5) % 1 + 1) % 1, d = depth * depth;
      const y = this.horizon + (h - this.horizon) * d;
      const scale = 0.13 + depth * 1.55;
      const edge = this.half(w, h, y);
      const fade = Math.min(1, depth * 9, (1 - depth) * 7);
      for (const side of [-1, 1]) {
        const x = w / 2 + side * (edge + scale * 84);
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y); ctx.scale(side * scale, scale);
        ctx.drawImage(this.house, -72, -156, 144, 166); ctx.restore();
      }
      if (i % 2 === 0 && depth < 0.59 && depth > 0.12) {
        const k = 0.22 + depth * 0.56, side = i % 4 === 0 ? -1 : 1;
        const x = w / 2 + side * (edge + 19 * k);
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y + 2); ctx.scale(k, k);
        ctx.fillStyle = '#171026'; ctx.beginPath();
        ctx.moveTo(-9, 0); ctx.lineTo(-6, -28); ctx.lineTo(6, -28); ctx.lineTo(9, 0); ctx.fill();
        ctx.fillStyle = i % 4 ? '#CF7745' : '#CCC1CE';
        ctx.beginPath(); ctx.arc(0, -35, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#E8A947'; ctx.fillRect(7, -13, 10, 10); ctx.restore();
      }
    }
  }
}
