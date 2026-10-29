import { armEnd, type ArmPose, type CharacterPose } from '@/art/CharacterPose';
import { drawCostume } from '@/art/CostumeDraw';
import { alpha, mixHex, type ArtPalette } from '@/art/palette';
import type { Side, Stain } from '@/game/types';

export interface GhostDrawOptions {
  costume?: 'ghost' | 'frankenstein' | 'vampire';
  x: number;
  y: number;
  scale: number;
  stretch: number;
  palette: ArtPalette;
  outline: number;
  shading: number;
  meltdown: number;
  clock: number;
  candy: number;
  stains: readonly Stain[];
}

const BAG_X = 42;
const BAG_Y = 46;

let gradCtx: CanvasRenderingContext2D | null = null;
let gradKey = '';
let sheetGrad: CanvasGradient | null = null;

/** Cached sheet gradient — never rebuilt inside the frame loop. */
function sheetFill(ctx: CanvasRenderingContext2D, p: ArtPalette): CanvasGradient {
  const key = `${p.primaryLight}|${p.primary}|${p.shadow}`;
  if (gradCtx !== ctx || gradKey !== key || !sheetGrad) {
    const g = ctx.createLinearGradient(-40, -112, 50, 96);
    g.addColorStop(0, mixHex(p.primary, '#FFFFFF', 0.5));
    g.addColorStop(0.45, p.primary);
    g.addColorStop(1, p.shadow);
    gradCtx = ctx;
    gradKey = key;
    sheetGrad = g;
  }
  return sheetGrad;
}

function sheetPath(ctx: CanvasRenderingContext2D, walk = 0): void {
  const flutter = Math.sin(walk - 0.65) * 8;
  const flutter2 = Math.sin(walk * 1.35 + 1.1) * 4;
  ctx.beginPath();
  ctx.moveTo(0, -112);
  ctx.bezierCurveTo(44, -112, 72, -84, 72, -26);
  ctx.bezierCurveTo(72, 12, 78 + flutter * .4, 48, 84 + flutter, 74 + flutter2);
  // wavy sheet hem
  ctx.quadraticCurveTo(66 + flutter, 92 + flutter2, 50 + flutter * .5, 78 - flutter2);
  ctx.quadraticCurveTo(32, 94 - flutter2, 14, 80 + flutter2);
  ctx.quadraticCurveTo(-4, 96 + flutter2, -22 - flutter * .5, 80 - flutter2);
  ctx.quadraticCurveTo(-42 - flutter, 94 - flutter2, -60 - flutter, 76 + flutter2);
  ctx.bezierCurveTo(-70, 46, -72, 12, -72, -26);
  ctx.bezierCurveTo(-72, -84, -44, -112, 0, -112);
  ctx.closePath();
}

