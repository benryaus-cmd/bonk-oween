import { drawGhost } from '@/art/CharacterDraw';
import { drawObject, objectVisualRadius } from '@/art/ObjectsDraw';
import { buildPalette, type ArtPalette } from '@/art/palette';
import { StreetDraw } from '@/art/StreetDraw';
import { ToiletPaperRibbon } from '@/art/ToiletPaperRibbon';
import { DEFAULT_CONFIG, type GameConfig } from '@/config/defaults';
import { hitWindows, targetVisual } from '@/game/targetMath';
import type { CharacterPose } from '@/art/CharacterPose';
import type { Effects } from '@/art/Effects';
import type { FlyingItem } from '@/game/PhysicsWorld';
import type { ObjectArt, Stain, Target } from '@/game/types';
import type { Side } from '@/game/types';

export interface Scene {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  charScale: number;
  stretch: number;
  clockMs: number;
  targets: readonly Target[];
  flying: readonly FlyingItem[];
  pose: CharacterPose;
  effects: Effects;
  cfg: GameConfig;
  meltdown: number;
  candy: number;
  stains: readonly Stain[];
  costume?: 'ghost' | 'frankenstein' | 'vampire';
  spilledCandy?: readonly { x: number; y: number; angle: number; scale: number; art: ObjectArt; ageMs: number }[];
  demoSide?: Side | null;
}

/** Renders live targets and character over a cached perspective street. */
export class Renderer {
  private readonly street = new StreetDraw();
  private readonly paper = new ToiletPaperRibbon();
  private palette: ArtPalette = buildPalette(DEFAULT_CONFIG);
  private paletteKey = '';

  reset(): void { this.paletteKey = ''; this.paper.clear(); }

