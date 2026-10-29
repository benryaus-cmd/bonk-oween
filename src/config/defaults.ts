/** Typed tuning values for BONK!. Every value here drives real behaviour. */
export interface GameConfig {
  // ── Gameplay ─────────────────────────────────────────────
  roundDuration: number;
  meltdownStartTime: number;
  initialSpawnInterval: number;
  minimumSpawnInterval: number;
  spawnAcceleration: number;
  travelDuration: number;
  minimumTravelDuration: number;
  perfectWindowMs: number;
  normalWindowMs: number;
  slapRecoveryMs: number;
  sameLaneCooldownMs: number;
  minimumReactionWindowMs: number;
  goldenChance: number;
  cursedChance: number;
  goldenIntroductionTime: number;
  cursedIntroductionTime: number;
  maxIncomingTargets: number;
  scorePerHit: number;
  perfectMultiplier: number;
  goldenMultiplier: number;
  comboScoreScaling: number;
  invalidTapPenalty: number;

  // ── Character rig ────────────────────────────────────────
  characterScale: number;
  characterYOffset: number;
  idleBreathingSpeed: number;
  idleBreathingAmount: number;
  blinkFrequency: number;
  blinkDuration: number;
  eyeFollowStrength: number;
  slapDuration: number;
  anticipationDuration: number;
  armStretch: number;
  armCurve: number;
  impactHandScale: number;
  recoilAmount: number;
  bodyRotation: number;
  squashAmount: number;
  stretchAmount: number;
  expressionDuration: number;
  springStiffness: number;
  springDamping: number;

  // ── Physics (launched aftermath only) ────────────────────
  gravity: number;
  launchSpeed: number;
  launchLift: number;
  perfectLaunchMultiplier: number;
  goldenLaunchMultiplier: number;
  spinSpeed: number;
  spinRandomness: number;
  restitution: number;
  friction: number;
  frictionAir: number;
  maxBodies: number;
  bodyLifetime: number;
  floorBounceEnabled: boolean;
  wallBounceEnabled: boolean;

  // ── Particles / effects ─────────────────────────────────
  particleCount: number;
  perfectParticleCount: number;
  goldenParticleCount: number;
  particleLifetime: number;
  particleSpeed: number;
  particleGravity: number;
  particleDrag: number;
  particleSize: number;
  impactRingCount: number;
  impactRingRadius: number;
  ringExpansionSpeed: number;
  trailOpacity: number;
  shakeStrength: number;
  perfectShake: number;
  goldenShake: number;
  shakeDecay: number;
  hitStopMs: number;
  perfectHitStopMs: number;
  goldenHitStopMs: number;
  flashOpacity: number;
  flashDuration: number;
  backgroundPulseStrength: number;
  meltdownIntensity: number;
  effectsQuality: number;
  reducedMotion: boolean;

  // ── Interface ───────────────────────────────────────────
  hudScale: number;
  scoreFontSize: number;
  timerFontSize: number;
  comboFontSize: number;
  floatingTextScale: number;
  floatingTextDuration: number;
  captionFrequency: number;
  captionDuration: number;
  resultAnimationSpeed: number;
  buttonScale: number;
  uiAnimationIntensity: number;

  // ── Audio + haptics ─────────────────────────────────────
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  normalHitVolume: number;
  perfectHitVolume: number;
  goldenHitVolume: number;
  mistakeVolume: number;
  comboVolume: number;
  pitchVariation: number;
  maxAudioVoices: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  hapticIntensity: number;