function stroke(ctx: CanvasRenderingContext2D, p: ArtPalette, w: number): void {
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = w;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawHand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: number,
  arm: ArmPose,
  p: ArtPalette,
  line: number,
): void {
  const r = 17 + arm.spread * 4;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(arm.handRot);
  ctx.scale(arm.handScale, arm.handScale);
  ctx.fillStyle = p.primary;
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = line * 0.9;
  ctx.lineJoin = 'round';

  // mitten fingers
  for (let i = 0; i < 3; i += 1) {
    const spread = (i - 1) * 0.6;
    ctx.beginPath();
    ctx.ellipse(
      dir * (r * 0.5 + arm.spread * 10) * Math.cos(spread),
      (r * 0.5 + arm.spread * 10) * Math.sin(spread * 1.3),
      8.4,
      6.8,
      spread * 0.6,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(-dir * r * 0.22, -r * 0.7, 8, 6.4, dir * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.88, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // sheet hem seam on the mitt
  ctx.strokeStyle = alpha(p.outline, 0.32);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 2, r * 0.66, 2.5, 5.6);
  ctx.stroke();
  ctx.restore();
}

function drawArm(
  ctx: CanvasRenderingContext2D,
  side: Side,
  pose: CharacterPose,
  opts: GhostDrawOptions,
): void {
  const p = opts.palette;
  const line = opts.outline;
  const arm = side === 'left' ? pose.left : pose.right;
  const dir = side === 'left' ? -1 : 1;
  const sx = dir < 0 ? -54 : 56;
  const sy = -14;
  const end = armEnd(side, arm, opts.stretch);
  if (arm.contact) {
    end.x += (arm.contact.x - end.x) * arm.contact.blend;
    end.y += (arm.contact.y - end.y) * arm.contact.blend;
  }
  const dx = end.x - sx;
  const dy = end.y - sy;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const wBase = 15;
  const wTip = 10.5;
  const bow = (4 + 24 * Math.max(0, arm.reach) + 7 * arm.raise) * (dir > 0 ? 1 : -1);
  const mx = (sx + end.x) / 2 + nx * bow;
  const my = (sy + end.y) / 2 + ny * bow - 4;

  if (arm.reach > 0.6) {
    ctx.globalAlpha = Math.min(0.45, (arm.reach - 0.6) * 0.85);
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(end.x, end.y, 24 + arm.reach * 12, dir > 0 ? -1.1 : 0.6, dir > 0 ? 1.1 : 2.8);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.beginPath();
  ctx.moveTo(sx + nx * wBase, sy + ny * wBase);
  ctx.quadraticCurveTo(mx + nx * wBase, my + ny * wBase, end.x + nx * wTip, end.y + ny * wTip);
  ctx.lineTo(end.x - nx * wTip, end.y - ny * wTip);
  ctx.quadraticCurveTo(mx - nx * wBase, my - ny * wBase, sx - nx * wBase, sy - ny * wBase);
  ctx.closePath();
  ctx.fillStyle = p.primary;
  ctx.fill();
  stroke(ctx, p, line);

  if (opts.shading > 0.05) {
    ctx.save();
    ctx.globalAlpha = 0.3 * opts.shading;
    ctx.strokeStyle = p.shadow;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sx + nx * 4, sy + ny * 4 + 3);
    ctx.quadraticCurveTo(mx + nx * 4, my + ny * 4 + 3, end.x + nx * 4, end.y + ny * 4 + 3);
    ctx.stroke();
    ctx.restore();
  }

  drawHand(ctx, end.x, end.y, dir, arm, p, line);
}

function drawMouth(ctx: CanvasRenderingContext2D, pose: CharacterPose, p: ArtPalette, line: number): void {
  const y = -4;
  const open = pose.mouthOpen;
  ctx.fillStyle = p.outline;
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = line * 0.85;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (pose.mouth) {
    case 'open': {
      ctx.beginPath();
      ctx.ellipse(0, y + 2, 7 + open * 3, 5 + open * 9, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'grin': {
      ctx.beginPath();
      ctx.moveTo(-13, y - 2);
      ctx.quadraticCurveTo(0, y + 9 + open * 7, 13, y - 2);
      ctx.quadraticCurveTo(0, y + 4, -13, y - 2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'grit': {
      ctx.beginPath();
      ctx.roundRect(-12, y - 3, 24, 9 + open * 4, 3);
      ctx.fill();
      ctx.strokeStyle = p.cream;
      ctx.lineWidth = 1.4;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * 6, y - 2);
        ctx.lineTo(i * 6, y + 5 + open * 4);
        ctx.stroke();
      }
      break;
    }
    case 'wobble': {
      ctx.beginPath();
      ctx.moveTo(-13, y + 1);
      ctx.quadraticCurveTo(-6, y - 4, 0, y + 2);
      ctx.quadraticCurveTo(6, y + 7, 13, y);
      ctx.stroke();
      break;
    }
    case 'flat': {
      ctx.beginPath();
      ctx.moveTo(-11, y + 2);
      ctx.quadraticCurveTo(0, y - 1, 11, y + 2);
      ctx.stroke();
      break;
    }
    case 'pout': {
      ctx.beginPath();
      ctx.ellipse(0, y + 2, 4.6, 5.4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'smirk': {
      ctx.beginPath();
      ctx.moveTo(-12, y + 2);
      ctx.quadraticCurveTo(2, y + 9, 13, y - 4);
      ctx.stroke();
      break;
    }
    default: {
      ctx.beginPath();
      ctx.moveTo(-12, y);
      ctx.quadraticCurveTo(0, y + 8, 12, y - 1);
      ctx.stroke();
    }
  }
  if (pose.tongue > 0.25) {
    ctx.fillStyle = p.coral;
    ctx.beginPath();
    ctx.ellipse(1, y + 7, 5, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Irregular translucent pigment absorbs into the sheet rather than sitting like a decal. */
function splatPath(ctx: CanvasRenderingContext2D, radiusX: number, radiusY: number, seed: number): void {
  ctx.beginPath();
  for (let i = 0; i <= 20; i += 1) {
    const a = i / 20 * Math.PI * 2;
    const r = 1 + Math.sin(i * 2.4 + seed) * .13 + Math.sin(i * 4.6 + seed * 1.7) * .075;
    const x = Math.cos(a) * radiusX * r;
    const y = Math.sin(a) * radiusY * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawStains(
  ctx: CanvasRenderingContext2D,
  stains: readonly Stain[],
  p: ArtPalette,
  line: number,
  walk: number,
): void {
  for (const s of stains) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.scale(s.size, s.size);
    if (s.kind === 'egg') {
      ctx.fillStyle = 'rgba(85,73,86,.19)';
      splatPath(ctx, 24, 17, s.x * .13 + s.y); ctx.fill();
      ctx.fillStyle = 'rgba(205,184,111,.29)';
      splatPath(ctx, 18, 13, s.x * .13 + s.y); ctx.fill();
      ctx.fillStyle = 'rgba(242,205,78,.64)';
      splatPath(ctx, 10, 7.5, s.y * .17); ctx.fill();

      ctx.fillStyle = '#FFD75E';
      [-9, 6].forEach((dx) => {
        ctx.beginPath();
        ctx.ellipse(dx, 12, 2.6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (s.kind === 'tp') {
      // One strip wraps over the shoulder and hangs free, following the walk.
      const sway = Math.sin(walk * 0.8 + s.x * 0.1) * 6;
      ctx.fillStyle = '#FBFAFF';
      ctx.beginPath();
      ctx.moveTo(-27, -9); ctx.quadraticCurveTo(-7, -17, 19, -7);
      ctx.quadraticCurveTo(34, 1, 18, 12);
      ctx.lineTo(11, 7); ctx.quadraticCurveTo(20, 1, 13, -1);
      ctx.quadraticCurveTo(-5, -5, -27, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = alpha(p.outline, 0.45); ctx.lineWidth = line * 0.43; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, 6); ctx.lineTo(22, 8);
      ctx.quadraticCurveTo(31 + sway, 30, 22 + sway, 68);
      ctx.lineTo(7 + sway, 69); ctx.quadraticCurveTo(18 + sway, 35, 12, 6);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = alpha(p.shadow, 0.35); ctx.lineWidth = 1.2;
      for (const y of [25, 48]) {
        ctx.beginPath(); ctx.moveTo(15 + sway * (y / 70), y);
        ctx.lineTo(26 + sway * (y / 70), y + 1); ctx.stroke();
      }
    } else {
      ctx.fillStyle = 'rgba(199,75,12,.24)';
      splatPath(ctx, 26, 18, s.x * .12 + s.y); ctx.fill();
      ctx.fillStyle = 'rgba(234,97,17,.56)';
      splatPath(ctx, 18, 13, s.y * .14); ctx.fill();
      ctx.fillStyle = '#E85D0B';
      ctx.beginPath();
      ctx.ellipse(4, 3, 10, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF0C0';
      [[-8, -4], [6, -6], [2, 6]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, 2.6, 1.7, 0.4, 0, Math.PI * 2);
        ctx.fill();
      });

    }
    ctx.restore();
  }
}

function bagPouchPath(ctx: CanvasRenderingContext2D, r: number): void {
  ctx.beginPath();
  ctx.moveTo(-r, -r * 0.9);
  ctx.quadraticCurveTo(-r * 1.2, r, 0, r * 1.1);
  ctx.quadraticCurveTo(r * 1.2, r, r, -r * 0.9);
  ctx.quadraticCurveTo(0, -r * 1.25, -r, -r * 0.9);
  ctx.closePath();
}

function bagRadius(candy: number): number {
  return 19 * (1 + Math.min(candy, 25) * 0.027);
}

const SWEET_COLOURS = ['#FF5FA2', '#FFD84D', '#7CFF9A', '#FF7518', '#C77DFF', '#7EC8F0'];

/** Back of the sack + its neck strap, painted behind the sheet. */
function drawBagBack(
  ctx: CanvasRenderingContext2D,
  p: ArtPalette,
  line: number,
  candy: number,
  swing: number,
): void {
  const r = bagRadius(candy);
  ctx.save();
  // neck strap looping over the shoulder
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = line * 1.05;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-30, -30);
  ctx.quadraticCurveTo(6, -56, BAG_X - 2 + swing * 2, BAG_Y - r * 0.85);
  ctx.stroke();
  ctx.strokeStyle = alpha('#FFD9A0', 0.35);
  ctx.lineWidth = line * 0.3;
  ctx.beginPath();
  ctx.moveTo(-30, -30);
  ctx.quadraticCurveTo(6, -56, BAG_X - 2 + swing * 2, BAG_Y - r * 0.85);
  ctx.stroke();

  ctx.translate(BAG_X, BAG_Y);
  ctx.rotate(swing * 0.14);
  // dark interior so the sweets read as being *inside* the mesh
  ctx.fillStyle = alpha('#3B1E63', 0.9);
  bagPouchPath(ctx, r);
  ctx.fill();
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = line * 0.75;
  ctx.stroke();
  ctx.restore();
}

/** Front mesh layer: clipped sweets, weave lines, glossy film and drawstring. */
function drawBag(
  ctx: CanvasRenderingContext2D,
  candy: number,
  p: ArtPalette,
  line: number,
  swing: number,
): void {
  const r = bagRadius(candy);
  ctx.save();
  ctx.translate(BAG_X, BAG_Y);
  ctx.rotate(swing * 0.14);

  const shown = Math.min(18, candy);
  ctx.save();
  bagPouchPath(ctx, r);
  ctx.clip();
  for (let i = 0; i < shown; i += 1) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const cx = -r * 0.7 + col * (r * 0.47) + (row % 2) * 2;
    const cy = r * 0.72 - row * (r * 0.34);
    ctx.fillStyle = SWEET_COLOURS[i % SWEET_COLOURS.length];
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.23, r * 0.15, (i % 3 - 1) * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = alpha(p.outline, 0.5);
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }
  if (candy > 18) {
    // fullness hint without drawing hundreds of sweets
    ctx.fillStyle = alpha('#FFD84D', 0.16);
    ctx.fillRect(-r, -r, r * 2, r * 2);
  }
  // woven mesh
  ctx.strokeStyle = alpha(p.outline, 0.45);
  ctx.lineWidth = 1.2;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.48, -r * 0.8);
    ctx.quadraticCurveTo(i * r * 0.62, 0, i * r * 0.32, r * 0.98);
    ctx.stroke();
  }
  for (let j = -1; j <= 1; j += 1) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, j * r * 0.42);
    ctx.quadraticCurveTo(0, j * r * 0.5 + r * 0.16, r * 0.9, j * r * 0.42);
    ctx.stroke();
  }
  ctx.restore();

  // clean ink outline + plastic film highlight
  bagPouchPath(ctx, r);
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = line * 0.85;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.34, -r * 0.2, r * 0.26, r * 0.44, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // drawstring + knot
  ctx.strokeStyle = p.outline;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-r * 0.8, -r * 0.88);
  ctx.quadraticCurveTo(0, -r * 1.16, r * 0.8, -r * 0.88);
  ctx.stroke();
  ctx.fillStyle = p.cream;
  ctx.beginPath();
  ctx.arc(-r * 0.8, -r * 0.88, 2.1, 0, Math.PI * 2);
  ctx.arc(r * 0.8, -r * 0.88, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A diagonal neck strap visibly carries the swinging mesh sack. */
function drawBagStrap(ctx: CanvasRenderingContext2D, p: ArtPalette, line: number, swing: number, candy: number): void {
  ctx.save(); ctx.strokeStyle = p.outline; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-58, -14);
  ctx.bezierCurveTo(-39, 1, -3, 30, BAG_X + swing * 2, BAG_Y - bagRadius(candy)); ctx.stroke();
  ctx.strokeStyle = '#C59A6B'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#F8DFA0'; ctx.strokeStyle = p.outline; ctx.lineWidth = Math.max(1.5, line * .35);
  ctx.beginPath(); ctx.roundRect(-8, 17, 10, 13, 2); ctx.fill(); ctx.stroke(); ctx.restore();
}

/** Striped-sock leg + oversized sneaker, stepping from the walk phase. */
function drawLeg(
  ctx: CanvasRenderingContext2D,
  pose: CharacterPose,
  side: Side,
  p: ArtPalette,
  line: number,
): void {
  const dir = side === 'left' ? -1 : 1;
  const step = side === 'left' ? pose.stepLeft : pose.stepRight;
  const hipX = dir * 19;
  const hipY = 54;
  const footX = hipX + step * 11;
  const footY = 103 - Math.max(0, step) * 9;

  // striped sock
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.quadraticCurveTo(hipX + step * 6, (hipY + footY) / 2, footX, footY - 5);
  ctx.strokeStyle = '#F4EDFF';
  ctx.lineWidth = 13.5;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.strokeStyle = alpha('#8A63C8', 0.85);
  ctx.lineWidth = 13.5;
  ctx.setLineDash([3.4, 5.6]);
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.quadraticCurveTo(hipX + step * 6, (hipY + footY) / 2, footX, footY - 5);
  ctx.stroke();
  ctx.setLineDash([]);

  // oversized sneaker
  ctx.save();
  ctx.translate(footX, footY);
  ctx.rotate(step * 0.07);
  ctx.fillStyle = '#3B1E63';
  ctx.beginPath();
  ctx.ellipse(dir * 5, -1, 21, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  stroke(ctx, p, line * 0.85);
  ctx.fillStyle = p.cream;
  ctx.beginPath();
  ctx.ellipse(dir * 5, 5, 19, 5.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = alpha(p.outline, 0.45);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(dir * -2, -7);
  ctx.lineTo(dir * 11, -6);
  ctx.moveTo(dir * -2, -3);
  ctx.lineTo(dir * 12, -2);
  ctx.stroke();
  ctx.restore();
}

/** Paints the trick-or-treating kid in the bedsheet ghost costume. */
export function drawGhost(
  ctx: CanvasRenderingContext2D,
  pose: CharacterPose,
  opts: GhostDrawOptions,
): void {
  const { x, y, scale, palette: p } = opts;
  const line = opts.outline;
  const candy = opts.candy;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // contact shadow
  ctx.fillStyle = alpha(p.outline, 0.32 * Math.max(0.2, opts.shading));
  ctx.beginPath();
  ctx.ellipse(0, 118, 80 - pose.bobY, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs + sneakers stride beneath the floppy hem
  ctx.save();
  ctx.translate(pose.lean * 1.4, pose.bobY - pose.hemBounce * 1.4);
  ctx.scale(pose.scaleX, pose.scaleY);
  drawLeg(ctx, pose, 'left', p, line);
  drawLeg(ctx, pose, 'right', p, line);
  ctx.restore();

  // sack back layer + neck strap sit behind the sheet
  ctx.save();
  ctx.translate(pose.lean * 1.4, pose.bobY);
  ctx.scale(pose.scaleX, pose.scaleY);
  drawBagBack(ctx, p, line, candy, pose.bagSwing);
  ctx.restore();

  const costumePalette = opts.costume === 'vampire'
    ? { ...p, primary: '#343049', shadow: '#24213B' }
    : opts.costume === 'frankenstein' ? { ...p, primary: '#747279', shadow: '#52515F' } : p;
  drawArm(ctx, 'left', pose, { ...opts, palette: costumePalette });
  drawArm(ctx, 'right', pose, { ...opts, palette: costumePalette });
  if (opts.costume && opts.costume !== 'ghost') {
    drawCostume(ctx, pose, opts.costume, p, line);
    ctx.save(); ctx.translate(pose.lean * 1.4, pose.bobY - pose.hemBounce * 1.2);
    ctx.rotate(pose.rotation * Math.PI / 180);
    ctx.scale(pose.scaleX, pose.scaleY);
    // Pigment stays on the head or clothing, even at the outer edge of a
    // procedurally placed splat. Paper may still hang outside the silhouette.
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -59, 45, 48, 0, 0, Math.PI * 2);
    ctx.moveTo(-37, -58);
    ctx.lineTo(38, -58); ctx.lineTo(53, 73);
    ctx.quadraticCurveTo(0, 90, -53, 73); ctx.closePath();
    ctx.clip();
    drawStains(ctx, opts.stains.filter((s) => s.kind !== 'tp'), p, line, pose.walk);
    ctx.restore();
    drawStains(ctx, opts.stains.filter((s) => s.kind === 'tp'), p, line, pose.walk);
    drawBagStrap(ctx, p, line, pose.bagSwing, candy);
    drawBag(ctx, candy, p, line, pose.bagSwing);
    ctx.restore(); ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(pose.lean * 1.4, pose.bobY - pose.hemBounce * 1.2);
  ctx.rotate((pose.rotation * Math.PI) / 180);
  ctx.scale(pose.scaleX, pose.scaleY);

  // sheet body
  sheetPath(ctx, pose.walk);
  ctx.fillStyle = sheetFill(ctx, p);
  ctx.fill();
  stroke(ctx, p, line + 0.6);

  // shading + highlights clipped to the sheet
  ctx.save();
  sheetPath(ctx, pose.walk);
  ctx.clip();
  if (opts.shading > 0.02) {
    ctx.globalAlpha = 0.5 * Math.min(1.3, opts.shading);
    ctx.fillStyle = p.shadow;
    ctx.beginPath();
    ctx.ellipse(46, 30, 58, 82, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(-32, -62, 22, 15, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.ellipse(-48, 6, 9, 26, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // sheet creases
  ctx.strokeStyle = alpha(p.outline, 0.14);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-30, 52);
  ctx.quadraticCurveTo(-14, 64, -6, 78);
  ctx.moveTo(34, 44);
  ctx.quadraticCurveTo(22, 62, 26, 78);
  ctx.stroke();

  // floppy hem seam with visible stitches
  ctx.strokeStyle = alpha(p.outline, 0.4);
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(-58, 68);
  ctx.quadraticCurveTo(-42, 82, -22, 72);
  ctx.quadraticCurveTo(-2, 88, 14, 72);
  ctx.quadraticCurveTo(32, 86, 50, 70);
  ctx.stroke();
  ctx.setLineDash([]);

  // stitched-on patch, because the sheet was cut up in a hurry
  ctx.save();
  ctx.translate(-27, 29);
  ctx.rotate(-0.13);
  ctx.fillStyle = alpha(p.shadow, 0.9);
  ctx.beginPath();
  ctx.roundRect(-14, -10, 28, 20, 3);
  ctx.fill();
  ctx.strokeStyle = alpha(p.outline, 0.5);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([2.6, 3.4]);
  ctx.beginPath();
  ctx.roundRect(-18, -14, 36, 28, 4);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // crooked marker "BOO" scrawled on the skirt of the sheet
  ctx.save();
  ctx.translate(0, 54);
  ctx.rotate(0.06);
  ctx.strokeStyle = alpha(p.outline, 0.6);
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-26, -9);
  ctx.lineTo(-26, 9);
  ctx.moveTo(-26, -9);
  ctx.quadraticCurveTo(-16, -9, -18, 0);
  ctx.quadraticCurveTo(-26, 0, -26, 0);
  ctx.quadraticCurveTo(-15, 1, -17, 9);
  ctx.lineTo(-26, 9);
  ctx.moveTo(0, 9);
  ctx.bezierCurveTo(-10, 9, -10, -9, 0, -9);
  ctx.bezierCurveTo(11, -9, 11, 9, 0, 9);
  ctx.moveTo(25, 9);
  ctx.bezierCurveTo(14, 9, 14, -9, 25, -9);
  ctx.bezierCurveTo(36, -9, 36, 9, 25, 9);
  ctx.stroke();
  ctx.restore();

  // warm moon rim light on the top-left, cool shade on the bottom-right
  ctx.save();
  ctx.beginPath();
  sheetPath(ctx, pose.walk);
  ctx.clip();
  ctx.save();
  ctx.translate(-5, -6);
  ctx.strokeStyle = 'rgba(255,243,196,0.42)';
  ctx.lineWidth = 8;
  ctx.lineJoin = 'round';
  sheetPath(ctx, pose.walk);
  ctx.stroke();
  ctx.restore();
  ctx.translate(6, 10);
  ctx.strokeStyle = alpha(p.shadow, 0.35);
  ctx.lineWidth = 10;
  sheetPath(ctx, pose.walk);
  ctx.stroke();
  ctx.restore();

  // persistent mess from unblocked junk / pumpkins
  ctx.save();
  sheetPath(ctx, pose.walk); ctx.clip();
  drawStains(ctx, opts.stains.filter((s) => s.y >= -25 && s.kind !== 'tp'), p, line, pose.walk);
  ctx.restore();
  drawStains(ctx, opts.stains.filter((s) => s.y >= -25 && s.kind === 'tp'), p, line, pose.walk);
  ctx.restore();

  // Stray hair and skin reveal a real little kid beneath cut-out eye holes.
  ctx.fillStyle = '#3E2B34';
  ctx.beginPath(); ctx.moveTo(-35, -65); ctx.quadraticCurveTo(-27, -75, -14, -64);
  ctx.quadraticCurveTo(-20, -59, -35, -65);
  ctx.moveTo(16, -65); ctx.quadraticCurveTo(27, -73, 34, -65);
  ctx.quadraticCurveTo(26, -59, 16, -65); ctx.fill();
  // top knot
  ctx.fillStyle = p.primary;
  ctx.beginPath();
  ctx.moveTo(-10, -108);
  ctx.quadraticCurveTo(-4, -128, 8, -122);
  ctx.quadraticCurveTo(2, -114, 8, -106);
  ctx.closePath();
  ctx.fill();
  stroke(ctx, p, line * 0.85);

  // eye holes
  const holes: Array<[number, number, number, number]> = [
    [-25, -52, 15, 19],
    [25, -52, 14, 18],
  ];
  const open = Math.max(0.12, 1 - pose.blink);
  holes.forEach(([hx, hy, hrx, hry], i) => {
    ctx.fillStyle = '#261A32';
    ctx.beginPath();
    ctx.ellipse(hx, hy, hrx, hry * open, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F1B896';
    ctx.beginPath();
    ctx.ellipse(hx, hy + 4, hrx * .76, hry * open * .72, 0, 0, Math.PI * 2);
    ctx.fill();
    if (open > 0.45) {
      const ex = hx + pose.pupilX * 0.6;
      const ey = hy + 1 + pose.pupilY * 0.6;
      ctx.fillStyle = '#FFFDF0';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 5.2 * pose.eyeScale, 6 * pose.eyeScale * open, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#160427';
      ctx.beginPath();
      ctx.ellipse(ex + 1, ey + 0.5, 2.5 * pose.eyeScale, 3 * pose.eyeScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ex - 1.6, ey - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // hole rim
    ctx.strokeStyle = alpha(p.outline, 0.5);
    ctx.lineWidth = line * 0.45;
    ctx.beginPath();
    ctx.ellipse(hx, hy, hrx, hry * open, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (i === 1) {
      // subtle asymmetry highlight
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.ellipse(hx - 4, hy - 8, 5, 3, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // brows on the sheet
  const browOffset = (v: number) => -v * 4;
  ctx.strokeStyle = alpha(p.outline, 0.55);
  ctx.lineWidth = line * 0.7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-38, -76 + browOffset(pose.browLeft));
  ctx.quadraticCurveTo(-25, -82 - pose.browLeft * 3, -12, -76 - browOffset(pose.browLeft));
  ctx.moveTo(12, -76 - browOffset(pose.browRight));
  ctx.quadraticCurveTo(25, -82 - pose.browRight * 3, 38, -76 + browOffset(pose.browRight));
  ctx.stroke();

  // cheeks
  if (pose.cheek > 0.05) {
    ctx.fillStyle = alpha(p.coral, 0.3 * Math.min(1, pose.cheek));
    ctx.beginPath();
    ctx.ellipse(-40, -18, 11, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(40, -20, 10, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawMouth(ctx, pose, p, line);
  // Forehead and cheek mess is painted after facial features so it remains visible.
  ctx.save();
  ctx.translate(pose.lean * 1.4, pose.bobY - pose.hemBounce * 1.2);
  ctx.rotate((pose.rotation * Math.PI) / 180);
  ctx.scale(pose.scaleX, pose.scaleY);
  ctx.save();
  sheetPath(ctx, pose.walk); ctx.clip();
  drawStains(ctx, opts.stains.filter((s) => s.y < -25 && s.kind !== 'tp'), p, line, pose.walk);
  ctx.restore();
  drawStains(ctx, opts.stains.filter((s) => s.y < -25 && s.kind === 'tp'), p, line, pose.walk);
  ctx.restore();

  // sweat drop for guilty moments
  if (pose.sweat > 0.08) {
    ctx.globalAlpha = Math.min(1, pose.sweat);
    ctx.fillStyle = '#B7E9FF';
    ctx.strokeStyle = p.outline;
    ctx.lineWidth = line * 0.5;
    ctx.beginPath();
    ctx.moveTo(56, -56);
    ctx.bezierCurveTo(64, -46, 66, -36, 56, -36);
    ctx.bezierCurveTo(46, -36, 48, -46, 56, -56);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  if (pose.sparkle > 0.08) {
    for (let i = 0; i < 3; i += 1) {
      const a = (i / 3) * Math.PI * 2 + pose.breathe * 0.4;
      const px = Math.cos(a) * 92;
      const py = -48 + Math.sin(a) * 44;
      ctx.globalAlpha = Math.min(1, pose.sparkle);
      ctx.fillStyle = p.gold;
      ctx.beginPath();
      for (let s = 0; s < 8; s += 1) {
        const ang = (s / 8) * Math.PI * 2;
        const rr = s % 2 === 0 ? 7.5 : 3.2;
        const sx = px + Math.cos(ang) * rr;
        const sy = py + Math.sin(ang) * rr;
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  if (opts.meltdown > 0.02) {
    ctx.globalAlpha = Math.min(0.28, opts.meltdown * 0.28);
    ctx.fillStyle = '#FF2D55';
    sheetPath(ctx, pose.walk);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  ctx.save();
  ctx.translate(pose.lean * 1.4, pose.bobY);
  ctx.scale(pose.scaleX, pose.scaleY);
  drawBagStrap(ctx, p, line, pose.bagSwing, candy);
  ctx.restore();
  // bag front mesh sits in front of the sheet
  ctx.save();
  ctx.translate(pose.lean * 1.4, pose.bobY);
  ctx.scale(pose.scaleX, pose.scaleY);
  drawBag(ctx, candy, p, line, pose.bagSwing);
  ctx.restore();

  ctx.restore();
}
