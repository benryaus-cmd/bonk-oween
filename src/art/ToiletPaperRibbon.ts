interface Point { x: number; y: number; px: number; py: number }
interface Strip { points: Point[]; lastTime: number; seen: number }

/** A tiny cosmetic Verlet strip: one fixed end, damped free end, no collisions. */
export class ToiletPaperRibbon {
  private strips = new Map<string, Strip>();

  clear(): void { this.strips.clear(); }

  draw(
    ctx: CanvasRenderingContext2D,
    id: string,
    x: number,
    y: number,
    direction: number,
    size: number,
    timeMs: number,
  ): void {
    const length = Math.max(6, size * 0.15);
    let strip = this.strips.get(id);
    if (!strip) {
      const points = Array.from({ length: 10 }, (_, i) => ({
        x: x - direction * i * length,
        y: y + i * length * 0.35,
        px: x - direction * i * length,
        py: y + i * length * 0.35,
      }));
      strip = { points, lastTime: timeMs, seen: timeMs };
      this.strips.set(id, strip);
    }
    const dt = Math.max(0, Math.min(32, timeMs - strip.lastTime)) / 16.67;
    strip.lastTime = timeMs;
    strip.seen = timeMs;
    const points = strip.points;
    // A moving anchor drags the paper; the tip follows and falls with gravity.
    points[0].x = x;
    points[0].y = y;
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      const vx = (p.x - p.px) * 0.87;
      const vy = (p.y - p.py) * 0.87;
      p.px = p.x; p.py = p.y;
      p.x += vx + Math.sin(timeMs * 0.006 + i * 0.8) * 0.2 * dt;
      p.y += vy + 0.55 * dt * dt;
    }
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.max(0.001, Math.hypot(dx, dy));
        const f = (d - length) / d;
        b.x -= dx * f * (i === 1 ? 1 : 0.6);
        b.y -= dy * f * (i === 1 ? 1 : 0.6);
        if (i > 1) { a.x += dx * f * 0.4; a.y += dy * f * 0.4; }
      }
      points[0].x = x; points[0].y = y;
    }

    const width = Math.max(5, size * 0.15);
    ctx.save();
    ctx.fillStyle = '#FBFAFF';
    ctx.strokeStyle = 'rgba(72,51,95,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const p = points[i], prev = points[Math.max(0, i - 1)], next = points[Math.min(points.length - 1, i + 1)];
      const d = Math.max(0.001, Math.hypot(next.x - prev.x, next.y - prev.y));
      const nx = -(next.y - prev.y) / d, ny = (next.x - prev.x) / d;
      const taper = width * (1 - i / points.length * 0.22);
      if (i === 0) ctx.moveTo(p.x + nx * taper, p.y + ny * taper);
      else ctx.lineTo(p.x + nx * taper, p.y + ny * taper);
    }
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i], prev = points[Math.max(0, i - 1)], next = points[Math.min(points.length - 1, i + 1)];
      const d = Math.max(0.001, Math.hypot(next.x - prev.x, next.y - prev.y));
      const nx = -(next.y - prev.y) / d, ny = (next.x - prev.x) / d;
      const taper = width * (1 - i / points.length * 0.22);
      ctx.lineTo(p.x - nx * taper, p.y - ny * taper);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(137,119,162,0.4)';
    ctx.lineWidth = 1;
    for (let i = 3; i < points.length; i += 3) {
      const p = points[i], before = points[i - 1], after = points[Math.min(points.length - 1, i + 1)];
      const d = Math.max(0.001, Math.hypot(after.x - before.x, after.y - before.y));
      const nx = -(after.y - before.y) / d, ny = (after.x - before.x) / d;
      ctx.beginPath(); ctx.moveTo(p.x + nx * width * 0.72, p.y + ny * width * 0.72);
      ctx.lineTo(p.x - nx * width * 0.72, p.y - ny * width * 0.72); ctx.stroke();
    }
    ctx.restore();
    if (this.strips.size > 24) {
      for (const [key, value] of this.strips) {
        if (timeMs - value.seen > 250) this.strips.delete(key);
      }
    }
  }
}
