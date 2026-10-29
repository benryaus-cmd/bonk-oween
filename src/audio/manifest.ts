import assetsData from "@/config/assets";
export const MUSIC_URL = assetsData.AUDIO_BGM;
export const MENU_MUSIC_URL = assetsData.AUDIO_MENU_BGM;
export const BABY_INCOMING_URL = assetsData.AUDIO_BABY_INCOMING;
export const BABY_HIT_URL = assetsData.AUDIO_BABY_HIT;
export const BABY_HIT_EXTRA_URL = assetsData.AUDIO_BABY_HIT_EXTRA;
export const PERFECT_EXTRA_URL = assetsData.AUDIO_PERFECT_EXTRA;
export const CANDY_POP_URL = assetsData.AUDIO_CANDY_POP;

export type SfxName =
  | 'slapSoft'
  | 'slapHard'
  | 'slapPerfect'
  | 'slapCritical'
  | 'comboUp'
  | 'comboBreak'
  | 'goldenHit'
  | 'cursedHit'
  | 'babyIncoming'
  | 'babyHit'
  | 'babyHitExtra'
  | 'perfectExtra'
  | 'candyPop'
  | 'objectMiss'
  | 'countdown'
  | 'finalMeltdown'
  | 'scoreReveal'
  | 'newRecord'
  | 'uiTap'
  | 'uiBack'
  | 'uiRestart'
  | 'characterReact';

export type SfxCategory = 'hit' | 'combo' | 'ui' | 'mood' | 'system';

export interface SfxDef {
  desc: string;
  category: SfxCategory;
  /** 0…1 gain multiplier applied on top of the sfx bus. */
  defaultGain: number;
  /** Minimum ms between two triggers of this id. */
  cooldown: number;
  /** Maximum overlapping instances of this id. */
  maxVoices: number;
  /** Random pitch spread, 0 = fixed. */
  pitchVariance: number;
}

/**
 * Every sound effect is generated with Tone.js instruments on the Aippy
 * audio context (spec asset type `synth`). No file decoding, no runtime
 * OscillatorNode spam — instruments are created once on unlock.
 */
export const SFX_MANIFEST: Record<SfxName, SfxDef> = {
  slapSoft: { desc: 'soft body slap', category: 'hit', defaultGain: 0.72, cooldown: 24, maxVoices: 4, pitchVariance: 0.14 },
  slapHard: { desc: 'heavier slap', category: 'hit', defaultGain: 0.85, cooldown: 24, maxVoices: 4, pitchVariance: 0.12 },
  slapPerfect: { desc: 'sharp high slap', category: 'hit', defaultGain: 0.95, cooldown: 26, maxVoices: 4, pitchVariance: 0.08 },
  slapCritical: { desc: 'punchy critical slap', category: 'hit', defaultGain: 1, cooldown: 30, maxVoices: 3, pitchVariance: 0.06 },
  comboUp: { desc: 'rising melodic tone', category: 'combo', defaultGain: 0.5, cooldown: 90, maxVoices: 2, pitchVariance: 0.04 },
  comboBreak: { desc: 'descending buzz', category: 'combo', defaultGain: 0.6, cooldown: 160, maxVoices: 2, pitchVariance: 0.05 },
  goldenHit: { desc: 'shimmering chime', category: 'hit', defaultGain: 0.9, cooldown: 40, maxVoices: 3, pitchVariance: 0.03 },
  cursedHit: { desc: 'low buzzing error', category: 'mood', defaultGain: 0.85, cooldown: 120, maxVoices: 2, pitchVariance: 0.05 },
  babyIncoming: { desc: 'incoming baby warning (recorded)', category: 'mood', defaultGain: 0.9, cooldown: 600, maxVoices: 1, pitchVariance: 0 },
  babyHit: { desc: 'baby bonked (recorded)', category: 'mood', defaultGain: 0.9, cooldown: 300, maxVoices: 1, pitchVariance: 0 },
  babyHitExtra: { desc: 'second baby mistake layer (recorded)', category: 'mood', defaultGain: 0.54, cooldown: 300, maxVoices: 1, pitchVariance: 0 },
  perfectExtra: { desc: 'perfect accent (recorded)', category: 'hit', defaultGain: 0.45, cooldown: 45, maxVoices: 2, pitchVariance: 0 },
  candyPop: { desc: 'candy pickup pop (recorded)', category: 'hit', defaultGain: 0.43, cooldown: 45, maxVoices: 3, pitchVariance: 0 },
  objectMiss: { desc: 'sad whoosh', category: 'mood', defaultGain: 0.5, cooldown: 120, maxVoices: 2, pitchVariance: 0.08 },
  countdown: { desc: 'tick', category: 'system', defaultGain: 0.4, cooldown: 120, maxVoices: 2, pitchVariance: 0 },
  finalMeltdown: { desc: 'alarm stab', category: 'system', defaultGain: 0.9, cooldown: 400, maxVoices: 1, pitchVariance: 0 },
  scoreReveal: { desc: 'rising arpeggio', category: 'system', defaultGain: 0.7, cooldown: 400, maxVoices: 1, pitchVariance: 0 },
  newRecord: { desc: 'victory flourish', category: 'system', defaultGain: 0.9, cooldown: 600, maxVoices: 1, pitchVariance: 0 },
  uiTap: { desc: 'light hollow click', category: 'ui', defaultGain: 0.4, cooldown: 60, maxVoices: 2, pitchVariance: 0.05 },
  uiBack: { desc: 'lower click', category: 'ui', defaultGain: 0.38, cooldown: 60, maxVoices: 2, pitchVariance: 0.05 },
  uiRestart: { desc: 'two step click', category: 'ui', defaultGain: 0.55, cooldown: 200, maxVoices: 1, pitchVariance: 0 },
  characterReact: { desc: 'gremlin squeak', category: 'mood', defaultGain: 0.45, cooldown: 120, maxVoices: 2, pitchVariance: 0.12 },
};

export const SFX_IDS = Object.keys(SFX_MANIFEST) as SfxName[];