  // ── Colour / art direction ──────────────────────────────
  backgroundColour: string;
  backgroundSecondary: string;
  characterPrimary: string;
  characterShadow: string;
  characterOutline: string;
  accentColour: string;
  goldenAccent: string;
  cursedAccent: string;
  uiText: string;
  outlineWidth: number;
  shadowIntensity: number;
  backgroundAnimationSpeed: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  roundDuration: 45,
  meltdownStartTime: 40,
  initialSpawnInterval: 0.95,
  minimumSpawnInterval: 0.42,
  spawnAcceleration: 1.4,
  travelDuration: 1.25,
  minimumTravelDuration: 0.85,
  perfectWindowMs: 55,
  normalWindowMs: 140,
  slapRecoveryMs: 130,
  sameLaneCooldownMs: 320,
  minimumReactionWindowMs: 240,
  goldenChance: 0.12,
  cursedChance: 0.14,
  goldenIntroductionTime: 5,
  cursedIntroductionTime: 15,
  maxIncomingTargets: 3,
  scorePerHit: 10,
  perfectMultiplier: 1.6,
  goldenMultiplier: 4,
  comboScoreScaling: 0.08,
  invalidTapPenalty: 1,

  characterScale: 0.7,
  characterYOffset: 0,
  idleBreathingSpeed: 1,
  idleBreathingAmount: 1,
  blinkFrequency: 1,
  blinkDuration: 130,
  eyeFollowStrength: 1,
  slapDuration: 90,
  anticipationDuration: 160,
  armStretch: 1,
  armCurve: 1,
  impactHandScale: 1.35,
  recoilAmount: 1,
  bodyRotation: 1,
  squashAmount: 0.14,
  stretchAmount: 0.12,
  expressionDuration: 340,
  springStiffness: 0.18,
  springDamping: 0.82,

  gravity: 1.1,
  launchSpeed: 14,
  launchLift: 0.8,
  perfectLaunchMultiplier: 1.25,
  goldenLaunchMultiplier: 1.5,
  spinSpeed: 0.25,
  spinRandomness: 0.6,
  restitution: 0.55,
  friction: 0.05,
  frictionAir: 0.012,
  maxBodies: 24,
  bodyLifetime: 2200,
  floorBounceEnabled: true,
  wallBounceEnabled: true,

  particleCount: 16,
  perfectParticleCount: 26,
  goldenParticleCount: 34,
  particleLifetime: 320,
  particleSpeed: 4,
  particleGravity: 0.08,
  particleDrag: 0.95,
  particleSize: 1,
  impactRingCount: 2,
  impactRingRadius: 34,
  ringExpansionSpeed: 3.2,
  trailOpacity: 0.4,
  shakeStrength: 1,
  perfectShake: 6,
  goldenShake: 8,
  shakeDecay: 0.86,
  hitStopMs: 40,
  perfectHitStopMs: 45,
  goldenHitStopMs: 60,
  flashOpacity: 0.42,
  flashDuration: 220,
  backgroundPulseStrength: 1,
  meltdownIntensity: 1,
  effectsQuality: 1,
  reducedMotion: false,

  hudScale: 1,
  scoreFontSize: 24,
  timerFontSize: 20,
  comboFontSize: 14,
  floatingTextScale: 1,
  floatingTextDuration: 900,
  captionFrequency: 7,
  captionDuration: 1.6,
  resultAnimationSpeed: 1,
  buttonScale: 1,
  uiAnimationIntensity: 1,

  masterVolume: 0.9,
  musicVolume: 0.45,
  sfxVolume: 0.9,
  normalHitVolume: 0.8,
  perfectHitVolume: 0.9,
  goldenHitVolume: 1,
  mistakeVolume: 0.9,
  comboVolume: 0.6,
  pitchVariation: 0.06,
  maxAudioVoices: 8,
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  hapticIntensity: 1,

  backgroundColour: '#191970',
  backgroundSecondary: '#3A1566',
  characterPrimary: '#F8F8FF',
  characterShadow: '#D3C8EC',
  characterOutline: '#2E0854',
  accentColour: '#FF7518',
  goldenAccent: '#FFD700',
  cursedAccent: '#B0181F',
  uiText: '#FFFDD0',
  outlineWidth: 5,
  shadowIntensity: 1,
  backgroundAnimationSpeed: 1,
};

export type Bound = [min: number, max: number, step: number];

