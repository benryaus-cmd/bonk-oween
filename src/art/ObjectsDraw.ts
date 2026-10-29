import { alpha, type ArtPalette } from '@/art/palette';
import type { ObjectArt } from '@/game/types';

export interface ObjectDrawOptions {
  clock: number;
  palette: ArtPalette;
  line: number;
  glow?: number;
}

function ol(ctx: CanvasRenderingContext2D, p: ArtPalette, w: number): void {
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = w;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

function gloss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot: number,
  a = 0.6,
): void {
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

/* ───────────────────────── CANDY ───────────────────────── */

function drawWrapped(ctx: CanvasRenderingContext2D, p: ArtPalette, t: number): void {
  const sway = Math.sin(t / 480) * 0.07;
  ctx.rotate(sway);
  // twisted wrapper ends
  ctx.fillStyle = '#C77DFF';
  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.moveTo(s * 13, 0);
    ctx.quadraticCurveTo(s * 27, -14, s * 31, -6);
    ctx.quadraticCurveTo(s * 25, 0, s * 31, 6);
    ctx.quadraticCurveTo(s * 27, 14, s * 13, 0);
    ctx.closePath();
    ctx.fill();
    ol(ctx, p, 2.6);
  });
  // candy body
  ctx.fillStyle = '#FF5FA2';
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 3);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 15, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = '#FFFDD0';
  ctx.lineWidth = 4;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 9 - 10, -16);
    ctx.lineTo(i * 9 + 6, 16);
    ctx.stroke();
  }
  ctx.restore();
  gloss(ctx, -6, -6, 6, 3.6, -0.5, 0.6);
}

function drawLollipop(ctx: CanvasRenderingContext2D, p: ArtPalette, t: number): void {
  ctx.rotate(Math.sin(t / 700) * 0.12);
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(2, 30);
  ctx.stroke();
  ctx.fillStyle = '#EAF2F8';
  ctx.fillRect(-1.4, 6, 5, 24);
  ctx.strokeStyle = p.outline;
  ctx.strokeRect(-1.4, 6, 5, 24);
  ctx.fillStyle = '#FFD84D';
  ctx.beginPath();
  ctx.arc(0, -6, 21, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 3);
  ctx.strokeStyle = '#FF5FA2';
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 4.4; a += 0.22) {
    const r = 2.2 + a * 1.55;
    const x = Math.cos(a) * r;
    const y = -6 + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  gloss(ctx, -8, -15, 6, 3.4, -0.6, 0.65);
}

function drawChocBar(ctx: CanvasRenderingContext2D, p: ArtPalette, t: number): void {
  ctx.rotate(Math.sin(t / 900) * 0.05 - 0.08);
  ctx.fillStyle = '#6B3B22';
  ctx.beginPath();
  ctx.roundRect(-26, -15, 52, 30, 5);
  ctx.fill();
  ol(ctx, p, 3);
  ctx.fillStyle = '#8A4B2A';
  for (let r = 0; r < 2; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      ctx.beginPath();
      ctx.roundRect(-24 + c * 12, -13 + r * 14, 10, 12, 3);
      ctx.fill();
    }
  }
  // torn wrapper at the left end
  ctx.fillStyle = '#FFD84D';
  ctx.beginPath();
  ctx.moveTo(-26, -17);
  ctx.lineTo(-9, -17);
  ctx.lineTo(-13, -6);
  ctx.lineTo(-9, 5);
  ctx.lineTo(-13, 17);
  ctx.lineTo(-26, 17);
  ctx.closePath();
  ctx.fill();
  ol(ctx, p, 2.6);
  ctx.fillStyle = '#E8A800';
  ctx.beginPath();
  ctx.roundRect(-23, -4, 9, 8, 2);
  ctx.fill();
  gloss(ctx, -14, -9, 5, 3, -0.3, 0.5);
}

