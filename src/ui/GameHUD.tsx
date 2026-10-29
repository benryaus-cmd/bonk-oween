import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Settings, Volume2, VolumeX } from 'lucide-react';
import '@/ui/ui.css';

interface GameHUDProps {
  score: number;
  best: number;
  timeLeft: number;
  candy: number;
  multiplier: number;
  meltdown: boolean;
  practice: boolean;
  muted: boolean;
  hidden: boolean;
  showMultiplier: boolean;
  textColor: string;
  accent: string;
  hudScale: number;
  scoreFontSize: number;
  timerFontSize: number;
  comboFontSize: number;
  buttonScale: number;
  motionIntensity: number;
  onToggleMute: () => void;
  onOpenSettings: () => void;
}

const GameHUD = ({
  score,
  best,
  timeLeft,
  candy,
  multiplier,
  meltdown,
  practice,
  muted,
  hidden,
  showMultiplier,
  textColor,
  accent,
  hudScale,
  scoreFontSize,
  timerFontSize,
  comboFontSize,
  buttonScale,
  motionIntensity,
  onToggleMute,
  onOpenSettings,
}: GameHUDProps) => {
  const scoreRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const bagRef = useRef<HTMLDivElement>(null);
  const multiplierRef = useRef<HTMLDivElement>(null);
  const lastCandy = useRef(0);
  const seconds = Math.max(0, Math.ceil(timeLeft));

  useEffect(() => {
    const node = scoreRef.current;
    if (!node || score === 0) return;
    const punch = 1 + 0.32 * motionIntensity;
    gsap.killTweensOf(node);
    gsap.fromTo(node, { scale: punch }, { scale: 1, duration: 0.36, ease: 'back.out(3)' });
  }, [score, motionIntensity]);

  useEffect(() => {
    const node = timerRef.current;
    if (!node) return;
    if (seconds <= 5 && seconds > 0) {
      gsap.killTweensOf(node);
      gsap.fromTo(
        node,
        { scale: 1 + 0.18 * motionIntensity },
        { scale: 1, duration: 0.34, ease: 'power2.out' },
      );
    }
  }, [seconds, motionIntensity]);

  useEffect(() => {
    const node = bagRef.current;
    if (!node || candy < 1) return;
    if (candy === lastCandy.current) return;
    const grew = candy > lastCandy.current;
    lastCandy.current = candy;
    gsap.killTweensOf(node);
    gsap.fromTo(
      node,
      { scale: 1 + 0.3 * motionIntensity, rotate: candy >= 10 ? -5 : 4 },
      { scale: 1, rotate: 0, duration: 0.34, ease: 'back.out(4)' },
    );
    const badge = multiplierRef.current;
    if (badge) {
      gsap.killTweensOf(badge);
      gsap.fromTo(badge, { scale: grew ? 1.26 : 0.86, rotate: grew ? 4 : -4 },
        { scale: 1, rotate: 0, duration: 0.42, ease: 'back.out(3)' });
    }
  }, [candy, motionIntensity]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      style={{ opacity: hidden ? 0 : 1, transition: 'opacity 240ms ease' }}
    >
      <div
        className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 px-3"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
          transform: `scale(${hudScale})`,
          transformOrigin: 'top center',
        }}
      >
        <div className="bonk-hud-panel rounded-2xl px-3 py-1.5">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#B7A6D6]">
            Score
          </div>
          <div className="flex items-baseline gap-1.5">
            <div
              ref={scoreRef}
              className="origin-left font-black leading-none tabular-nums"
              style={{ fontSize: scoreFontSize, color: textColor, textShadow: '0 2px 0 rgba(46,8,84,0.9)' }}
            >
              {score}
            </div>
            <div className="text-[10px] font-bold tabular-nums text-[#8F7BB0]">
              {best > 0 ? `PB ${best}` : ''}
            </div>
          </div>
          <div
            ref={bagRef}
            className="bonk-candy origin-left font-black uppercase leading-none tracking-[0.08em]"
            style={{ fontSize: Math.max(9, comboFontSize - 3), color: '#FFD700' }}
          >
            Candy {candy} <span className="text-[#FF9EC4]">x{multiplier.toFixed(2)}</span>
          </div>
        </div>

        <div
          ref={timerRef}
          className="bonk-hud-panel mt-1 flex flex-col items-center rounded-full px-4 py-1"
          style={{
            borderColor: meltdown ? 'rgba(255,117,24,0.9)' : undefined,
            boxShadow: meltdown ? '0 0 18px rgba(255,117,24,0.55)' : undefined,
          }}
        >
          <div
            className="font-black leading-none tabular-nums"
            style={{
              fontSize: timerFontSize,
              color: meltdown ? '#FF9A3C' : seconds <= 10 ? '#FFD700' : textColor,
            }}
          >
            {seconds}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#9C88BD]">
            {meltdown ? 'Meltdown' : 'Seconds'}
          </div>
        </div>

        <div
          className="flex items-center gap-2"
          style={{ transform: `scale(${buttonScale})`, transformOrigin: 'top right' }}
        >
          <button
            type="button"
            aria-label={muted ? 'Unmute' : 'Mute'}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onToggleMute}
            className="bonk-btn pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(180deg,#3b1566,#240a42)' }}
          >
            {muted ? (
              <VolumeX size={19} color={textColor} strokeWidth={2.6} />
            ) : (
              <Volume2 size={19} color={accent} strokeWidth={2.6} />
            )}
          </button>
          <button
            type="button"
            aria-label="Settings"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onOpenSettings}
            className="bonk-btn pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(180deg,#3b1566,#240a42)' }}
          >
            <Settings size={19} color={textColor} strokeWidth={2.6} />
          </button>
        </div>
      </div>

      {practice && !hidden && (
        <div className="absolute inset-x-0 top-[62px] flex justify-center">
          <div className="rounded-full border border-[#FF9A3C]/60 bg-black/55 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-[#FF9A3C]">
            Practice · not submitted
          </div>
        </div>
      )}

      {showMultiplier && !hidden && (
        <div className="absolute inset-x-0 bottom-[14%] flex justify-center">
          <div ref={multiplierRef} className="rounded-2xl border-2 border-[#FFD700]/70 bg-[#240A42]/85 px-4 py-1.5 text-center shadow-[0_4px_0_#170528,0_0_18px_#FFD70044]">
            <div className="text-[8px] font-black uppercase leading-none tracking-[0.2em] text-[#FF9EC4]">{candy} candy in bag</div>
            <div className="text-[19px] font-black leading-none tabular-nums text-[#FFD700]" style={{ textShadow: '0 2px 0 #2E0854' }}>
              ×{multiplier.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {meltdown && !hidden && (
        <div className="absolute inset-x-0 bottom-[9%] flex justify-center">
          <div className="rounded-full border border-[#FF7518]/70 bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB347]">
            Final meltdown
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHUD;