  render(ctx: CanvasRenderingContext2D, scene: Scene, _bg: HTMLImageElement | null): void {
    const { width, height, cfg, centerX, centerY, charScale, effects } = scene;
    const paletteKey = `${cfg.characterPrimary}|${cfg.characterShadow}|${cfg.characterOutline}|${cfg.accentColour}|${cfg.backgroundColour}|${cfg.backgroundSecondary}`;
    if (this.paletteKey !== paletteKey) {
      this.palette = buildPalette(cfg);
      this.paletteKey = paletteKey;
    }
    const p = this.palette;
    const windows = hitWindows(cfg.normalWindowMs, cfg.perfectWindowMs);
    this.street.draw(ctx, width, height, scene.clockMs, cfg);

    if (scene.meltdown > 0.01) {
      const speed = cfg.backgroundAnimationSpeed + 0.6;
      const pulse = 0.08 + 0.08 * Math.sin((scene.clockMs / 90) * speed);
      ctx.globalAlpha = Math.min(0.45, scene.meltdown * pulse * cfg.meltdownIntensity);
      ctx.fillStyle = '#FF7518';
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    const shake = effects.shakeOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);

    for (const sweet of scene.spilledCandy ?? []) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - sweet.ageMs / 1700);
      ctx.translate(sweet.x, sweet.y); ctx.rotate(sweet.angle);
      drawObject(ctx, sweet.art, 18 * sweet.scale, {
        clock: scene.clockMs, palette: p, line: cfg.outlineWidth * 0.5, glow: 0,
      });
      ctx.restore();
    }

    for (const t2 of scene.targets) {
      if (t2.resolved && t2.outcome !== 'miss') continue;
      const v = targetVisual(t2, scene.clockMs, windows.normal);
      if (v.alpha <= 0.02) continue;
      if (t2.art === 'tpRoll') {
        ctx.globalAlpha = v.alpha;
        this.paper.draw(ctx, `incoming-${t2.id}`, v.x, v.y + 11, t2.side === 'left' ? 1 : -1, t2.size * v.scale, scene.clockMs);
      }
      ctx.save();
      ctx.globalAlpha = v.alpha;
      ctx.translate(v.x, v.y);
      ctx.rotate(v.rot);
      drawObject(ctx, t2.art, t2.size * v.scale, {
        clock: scene.clockMs,
        palette: p,
        line: cfg.outlineWidth * 0.6,
        glow: t2.category === 'pumpkin' ? 1 : 0,
      });

      const radius = objectVisualRadius(t2.art) * (t2.size / 60) * v.scale;
      if (t2.category === 'baby') {
        // Unmistakable DO-NOT-BONK treatment, clearly not the gold reward.
        ctx.globalAlpha = v.alpha * (0.5 + 0.3 * Math.sin(scene.clockMs / 150));
        ctx.strokeStyle = p.cursed;
        ctx.lineWidth = 3.5;
        ctx.setLineDash([7, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = v.alpha;
        ctx.fillStyle = p.cursed;
        ctx.beginPath();
        ctx.roundRect(-5, -radius * 2.15, 10, 14, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -radius * 2.15 + 19, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (!t2.resolved) {
        // Approach cue: the ring tightens and turns gold at the slap moment.
        const delta = t2.impactTime - scene.clockMs;
        const span = windows.normal;
        if (Math.abs(delta) <= span) {
          const closeness = 1 - Math.min(1, Math.abs(delta) / span);
          const urgency = Math.max(0, Math.min(1, v.urgency));
          const throb = urgency * (0.5 + 0.5 * Math.sin(scene.clockMs / 72));
          ctx.globalAlpha = v.alpha * (0.2 + 0.55 * closeness + 0.23 * throb);
          ctx.strokeStyle = Math.abs(delta) <= windows.perfect ? p.gold : t2.category === 'junk' ? '#FFD9A0' : p.accent;
          ctx.lineWidth = 2 + closeness * 2 + throb * 1.4;
          ctx.beginPath();
          ctx.arc(0, 0, radius * (1.2 + (1 - closeness) * 0.65 + throb * 0.08), 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    drawGhost(ctx, scene.pose, {
      x: centerX,
      y: centerY,
      scale: charScale,
      stretch: scene.stretch,
      palette: p,
      outline: cfg.outlineWidth,
      shading: cfg.shadowIntensity,
      meltdown: scene.meltdown * 0.5,
      clock: scene.clockMs,
      candy: scene.candy,
      stains: scene.stains,
      costume: scene.costume,
    });

    for (const item of scene.flying) {
      const life = item.lifeMs / Math.max(1, item.maxLifeMs);
      const fade = life > 0.7 ? Math.max(0, 1 - (life - 0.7) / 0.3) : 1;
      if (item.art === 'tpRoll') {
        ctx.globalAlpha = fade;
        this.paper.draw(ctx, `flying-${item.id}`, item.body.position.x, item.body.position.y + 10,
          item.body.velocity.x >= 0 ? 1 : -1, item.size, scene.clockMs);
      }
      if (cfg.trailOpacity > 0.02 && item.trail.length > 1) {
        const tail = item.trail[item.trail.length - 1];
        const head = item.body.position;
        ctx.globalAlpha = fade * 0.35 * cfg.trailOpacity;
        ctx.strokeStyle = p.accent;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.quadraticCurveTo((tail.x + head.x) / 2, (tail.y + head.y) / 2, head.x, head.y);
        ctx.lineWidth = item.size * 0.4;
        ctx.stroke();
      }
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(item.body.position.x, item.body.position.y);
      ctx.rotate(item.body.angle);
      drawObject(ctx, item.art, item.size, {
        clock: scene.clockMs,
        palette: p,
        line: cfg.outlineWidth * 0.6,
        glow: 0,
      });
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    effects.drawArcs(ctx);
    effects.drawRings(ctx);
    effects.drawParticles(ctx);
    effects.drawFloaters(ctx);
    ctx.restore();

    effects.drawFlash(ctx, width, height);
    if (scene.demoSide) {
      const left = scene.demoSide === 'left';
      ctx.save();
      ctx.textAlign = 'center'; ctx.font = '900 13px system-ui';
      ctx.lineWidth = 4; ctx.strokeStyle = '#211033'; ctx.fillStyle = '#FFE5AB';
      const x = centerX + (left ? -118 : 118) * charScale;
      const y = centerY - 76 * charScale;
      const label = left ? '◀ TAP LEFT' : 'TAP RIGHT ▶';
      ctx.strokeText(label, x, y); ctx.fillText(label, x, y);
      ctx.restore();
    }
  }

}