/** Slider bounds — single source of truth for the tuning panel. */
export const BOUNDS: Partial<Record<keyof GameConfig, Bound>> = {
  roundDuration: [15, 120, 1],
  meltdownStartTime: [10, 118, 1],
  initialSpawnInterval: [0.3, 2, 0.01],
  minimumSpawnInterval: [0.2, 1.5, 0.01],
  spawnAcceleration: [0.6, 3, 0.05],
  travelDuration: [0.5, 2.5, 0.01],
  minimumTravelDuration: [0.35, 2.5, 0.01],
  perfectWindowMs: [15, 200, 1],
  normalWindowMs: [60, 400, 5],
  slapRecoveryMs: [40, 400, 5],
  sameLaneCooldownMs: [100, 1200, 10],
  minimumReactionWindowMs: [120, 900, 10],
  goldenChance: [0, 0.6, 0.01],
  cursedChance: [0, 0.6, 0.01],
  goldenIntroductionTime: [0, 60, 1],
  cursedIntroductionTime: [0, 90, 1],
  maxIncomingTargets: [1, 8, 1],
  scorePerHit: [1, 100, 1],
  perfectMultiplier: [1, 4, 0.1],
  goldenMultiplier: [1, 10, 0.5],
  comboScoreScaling: [0, 0.3, 0.01],
  invalidTapPenalty: [0, 10, 1],

  characterScale: [0.6, 1.6, 0.05],
  characterYOffset: [-90, 90, 5],
  idleBreathingSpeed: [0, 3, 0.05],
  idleBreathingAmount: [0, 3, 0.05],
  blinkFrequency: [0.2, 3, 0.05],
  blinkDuration: [40, 400, 10],
  eyeFollowStrength: [0, 2, 0.05],
  slapDuration: [40, 300, 5],
  anticipationDuration: [0, 400, 10],
  armStretch: [0.6, 1.8, 0.05],
  armCurve: [0, 2.5, 0.05],
  impactHandScale: [1, 2.4, 0.05],
  recoilAmount: [0, 2, 0.05],
  bodyRotation: [0, 2.5, 0.05],
  squashAmount: [0, 0.5, 0.01],
  stretchAmount: [0, 0.5, 0.01],
  expressionDuration: [80, 1200, 20],
  springStiffness: [0.04, 0.9, 0.01],
  springDamping: [0.5, 0.99, 0.01],

  gravity: [0, 3, 0.05],
  launchSpeed: [4, 30, 1],
  launchLift: [0, 2, 0.05],
  perfectLaunchMultiplier: [0.5, 3, 0.05],
  goldenLaunchMultiplier: [0.5, 3, 0.05],
  spinSpeed: [0, 1.2, 0.05],
  spinRandomness: [0, 2, 0.05],
  restitution: [0, 1, 0.05],
  friction: [0, 1, 0.01],
  frictionAir: [0, 0.1, 0.002],
  maxBodies: [4, 60, 1],
  bodyLifetime: [500, 6000, 100],

  particleCount: [0, 40, 1],
  perfectParticleCount: [0, 80, 1],
  goldenParticleCount: [0, 80, 1],
  particleLifetime: [80, 1200, 20],
  particleSpeed: [0.5, 14, 0.1],
  particleGravity: [0, 0.6, 0.01],
  particleDrag: [0.8, 0.995, 0.005],
  particleSize: [0.3, 2.5, 0.05],
  impactRingCount: [0, 6, 1],
  impactRingRadius: [10, 120, 2],
  ringExpansionSpeed: [0.5, 12, 0.1],
  trailOpacity: [0, 1, 0.05],
  shakeStrength: [0, 2.5, 0.05],
  perfectShake: [0, 20, 0.5],
  goldenShake: [0, 24, 0.5],
  shakeDecay: [0.6, 0.98, 0.01],
  hitStopMs: [0, 200, 5],
  perfectHitStopMs: [0, 200, 5],
  goldenHitStopMs: [0, 240, 5],
  flashOpacity: [0, 1, 0.02],
  flashDuration: [60, 800, 10],
  backgroundPulseStrength: [0, 2, 0.05],
  meltdownIntensity: [0, 2, 0.05],
  effectsQuality: [0.2, 1.5, 0.05],

  hudScale: [0.7, 1.4, 0.02],
  scoreFontSize: [16, 40, 1],
  timerFontSize: [14, 36, 1],
  comboFontSize: [10, 26, 1],
  floatingTextScale: [0.5, 2, 0.05],
  floatingTextDuration: [300, 2000, 50],
  captionFrequency: [0, 30, 1],
  captionDuration: [0.5, 4, 0.1],
  resultAnimationSpeed: [0.4, 2.5, 0.05],
  buttonScale: [0.8, 1.4, 0.02],
  uiAnimationIntensity: [0, 2, 0.05],

  masterVolume: [0, 1, 0.05],
  musicVolume: [0, 1, 0.05],
  sfxVolume: [0, 1, 0.05],
  normalHitVolume: [0, 1, 0.05],
  perfectHitVolume: [0, 1, 0.05],
  goldenHitVolume: [0, 1, 0.05],
  mistakeVolume: [0, 1, 0.05],
  comboVolume: [0, 1, 0.05],
  pitchVariation: [0, 0.4, 0.01],
  maxAudioVoices: [1, 24, 1],
  hapticIntensity: [0, 2, 0.05],

  outlineWidth: [1, 10, 0.5],
  shadowIntensity: [0, 2, 0.05],
  backgroundAnimationSpeed: [0, 3, 0.05],
};

