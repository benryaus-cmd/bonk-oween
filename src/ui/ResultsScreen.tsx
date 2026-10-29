import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { RotateCcw } from 'lucide-react';
import GhostPortrait from '@/ui/GhostPortrait';
import AwardSticker from '@/ui/AwardSticker';
import '@/ui/ui.css';
import type { GameConfig } from '@/config/defaults';
import type { Stain } from '@/game/types';
import type { FinalTally } from '@/game/Scoring';

export interface ResultTier {
  title: string;
  blurb: string;
  color: string;
}

export function tierFor(score: number): ResultTier {
  if (score >= 1800) return { title: 'GHOST OF THE BLOCK', blurb: 'The street tells legends about you.', color: '#FFD700' };
  if (score >= 1200) return { title: 'PUMPKIN MENACE', blurb: 'Candy economy: destabilised.', color: '#FF7518' };
  if (score >= 750) return { title: 'TRICK-OR-TREAT PRO', blurb: 'Respectable chaos.', color: '#F8F8FF' };
  if (score >= 400) return { title: 'SHEET ENTHUSIAST', blurb: 'Mostly hands, occasionally brain.', color: '#B9A8FF' };
  if (score >= 150) return { title: 'CANDY APPRENTICE', blurb: 'Babies slapped: hopefully zero.', color: '#FFFDD0' };
  return { title: 'CERTIFIED POTATO', blurb: 'The bag was mostly air. Iconic.', color: '#FF9EC4' };
}

interface ResultsScreenProps {
  score: number;
  tally: FinalTally;
  best: number;
  candy: number;
  maxCandy: number;
  hits: number;
  perfects: number;
  golden: number;
  misses: number;
  isNewBest: boolean;
  practice: boolean;
  stains: readonly Stain[];
  costume: 'ghost' | 'frankenstein' | 'vampire';
  cfg: GameConfig;
  textColor: string;
  speed: number;
  buttonScale: number;
  onReplay: () => void;
  onTallyStep: (amount: number) => void;
  onTallyComplete: () => void;
}

