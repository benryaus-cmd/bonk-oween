import { useEffect, useMemo, useRef } from 'react';
import { useAudioContext, useSound } from '@aippy/runtime/audio';
import { AudioManager } from '@/audio/AudioManager';
import { BABY_HIT_URL, BABY_INCOMING_URL, MUSIC_URL, SFX_MANIFEST, type SfxName } from '@/audio/manifest';

export interface GameAudioApi {
  playSfx: (name: SfxName, gain?: number) => void;
  /** Call from a real tap handler — unlocks the context and drives the loop. */
  syncMusic: (shouldPlay: boolean) => void;
  stopMusic: () => void;
}

const SOUND_MAP = {
  bgm: MUSIC_URL,
  babyIncoming: BABY_INCOMING_URL,
  babyHit: BABY_HIT_URL,
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
  const lastRecordedRef = useRef({ babyIncoming: -Infinity, babyHit: -Infinity });

  useEffect(() => {
    settingsRef.current = settings;
    managerRef.current?.setVolumes(settings.master, settings.sfx, settings.muted);
  }, [settings]);

  useEffect(
    () => () => {
      managerRef.current?.dispose();
      managerRef.current = null;
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

    const syncMusic = (shouldPlay: boolean): void => {
      const s = settingsRef.current;
      const volume = Math.max(0, Math.min(1, s.music * s.master));
      const want = shouldPlay && !s.muted && s.musicEnabled && volume > 0.002;
      const key = `${want ? 1 : 0}:${volume.toFixed(2)}`;
      const retry = want && !musicPlayingRef.current;
      if (!retry && musicKeyRef.current === key) return;
      musicKeyRef.current = key;
      if (!want) {
        musicPlayingRef.current = false;
        stop('bgm');
        return;
      }
      void ensure().then(async () => {
        const handle = await play('bgm', { loop: true, volume });
        musicPlayingRef.current = Boolean(handle);
      });
    };

    return {
      playSfx: (name: SfxName, gain = 1) => {
        const s = settingsRef.current;
        if (s.muted || !s.soundEnabled) return;
        const def = SFX_MANIFEST[name];
        if (name === 'babyIncoming' || name === 'babyHit') {
          const now = performance.now();
          if (now - lastRecordedRef.current[name] < def.cooldown) return;
          lastRecordedRef.current[name] = now;
          const volume = Math.max(0, Math.min(1, gain * def.defaultGain * s.master * s.sfx));
          if (volume <= 0.002) return;
          void ensure().then(async () => {
            try {
              const handle = await play(name, { volume });
              if (handle) return;
            } catch {
              // A blocked CDN or decode failure should not interrupt a run.
            }
            managerRef.current?.play(name === 'babyHit' ? 'cursedHit' : 'characterReact', {
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
        musicPlayingRef.current = false;
        stop('bgm');
      },
    };
  }, [getAudioContext, unlock, play, stop]);
}