export const COLOR_KEYS = [
  'backgroundColour',
  'backgroundSecondary',
  'characterPrimary',
  'characterShadow',
  'characterOutline',
  'accentColour',
  'goldenAccent',
  'cursedAccent',
  'uiText',
] as const satisfies readonly (keyof GameConfig)[];

export const BOOL_KEYS = [
  'reducedMotion',
  'floorBounceEnabled',
  'wallBounceEnabled',
  'soundEnabled',
  'musicEnabled',
  'hapticsEnabled',
] as const satisfies readonly (keyof GameConfig)[];

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Clamp + sanity-check any partial config against safe bounds. */
export function normalizeConfig(input: Partial<GameConfig>): GameConfig {
  const merged: GameConfig = { ...DEFAULT_CONFIG, ...input };

  (Object.keys(BOUNDS) as (keyof GameConfig)[]).forEach((key) => {
    const bound = BOUNDS[key];
    if (!bound) return;
    const raw = Number(merged[key]);
    const fallback = Number(DEFAULT_CONFIG[key]);
    const safe = Number.isFinite(raw) ? raw : fallback;
    (merged as unknown as Record<string, number>)[key as string] = Math.min(
      bound[1],
      Math.max(bound[0], safe),
    );
  });

  COLOR_KEYS.forEach((key) => {
    const value = String(merged[key] ?? '');
    if (!HEX.test(value)) (merged as unknown as Record<string, string>)[key] = String(DEFAULT_CONFIG[key]);
  });

  BOOL_KEYS.forEach((key) => {
    (merged as unknown as Record<string, boolean>)[key as string] = Boolean(merged[key]);
  });

  // ── Cross-field sanity so the game stays fair and playable ──
  if (merged.normalWindowMs < merged.perfectWindowMs + 10) {
    merged.normalWindowMs = Math.min(400, merged.perfectWindowMs + 10);
  }
  if (merged.minimumSpawnInterval > merged.initialSpawnInterval) {
    merged.minimumSpawnInterval = merged.initialSpawnInterval;
  }
  if (merged.minimumTravelDuration > merged.travelDuration) {
    merged.minimumTravelDuration = merged.travelDuration;
  }
  if (merged.meltdownStartTime > merged.roundDuration - 2) {
    merged.meltdownStartTime = Math.max(5, merged.roundDuration - 2);
  }
  const maxReaction = merged.travelDuration * 1000;
  if (merged.minimumReactionWindowMs > maxReaction) {
    merged.minimumReactionWindowMs = maxReaction;
  }
  const specialChance = merged.goldenChance + merged.cursedChance;
  if (specialChance > 0.8) {
    const k = 0.8 / specialChance;
    merged.goldenChance *= k;
    merged.cursedChance *= k;
  }
  return merged;
}