import type { RunAward } from '@/game/Scoring';

/** Tiny hand-drawn SVG marks keep the one-per-run award legible on a phone. */
const AwardSticker = ({ award }: { award: RunAward }) => {
  const ink = '#2E0854';
  return (
    <div className="absolute left-1 top-2 z-10 flex w-[106px] -rotate-[9deg] flex-col items-center rounded-xl border-[3px] px-1.5 py-1 text-center shadow-[2px_5px_0_#170528]"
      style={{ background: award.color, borderColor: ink, color: ink }}>
      <svg width="34" height="30" viewBox="0 0 40 36" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {award.icon === 'cuffs' && <><circle cx="10" cy="18" r="7"/><circle cx="30" cy="18" r="7"/><path d="M16 16l8 4M7 11l-2-4m28 4 2-4"/></>}
        {award.icon === 'candy' && <><path d="M10 13 3 9l1 18 8-4m18-10 7-4-1 18-8-4"/><rect x="10" y="10" width="20" height="17" rx="8" transform="rotate(-15 20 18)"/><path d="m16 12 8 13"/></>}
        {award.icon === 'star' && <><path d="m20 2 5 11 12 2-9 8 2 11-10-6-10 6 2-11-9-8 12-2z" fill="#FFFDD0"/><path d="m17 17 6 3"/></>}
        {award.icon === 'pumpkin' && <><path d="M20 9V4l5-2M10 13C2 14 2 31 13 32c4 3 10 3 14 0 11-1 11-18 3-19-4-4-8-3-10-1-2-2-6-3-10 1Z" fill="#FFB347"/><path d="m14 19 2 2m10-2-2 2m-8 5 4 2 4-2"/></>}
        {award.icon === 'stain' && <><path d="M20 3c2 5 4 5 8 7 6 4 6 9 5 13-1 8-7 11-14 10C9 33 4 28 6 20c1-5 6-7 8-9 3-3 2-5 6-8Z" fill="#8E69AE"/><circle cx="12" cy="6" r="2" fill={ink}/><circle cx="35" cy="6" r="1.5" fill={ink}/></>}
        {award.icon === 'ghost' && <><path d="M7 32V16C7 5 14 3 20 3s13 2 13 13v16l-5-4-5 4-4-4-5 4-4-4z" fill="#FFFDD0"/><circle cx="15" cy="17" r="2" fill={ink}/><circle cx="25" cy="17" r="2" fill={ink}/><path d="M17 24q3 3 6 0"/></>}
      </svg>
      <span className="text-[9px] font-black uppercase leading-[10px] tracking-[0.04em]">{award.title}</span>
    </div>
  );
};

export default AwardSticker;
