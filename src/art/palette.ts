import { DEFAULT_CONFIG, type GameConfig } from '@/config/defaults';

/** Every colour the procedural art needs, derived from the live config. */
export interface ArtPalette {
  primary: string;
  primaryLight: string;
  shadow: string;
  outline: string;
  cream: string;
  coral: string;
  gold: string;
  cursed: string;
  accent: string;
  uiText: string;
  bg: string;
  bg2: string;
  eye: string;
  white: string;
}

export function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

export function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) =>
    clampByte(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

/** Multiply a hex colour's brightness (0 = black, 1 = unchanged). */
export function shade(hex: string, k: number): string {
  const p = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => clampByte(((p >> shift) & 255) * k);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

export function alpha(hex: string, a: number): string {
  const p = parseInt(hex.slice(1), 16);
  return `rgba(${(p >> 16) & 255},${(p >> 8) & 255},${p & 255},${a})`;
}

export function buildPalette(cfg: GameConfig): ArtPalette {
  return {
    primary: cfg.characterPrimary,
    primaryLight: mixHex(cfg.characterPrimary, '#FFFFFF', 0.42),
    shadow: cfg.characterShadow,
    outline: cfg.characterOutline,
    cream: '#FFFDD0',
    coral: '#FF7F50',
    gold: cfg.goldenAccent,
    cursed: cfg.cursedAccent,
    accent: cfg.accentColour,
    uiText: cfg.uiText,
    bg: cfg.backgroundColour,
    bg2: cfg.backgroundSecondary,
    eye: '#1B0433',
    white: '#FFFFFF',
  };
}

export const DEFAULT_PALETTE: ArtPalette = buildPalette(DEFAULT_CONFIG);