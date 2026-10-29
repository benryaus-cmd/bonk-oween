import { useEffect, useRef } from 'react';
import { drawGhost } from '@/art/CharacterDraw';
import { neutralPose } from '@/art/CharacterPose';
import { buildPalette } from '@/art/palette';
import type { GameConfig } from '@/config/defaults';
import type { Stain } from '@/game/types';

interface GhostPortraitProps {
  cfg: GameConfig;
  candy: number;
  stains: readonly Stain[];
  costume: 'ghost' | 'frankenstein' | 'vampire';
  width: number;
  height: number;
}

/** A screenshot-ready portrait of the ghost exactly as it finished the run. */
const GhostPortrait = ({ cfg, candy, stains, costume, width, height }: GhostPortraitProps) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const base = neutralPose();
    const pose = {
      ...base,
      mouth: (stains.length > 0 ? 'smirk' : 'grin') as typeof base.mouth,
      mouthOpen: 0.35,
      cheek: 0.9,
      browLeft: 0.3,
      browRight: 0.3,
    };
    drawGhost(ctx, pose, {
      x: width / 2,
      y: height * 0.56,
      scale: Math.min(width / 230, height / 285),
      stretch: 1,
      palette: buildPalette(cfg),
      outline: 4.5,
      shading: 1,
      meltdown: 0,
      clock: 0,
      candy,
      stains,
      costume,
    });
  }, [cfg, candy, stains, costume, width, height]);

  return <canvas ref={ref} style={{ width, height: 'auto', maxWidth: '100%', aspectRatio: `${width} / ${height}` }} aria-hidden />;
};

export default GhostPortrait;