const ResultsScreen = ({
  score,
  tally,
  best,
  candy,
  maxCandy,
  hits,
  perfects,
  golden,
  misses,
  isNewBest,
  practice,
  stains,
  costume,
  cfg,
  textColor,
  speed,
  buttonScale,
  onReplay,
  onTallyStep,
  onTallyComplete,
}: ResultsScreenProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tier = tierFor(score);
  const pristine = stains.length === 0;
  const [displayedScore, setDisplayedScore] = useState(tally.streetScore);
  const [revealed, setRevealed] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return;
    const rows = card.querySelectorAll('.rn-row');
    const k = 1 / Math.max(0.3, speed);
    const tl = gsap.timeline();
    const counter = { value: tally.streetScore };
    setDisplayedScore(tally.streetScore);
    setRevealed(0);
    setFinished(false);
    tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.2 * k, ease: 'power1.out' })
      .fromTo(
        card,
        { y: 54, scale: 0.86, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.5 * k, ease: 'back.out(1.7)' },
        0.04,
      )
      .fromTo(
        rows,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 * k, stagger: 0.06 * k, ease: 'power2.out' },
        0.18 * k,
      );
    let at = 0.6 * k;
    let running = tally.streetScore;
    tally.lines.forEach((line, index) => {
      running = Math.max(0, running + line.amount);
      tl.call(() => { setRevealed(index + 1); if (line.amount !== 0) onTallyStep(line.amount); }, [], at);
      tl.to(counter, {
        value: running,
        duration: 0.36 * k,
        ease: line.amount < 0 ? 'back.out(1.4)' : 'power2.out',
        onUpdate: () => setDisplayedScore(Math.max(0, Math.round(counter.value))),
      }, at + 0.08 * k);
      at += 0.48 * k;
    });
    tl.call(() => { setDisplayedScore(score); setFinished(true); onTallyComplete(); }, [], at);
    return () => {
      tl.kill();
    };
  }, [speed, tally, score, onTallyStep, onTallyComplete]);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-30 flex items-center justify-center px-4"
      style={{ background: 'rgba(9,2,20,0.78)' }}
    >
      <div
        ref={cardRef}
        className="bonk-scroll relative w-full max-w-[330px] rounded-[26px] px-5 pb-5 pt-5 text-center"
        style={{
          background: 'linear-gradient(180deg,#3a1566,#1d0733)',
          border: '3px solid #2E0854',
          boxShadow: '0 18px 40px rgba(4,0,14,0.65), inset 0 1px 0 rgba(255,255,255,0.12)',
          maxHeight: '92%',
        }}
      >
        <AwardSticker award={tally.award} />
        <div className="rn-row text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#B7A6D6]">
          Time&apos;s up
        </div>

        <div className="rn-row mt-1 flex justify-center">
          <GhostPortrait cfg={cfg} candy={candy} stains={stains} costume={costume} width={216} height={178} />
        </div>
        <div className="rn-row text-[9px] font-black uppercase tracking-[0.18em] text-[#9C88BD]">
          {pristine ? 'Pristine sheet. Suspicious.' : `${stains.length} marks on the sheet`}
        </div>

        <div
          className="rn-row mt-1 text-[15px] font-black uppercase leading-tight"
          style={{ color: tier.color, letterSpacing: '0.06em' }}
        >
          {tier.title}
        </div>
        <div className="rn-row text-[10px] font-bold text-[#9C88BD]">{tier.blurb}</div>

        <div
          className="rn-row mt-2 font-black leading-none tabular-nums"
          style={{ fontSize: 'clamp(42px,14vw,54px)', color: textColor, textShadow: '0 4px 0 #2E0854' }}
        >
          {displayedScore}
        </div>
        <div className="rn-row text-[10px] font-bold uppercase tracking-[0.22em] text-[#8F7BB0]">
          {finished ? 'Final score' : 'Counting the damage…'}
        </div>

        <div className="rn-row mt-2 rounded-xl border border-[#8055A3] bg-black/30 px-2.5 py-1.5 text-left text-[10px] font-extrabold tabular-nums">
          <div className="flex justify-between text-[#FFFDD0]"><span>Street score</span><span>{tally.streetScore}</span></div>
          {tally.lines.map((line, index) => (
            <div key={line.label} className="flex justify-between gap-2 transition-all duration-200"
              style={{ opacity: index < revealed ? 1 : 0.16, transform: index < revealed ? 'translateY(0)' : 'translateY(5px)', color: line.amount < 0 ? '#FF9BAA' : '#FFE099' }}>
              <span>{line.label} ×{line.count}</span>
              <span className="shrink-0">{line.amount > 0 ? '+' : ''}{line.amount}</span>
            </div>
          ))}
        </div>
        <div className="rn-row mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#FFE099]">{tally.award.joke}</div>

        <div className="rn-row mt-3 grid grid-cols-3 gap-1.5">
          {[
            { label: 'Best', value: best, color: textColor },
            {
              label: 'Top bag',
              value: `x${(1 + Math.min(maxCandy, 20) * cfg.comboScoreScaling).toFixed(2)}`,
              color: '#FFD700',
            },
            { label: 'Candy', value: candy, color: '#FF9EC4' },
            { label: 'Perfect', value: perfects, color: '#B9A8FF' },
            { label: 'Pumpkins', value: golden, color: '#FF7518' },
            { label: 'Cleared', value: hits, color: '#F8F8FF' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-black/25 px-1 py-1.5">
              <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#9C88BD]">
                {stat.label}
              </div>
              <div className="text-[13px] font-black tabular-nums" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="rn-row mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#8F7BB0]">
          {misses > 0 ? `${misses} got through` : 'Nothing got through'}
        </div>

        {practice && (
          <div className="rn-row mt-2 rounded-xl border border-[#FF9A3C]/60 bg-black/30 px-2 py-1.5 text-[9px] font-black uppercase leading-tight tracking-[0.1em] text-[#FF9A3C]">
            Practice run · not submitted to the leaderboard
          </div>
        )}

        <button
          type="button"
          onClick={onReplay}
          className="bonk-play rn-row sticky bottom-0 z-20 mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-lg font-black uppercase tracking-wider"
          style={{
            color: '#170528',
            border: '3px solid #2E0854',
            transform: `scale(${buttonScale})`,
          }}
        >
          <RotateCcw size={20} strokeWidth={3} />
          Play again
        </button>
        {isNewBest && (
          <div className="rn-row mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#FFD700]">
            New ranked best
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsScreen;