function drawGummy(ctx: CanvasRenderingContext2D, p: ArtPalette, t: number): void {
  ctx.rotate(Math.sin(t / 640) * 0.06);
  // sweets poking out of the bag
  ctx.fillStyle = '#FF7FB0';
  ctx.beginPath();
  ctx.arc(-11, -13, 7, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 2.2);
  ctx.fillStyle = '#7CFF9A';
  ctx.beginPath();
  ctx.arc(2, -17, 7.4, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 2.2);
  ctx.fillStyle = '#FFD84D';
  ctx.beginPath();
  ctx.arc(15, -12, 6.6, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 2.2);
  // bag
  ctx.fillStyle = alpha('#C77DFF', 0.55);
  ctx.beginPath();
  ctx.moveTo(-22, -10);
  ctx.lineTo(22, -10);
  ctx.quadraticCurveTo(25, 22, 0, 26);
  ctx.quadraticCurveTo(-25, 22, -22, -10);
  ctx.closePath();
  ctx.fill();
  ol(ctx, p, 3);
  ctx.fillStyle = '#FFFDD0';
  ctx.beginPath();
  ctx.roundRect(-13, 4, 26, 10, 3);
  ctx.fill();
  ol(ctx, p, 2);
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-8, 9);
  ctx.lineTo(8, 9);
  ctx.stroke();
  ctx.fillStyle = '#E8452F';
  ctx.beginPath();
  ctx.arc(-16, 16, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7CFF9A';
  ctx.beginPath();
  ctx.arc(16, 17, 3.2, 0, Math.PI * 2);
  ctx.fill();
  gloss(ctx, -15, -4, 6, 3, -0.4, 0.4);
}

function drawCandyCorn(ctx: CanvasRenderingContext2D, p: ArtPalette, t: number): void {
  ctx.rotate(Math.sin(t / 520) * 0.1);
  const tiers: Array<[number, string]> = [
    [-27, '#FFF6D8'],
    [-9, '#FFC02E'],
    [9, '#FF7518'],
  ];
  ctx.fillStyle = '#FFF6D8';
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.quadraticCurveTo(13, -8, 24, 26);
  ctx.quadraticCurveTo(0, 31, -24, 26);
  ctx.quadraticCurveTo(-13, -8, 0, -30);
  ctx.closePath();
  ctx.fill();
  ol(ctx, p, 3);
  ctx.save();
  ctx.clip();
  tiers.forEach(([y, color], i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, y + (i === 0 ? -6 : 10), 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
  ctx.strokeStyle = alpha(p.outline, 0.5);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-14, -12);
  ctx.quadraticCurveTo(0, -8, 14, -12);
  ctx.stroke();
  gloss(ctx, -6, -16, 4, 7, -0.2, 0.55);
}

/* ───────────────────────── THROWN JUNK ───────────────────────── */

function drawEgg(ctx: CanvasRenderingContext2D, p: ArtPalette, t: number): void {
  ctx.rotate(Math.sin(t / 480) * 0.14);
  ctx.fillStyle = '#FFF7E8';
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.bezierCurveTo(16, -22, 22, -4, 22, 6);
  ctx.bezierCurveTo(22, 20, 12, 26, 0, 26);
  ctx.bezierCurveTo(-12, 26, -22, 20, -22, 6);
  ctx.bezierCurveTo(-22, -4, -16, -22, 0, -26);
  ctx.closePath();
  ctx.fill();
  ol(ctx, p, 3);
  ctx.fillStyle = '#EEDFC6';
  ctx.beginPath();
  ctx.ellipse(9, 10, 11, 13, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // speckles
  ctx.fillStyle = alpha('#C9B48F', 0.85);
  [[-7, -6], [7, -10], [-11, 10], [4, 14], [13, -2]].forEach(([x, y], i) => {
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + (i % 3) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });
  // crack
  ctx.strokeStyle = '#B99C6E';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-8, -16);
  ctx.lineTo(-2, -10);
  ctx.lineTo(-7, -4);
  ctx.lineTo(-1, 2);
  ctx.stroke();
  gloss(ctx, -7, -12, 5, 3.4, -0.5, 0.7);
}

function drawTpRoll(ctx: CanvasRenderingContext2D, p: ArtPalette, t: number): void {
  // The moving ribbon is simulated in ToiletPaperRibbon, behind this roll.
  // roll
  ctx.fillStyle = '#FBFAFF';
  ctx.beginPath();
  ctx.roundRect(-16, -22, 32, 46, 8);
  ctx.fill();
  ol(ctx, p, 3);
  ctx.fillStyle = alpha('#D8CFEA', 0.75);
  ctx.beginPath();
  ctx.roundRect(6, -20, 8, 42, 4);
  ctx.fill();
  // layers
  ctx.strokeStyle = alpha('#C9BEDE', 0.9);
  ctx.lineWidth = 1.6;
  [-8, 0, 8].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(-14, y);
    ctx.quadraticCurveTo(0, y + 4, 14, y);
    ctx.stroke();
  });
  // core
  ctx.fillStyle = '#C9BEDE';
  ctx.beginPath();
  ctx.ellipse(0, -22, 16, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 2.4);
  ctx.fillStyle = '#7A6B96';
  ctx.beginPath();
  ctx.ellipse(0, -22, 6, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  gloss(ctx, -8, -8, 3.6, 12, 0, 0.55);
}

