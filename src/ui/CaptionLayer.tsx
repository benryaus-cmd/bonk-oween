import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import '@/ui/ui.css';
import type { CaptionTone } from '@/game/types';

export interface CaptionEntry {
  id: number;
  text: string;
  tone: CaptionTone;
}

interface CaptionLayerProps {
  caption: CaptionEntry | null;
  duration: number;
  intensity: number;
  accent: string;
  reducedMotion: boolean;
}

const TONE_COLOR: Record<CaptionTone, string> = {
  hype: '#FFFDD0',
  candy: '#FF9EC4',
  meltdown: '#FF9A3C',
  perfect: '#FFD700',
  golden: '#FFD700',
  mistake: '#FF8FA3',
};

/** One kinetic caption at a time — replaces itself, never stacks. */
const CaptionLayer = ({ caption, duration, intensity, accent, reducedMotion }: CaptionLayerProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || !caption) return;
    if (reducedMotion) {
      gsap.set(node, { scale: 1, opacity: 1, rotate: 0, y: 0 });
      return;
    }
    const tl = gsap.timeline();
    tl.fromTo(
      node,
      { scale: 0.6 + 0.2 * intensity, opacity: 0, rotate: -5 - intensity * 4, y: 0 },
      { scale: 1, opacity: 1, rotate: -2, duration: 0.24, ease: 'back.out(3)' },
    ).to(node, { opacity: 0, y: -14, duration: 0.32, ease: 'power2.in' }, Math.max(0.35, duration));
    return () => {
      tl.kill();
    };
  }, [caption, duration, intensity, reducedMotion]);

  if (!caption) return null;
  const color = caption.tone === 'hype' ? accent : TONE_COLOR[caption.tone];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[26%] z-20 flex justify-center px-6">
      <div
        ref={nodeRef}
        className="bonk-caption max-w-full text-center text-[clamp(22px,8vw,40px)] font-black uppercase leading-none"
        style={{
          color,
          letterSpacing: '0.02em',
          textShadow: `0 3px 0 #2E0854, 0 0 22px ${color}55`,
        }}
      >
        {caption.text}
      </div>
    </div>
  );
};

export default CaptionLayer;
