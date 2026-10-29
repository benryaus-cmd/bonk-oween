import { AWARDS } from '@/game/Scoring';

const KEY = 'bonk:earnedAwards:v1';

export function loadEarnedAwards(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((title): title is string =>
      typeof title === 'string' && AWARDS.some((award) => award.title === title)) : [];
  } catch { return []; }
}

export function rememberAward(title: string): string[] {
  const earned = new Set(loadEarnedAwards());
  if (AWARDS.some((award) => award.title === title)) earned.add(title);
  const updated = [...earned];
  try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { /* private storage */ }
  return updated;
}