/* ───────────────────────── GOLD / SPECIAL ───────────────────────── */

function drawPumpkin(ctx: CanvasRenderingContext2D, p: ArtPalette, t: number): void {
  const bob = Math.sin(t / 420) * 1.6;
  ctx.translate(0, bob);
  // stem
  ctx.fillStyle = '#4E8B3A';
  ctx.beginPath();
  ctx.moveTo(-3, -22);
  ctx.quadraticCurveTo(-1, -34, 6, -33);
  ctx.quadraticCurveTo(9, -31, 5, -28);
  ctx.lineTo(3, -20);
  ctx.closePath();
  ctx.fill();
  ol(ctx, p, 2.4);
  // body
  const body = '#FF7518';
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 2, 27, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 3);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 2, 27, 24, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#E85D0B';
  [-15, 0, 15].forEach((x) => {
    ctx.beginPath();
    ctx.ellipse(x, 2, 7, 26, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#FF9A3C';
  ctx.beginPath();
  ctx.ellipse(-9, -8, 6, 12, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // carved face
  ctx.fillStyle = '#2A1004';
  [-9, 9].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x - 6, -6);
    ctx.lineTo(x + 6, -6);
    ctx.lineTo(x, 2);
    ctx.closePath();
    ctx.fill();
  });
  ctx.beginPath();
  ctx.moveTo(-12, 10);
  ctx.quadraticCurveTo(-6, 4, 0, 10);
  ctx.quadraticCurveTo(6, 4, 12, 10);
  ctx.quadraticCurveTo(6, 20, 0, 20);
  ctx.quadraticCurveTo(-6, 20, -12, 10);
  ctx.closePath();
  ctx.fill();
  // sparks
  for (let i = 0; i < 3; i += 1) {
    const a = t / 300 + (i * Math.PI * 2) / 3;
    ctx.globalAlpha = 0.55 + Math.abs(Math.sin(a)) * 0.45;
    ctx.fillStyle = p.gold;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 34, -8 + Math.sin(a) * 30, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/* ───────────────────────── DO NOT BONK ───────────────────────── */

/** The object you must NOT slap: an unmistakable, innocent cartoon baby. */
function drawBaby(ctx: CanvasRenderingContext2D, p: ArtPalette, t: number): void {
  const rock = Math.sin(t / 520) * 0.07;
  const wave = Math.sin(t / 260) * 0.5;
  ctx.rotate(rock);
  const skin = '#FFE3D0';
  const skinDark = '#F3C6AC';
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(-19, -1 + wave * 2.4, 5, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 2.6);
  ctx.beginPath();
  ctx.arc(19, -1 - wave * 2.4, 5, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 2.6);
  // swaddle
  ctx.fillStyle = '#98C7FF';
  ctx.beginPath();
  ctx.roundRect(-17, 4, 34, 24, 11);
  ctx.fill();
  ol(ctx, p, 3);
  ctx.fillStyle = '#7FAEE8';
  ctx.beginPath();
  ctx.roundRect(-17, 18, 34, 10, 6);
  ctx.fill();
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-17, 18);
  ctx.lineTo(17, 18);
  ctx.stroke();
  // head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -7, 17.5, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 3);
  // hair curl
  ctx.strokeStyle = '#C98A4B';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.quadraticCurveTo(2, -32, 8, -31);
  ctx.quadraticCurveTo(11, -30.4, 9, -27.5);
  ctx.stroke();
  // wide innocent eyes
  ctx.fillStyle = p.white;
  ctx.beginPath();
  ctx.arc(-6.4, -9, 4.8, 0, Math.PI * 2);
  ctx.arc(6.4, -9, 4.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(-6.4, -9, 4.8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(6.4, -9, 4.8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = p.eye;
  ctx.beginPath();
  ctx.arc(-6.4, -8.6, 2.1, 0, Math.PI * 2);
  ctx.arc(6.4, -8.6, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.white;
  ctx.beginPath();
  ctx.arc(-5.6, -9.6, 0.9, 0, Math.PI * 2);
  ctx.arc(7.2, -9.6, 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,140,140,0.5)';
  ctx.beginPath();
  ctx.ellipse(-11.5, -3, 3.4, 2.2, 0.2, 0, Math.PI * 2);
  ctx.ellipse(11.5, -3, 3.4, 2.2, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // pacifier
  ctx.fillStyle = skinDark;
  ctx.beginPath();
  ctx.ellipse(0, 0.5, 3.2, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 1.6);
  ctx.fillStyle = '#7EC8F0';
  ctx.beginPath();
  ctx.arc(0, 3.4, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, p, 1.8);
  gloss(ctx, -8, -14, 4.6, 2.8, -0.5, 0.5);
}

/** Draw one object centred on the origin. `size` is the target box in px. */
export function drawObject(
  ctx: CanvasRenderingContext2D,
  art: ObjectArt,
  size: number,
  opts: ObjectDrawOptions,
): void {
  const s = size / 60;
  ctx.save();
  ctx.scale(s, s);
  if (opts.glow && opts.glow > 0) {
    ctx.fillStyle = alpha(opts.palette.gold, 0.18 * opts.glow);
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = alpha(opts.palette.gold, 0.12 * opts.glow);
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.fill();
  }
  switch (art) {
    case 'wrapped': drawWrapped(ctx, opts.palette, opts.clock); break;
    case 'lollipop': drawLollipop(ctx, opts.palette, opts.clock); break;
    case 'chocBar': drawChocBar(ctx, opts.palette, opts.clock); break;
    case 'gummy': drawGummy(ctx, opts.palette, opts.clock); break;
    case 'candyCorn': drawCandyCorn(ctx, opts.palette, opts.clock); break;
    case 'egg': drawEgg(ctx, opts.palette, opts.clock); break;
    case 'tpRoll': drawTpRoll(ctx, opts.palette, opts.clock); break;
    case 'pumpkin': drawPumpkin(ctx, opts.palette, opts.clock); break;
    default: drawBaby(ctx, opts.palette, opts.clock); break;
  }
  ctx.restore();
}

/** Local-space radius used for glow / warning rings. */
export function objectVisualRadius(art: ObjectArt): number {
  if (art === 'pumpkin') return 27;
  if (art === 'baby') return 21;
  if (art === 'tpRoll') return 24;
  return 22;
}
