import { useEffect, useMemo, useRef } from 'react';
import { useAudioContext, useSound } from '@aippy/runtime/audio';
import { AudioManager } from '@/audio/AudioManager';
import { cachedAudio } from '@/audio/AssetPreload';
import { CrossfadeMusic } from '@/audio/CrossfadeMusic';
import { BABY_HIT_EXTRA_URL, BABY_HIT_URL, BABY_INCOMING_URL, CANDY_POP_URL, MENU_MUSIC_URL, MUSIC_URL, PERFECT_EXTRA_URL, SFX_MANIFEST, type SfxName } from '@/audio/manifest';

export type MusicMode = 'off' | 'menu' | 'game';

export interface GameAudioApi {
  playSfx: (name: SfxName, gain?: number) => void;
  /** Call from a real tap handler — unlocks the context and drives the loop. */
  syncMusic: (mode: MusicMode) => void;
  stopMusic: () => void;
}

const SOUND_MAP = {
  bgm: MUSIC_URL,
  menuBgm: MENU_MUSIC_URL,
  babyIncoming: BABY_INCOMING_URL,
  babyHit: BABY_HIT_URL,
  babyHitExtra: BABY_HIT_EXTRA_URL,
  perfectExtra: PERFECT_EXTRA_URL,
  candyPop: CANDY_POP_URL,
};

export interface AudioSettings {
  muted: boolean;
  master: number;
  sfx: number;
  music: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  pitchVariation: number;
  maxVoices: number;
}

/** One shared audio pipeline: Tone.js instruments for SFX, decoded file for music. */
export function useGameAudio(settings: AudioSettings): GameAudioApi {
  const { getAudioContext, unlock } = useAudioContext();
  const { play, stop } = useSound(SOUND_MAP);
  const managerRef = useRef<AudioManager | null>(null);
  const settingsRef = useRef<AudioSettings>(settings);
  const musicKeyRef = useRef('');
  const musicPlayingRef = useRef(false);
  const musicStartingRef = useRef(false);
  const musicAttemptRef = useRef(0);
  const musicModeRef = useRef<MusicMode>('off');
  const loopersRef = useRef({ menu: new CrossfadeMusic(), game: new CrossfadeMusic() });
  const recordedBuffersRef = useRef(new Map<string, AudioBuffer>());
  const lastRecordedRef = useRef<Record<string, number>>({});

  useEffect(() => {
    settingsRef.current = settings;
    managerRef.current?.setVolumes(settings.master, settings.sfx, settings.muted);
    const volume = settings.muted || !settings.musicEnabled ? 0 : settings.master * settings.music;
    loopersRef.current.menu.setVolume(volume * 0.9);
    loopersRef.current.game.setVolume(volume * 0.9);
  }, [settings]);

  useEffect(
    () => () => {
      managerRef.current?.dispose();
      managerRef.current = null;
      musicAttemptRef.current++;
      loopersRef.current.menu.stop();
      loopersRef.current.game.stop();
    },
    [],
  );

  return useMemo<GameAudioApi>(() => {
    const ensure = async (): Promise<void> => {
      if (managerRef.current?.isReady) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      await unlock();
      const manager = managerRef.current ?? new AudioManager();
      managerRef.current = manager;
      await manager.init(ctx);
      const s = settingsRef.current;
      manager.setVolumes(s.master, s.sfx, s.muted);
    };

    const syncMusic = (mode: MusicMode): void => {
      const s = settingsRef.current;
      const volume = Math.max(0, Math.min(1, s.music * s.master));
      const want = mode !== 'off' && !s.muted && s.musicEnabled && volume > 0.002;
      const effectiveMode: MusicMode = want ? mode : 'off';
      const key = `${effectiveMode}:${volume.toFixed(2)}`;
      const retry = want && !musicPlayingRef.current && !musicStartingRef.current;
      if (!retry && musicKeyRef.current === key) return;
      const attempt = ++musicAttemptRef.current;
      musicKeyRef.current = key;
      musicModeRef.current = effectiveMode;
      if (!want) {
        musicPlayingRef.current = false;
        musicStartingRef.current = false;
        stop('bgm');
        stop('menuBgm');
        loopersRef.current.menu.stop();
        loopersRef.current.game.stop();
        return;
      }
      const track = mode === 'menu' ? 'menu' : 'game';
      const trackVolume = volume * 0.9;
      loopersRef.current.menu.stop();
      loopersRef.current.game.stop();
      stop('bgm'); stop('menuBgm');
      musicPlayingRef.current = false;
      musicStartingRef.current = true;
      void ensure().then(async () => {
        if (attempt !== musicAttemptRef.current || musicModeRef.current !== mode) return;
        const ctx = getAudioContext();
        const bytes = cachedAudio(track === 'menu' ? MENU_MUSIC_URL : MUSIC_URL);
        const started = ctx && bytes && await loopersRef.current[track].start(ctx, bytes, trackVolume);
        if (attempt !== musicAttemptRef.current) return;
        if (started) {
          musicPlayingRef.current = true;
          musicStartingRef.current = false;
          return;
        }
        if (musicModeRef.current !== mode) return;
        const handle = await play(track === 'menu' ? 'menuBgm' : 'bgm', { loop: true, volume: trackVolume });
        if (attempt !== musicAttemptRef.current) return;
        musicPlayingRef.current = Boolean(handle);
        musicStartingRef.current = false;
      }).catch(() => {
        if (attempt === musicAttemptRef.current) {
          musicPlayingRef.current = false;
          musicStartingRef.current = false;
        }
      });
    };

    return {
      playSfx: (name: SfxName, gain = 1) => {
        const s = settingsRef.current;
        if (s.muted || !s.soundEnabled) return;
        const def = SFX_MANIFEST[name];
        if (name === 'babyIncoming' || name === 'babyHit' || name === 'babyHitExtra' || name === 'perfectExtra' || name === 'candyPop') {
          const now = performance.now();
          if (now - (lastRecordedRef.current[name] ?? -Infinity) < def.cooldown) return;
          lastRecordedRef.current[name] = now;
          const boosted = name === 'babyHitExtra' || name === 'perfectExtra';
          const volume = Math.max(0, Math.min(boosted ? 2 : 1,
            gain * def.defaultGain * s.master * s.sfx * (boosted ? 3.75 : 1)));
          if (volume <= 0.002) return;
          void ensure().then(async () => {
            try {
              if (boosted) {
                const ctx = getAudioContext();
                const url = name === 'babyHitExtra' ? BABY_HIT_EXTRA_URL : PERFECT_EXTRA_URL;
                const bytes = cachedAudio(url);
                if (ctx && bytes) {
                  let buffer = recordedBuffersRef.current.get(url);
                  if (!buffer) {
                    buffer = await ctx.decodeAudioData(bytes.slice(0));
                    recordedBuffersRef.current.set(url, buffer);
                  }
                  const source = ctx.createBufferSource();
                  const level = ctx.createGain();
                  source.buffer = buffer;
                  level.gain.value = volume; // WebAudio allows the requested gain above 1.
                  source.connect(level); level.connect(ctx.destination);
                  source.onended = () => { source.disconnect(); level.disconnect(); };
                  source.start();
                  return;
                }
              }
              const handle = await play(name, { volume: Math.min(1, volume) });
              if (handle) return;
            } catch {
              // A blocked CDN or decode failure should not interrupt a run.
            }
            managerRef.current?.play(name === 'babyHit' || name === 'babyHitExtra' ? 'cursedHit' : 'slapSoft', {
              gain,
              pitchVariance: s.pitchVariation,
              maxVoices: s.maxVoices,
            });
          });
          return;
        }
        void ensure().then(() =>
          managerRef.current?.play(name, {
            gain: gain * (def ? def.defaultGain : 1),
            pitchVariance: s.pitchVariation,
            maxVoices: s.maxVoices,
          }),
        );
      },
      syncMusic,
      stopMusic: () => {
        musicKeyRef.current = '';
        syncMusic('off');
      },
    };
  }, [getAudioContext, unlock, play, stop]);
}
