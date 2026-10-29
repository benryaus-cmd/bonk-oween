import * as Tone from 'tone';
import { SFX_MANIFEST, type SfxName } from '@/audio/manifest';

export interface PlayOptions {
  gain?: number;
  pitchVariance?: number;
  maxVoices?: number;
}

const VOICE_WINDOW_MS = 400;

/**
 * All sound effects are synthesised with Tone.js on the Aippy AudioContext.
 * Instruments are created once during unlock, never inside the game loop.
 */
export class AudioManager {
  private master: Tone.Volume | null = null;
  private sfxBus: Tone.Volume | null = null;
  private noise: Tone.NoiseSynth | null = null;
  private thump: Tone.MembraneSynth | null = null;
  private chime: Tone.FMSynth | null = null;
  private blip: Tone.Synth | null = null;
  private buzz: Tone.Synth | null = null;
  private ping: Tone.Synth | null = null;
  private timers: number[] = [];
  private ready = false;
  private lastPlay = new Map<SfxName, number>();
  private voices: number[] = [];
  private lastStartTime = new Map<string, number>();

  get isReady(): boolean {
    return this.ready;
  }

  async init(ctx: AudioContext): Promise<void> {
    if (this.ready) return;
    Tone.setContext(ctx);
    await Tone.start();
    this.lastStartTime.clear();

    this.master = new Tone.Volume(0).toDestination();
    this.sfxBus = new Tone.Volume(0).connect(this.master);

    const filter = new Tone.Filter(1800, 'lowpass').connect(this.sfxBus);
    this.noise = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.075, sustain: 0 },
    }).connect(filter);

    this.thump = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 3,
      envelope: { attack: 0.001, decay: 0.14, sustain: 0 },
    }).connect(this.sfxBus);

    this.chime = new Tone.FMSynth({
      harmonicity: 3.01,
      modulationIndex: 6,
      envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.1 },
      oscillator: { type: 'triangle' },
    }).connect(this.sfxBus);

    this.blip = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 },
    }).connect(this.sfxBus);

    this.buzz = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.002, decay: 0.16, sustain: 0, release: 0.05 },
    }).connect(this.sfxBus);

    this.ping = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.13, sustain: 0, release: 0.06 },
    }).connect(this.sfxBus);

    this.ready = true;
  }

  setVolumes(master: number, sfx: number, muted: boolean): void {
    if (!this.master || !this.sfxBus) return;
    this.master.volume.value = muted ? -80 : gainToDb(master);
    this.sfxBus.volume.value = gainToDb(sfx);
  }

  private later(fn: () => void, ms: number): void {
    const id = window.setTimeout(() => {
      this.timers = this.timers.filter((t) => t !== id);
      fn();
    }, ms);
    this.timers.push(id);
  }

  private startAt(instrument: string): number {
    const time = Math.max(Tone.now(), (this.lastStartTime.get(instrument) ?? -Infinity) + 0.001);
    this.lastStartTime.set(instrument, time);
    return time;
  }

  play(name: SfxName, opts: PlayOptions = {}): void {
    if (!this.ready) return;
    const def = SFX_MANIFEST[name];
    if (!def) return;
    const now = performance.now();
    if (now - (this.lastPlay.get(name) ?? 0) < def.cooldown) return;

    this.voices = this.voices.filter((t) => now - t < VOICE_WINDOW_MS);
    const cap = Math.min(def.maxVoices, Math.max(1, opts.maxVoices ?? def.maxVoices));
    if (this.voices.length >= cap + 2) return;
    this.voices.push(now);
    this.lastPlay.set(name, now);

    const gain = Math.max(0, Math.min(1, (opts.gain ?? 1) * def.defaultGain));
    if (gain <= 0.02) return;
    const p = 1 + (Math.random() - 0.5) * (opts.pitchVariance ?? def.pitchVariance);

    switch (name) {
      case 'slapSoft':
        this.noise?.triggerAttackRelease(0.05, this.startAt('noise'), gain * 0.8);
        this.thump?.triggerAttackRelease(150 * p, '32n', this.startAt('thump'), gain);
        break;
      case 'slapHard':
        this.noise?.triggerAttackRelease(0.08, this.startAt('noise'), gain);
        this.thump?.triggerAttackRelease(96 * p, '16n', this.startAt('thump'), gain);
        break;
      case 'slapPerfect':
        this.noise?.triggerAttackRelease(0.04, this.startAt('noise'), gain * 0.9);
        this.thump?.triggerAttackRelease(190 * p, '32n', this.startAt('thump'), gain);
        this.ping?.triggerAttackRelease(1420 * p, '64n', this.startAt('ping'), gain * 0.7);
        break;
      case 'slapCritical':
        this.noise?.triggerAttackRelease(0.11, this.startAt('noise'), gain);
        this.thump?.triggerAttackRelease(72 * p, '8n', this.startAt('thump'), gain);
        this.chime?.triggerAttackRelease(1760 * p, '32n', this.startAt('chime'), gain * 0.6);
        break;
      case 'comboUp':
        this.ping?.triggerAttackRelease(660 * p, '32n', this.startAt('ping'), gain);
        this.later(() => this.ping?.triggerAttackRelease(990 * p, '32n', this.startAt('ping'), gain * 0.9), 55);
        break;
      case 'comboBreak':
        this.buzz?.triggerAttackRelease(170 * p, '16n', this.startAt('buzz'), gain);
        this.later(() => this.buzz?.triggerAttackRelease(112 * p, '16n', this.startAt('buzz'), gain * 0.8), 90);
        break;
      case 'goldenHit':
        this.chime?.triggerAttackRelease(1046 * p, '16n', this.startAt('chime'), gain);
        this.later(() => this.chime?.triggerAttackRelease(1318 * p, '16n', this.startAt('chime'), gain * 0.9), 70);
        this.later(() => this.chime?.triggerAttackRelease(1568 * p, '8n', this.startAt('chime'), gain * 0.8), 140);
        break;
      case 'cursedHit':
        this.buzz?.triggerAttackRelease(110 * p, '8n', this.startAt('buzz'), gain);
        this.later(() => this.buzz?.triggerAttackRelease(78 * p, '16n', this.startAt('buzz'), gain * 0.85), 95);
        break;
      case 'objectMiss':
        this.buzz?.triggerAttackRelease(210 * p, '32n', this.startAt('buzz'), gain * 0.7);
        this.later(() => this.buzz?.triggerAttackRelease(150 * p, '32n', this.startAt('buzz'), gain * 0.5), 70);
        break;
      case 'countdown':
        this.ping?.triggerAttackRelease(900 * p, '64n', this.startAt('ping'), gain);
        break;
      case 'finalMeltdown':
        this.thump?.triggerAttackRelease(58 * p, '8n', this.startAt('thump'), gain);
        this.buzz?.triggerAttackRelease(300 * p, '16n', this.startAt('buzz'), gain * 0.7);
        this.later(() => this.chime?.triggerAttackRelease(220 * p, '8n', this.startAt('chime'), gain * 0.6), 110);
        break;
      case 'scoreReveal':
        [523, 659, 784].forEach((f, i) =>
          this.later(() => this.ping?.triggerAttackRelease(f * p, '16n', this.startAt('ping'), gain), i * 85),
        );
        break;
      case 'newRecord':
        [1046, 1318, 1568, 2093].forEach((f, i) =>
          this.later(() => this.chime?.triggerAttackRelease(f * p, '16n', this.startAt('chime'), gain * 0.85), i * 90),
        );
        break;
      case 'uiTap':
        this.blip?.triggerAttackRelease(1180 * p, '64n', this.startAt('blip'), gain);
        break;
      case 'uiBack':
        this.blip?.triggerAttackRelease(720 * p, '64n', this.startAt('blip'), gain);
        break;
      case 'uiRestart':
        this.blip?.triggerAttackRelease(880 * p, '64n', this.startAt('blip'), gain);
        this.later(() => this.blip?.triggerAttackRelease(1240 * p, '64n', this.startAt('blip'), gain * 0.9), 70);
        break;
      default:
        this.ping?.triggerAttackRelease(520 * p, '32n', this.startAt('ping'), gain);
        break;
    }
  }

  dispose(): void {
    this.timers.forEach((id) => window.clearTimeout(id));
    this.timers = [];
    [this.noise, this.thump, this.chime, this.blip, this.buzz, this.ping].forEach((inst) => inst?.dispose());
    this.sfxBus?.dispose();
    this.master?.dispose();
    this.noise = null;
    this.thump = null;
    this.chime = null;
    this.blip = null;
    this.buzz = null;
    this.ping = null;
    this.sfxBus = null;
    this.master = null;
    this.voices = [];
    this.lastPlay.clear();
    this.lastStartTime.clear();
    this.ready = false;
  }
}

function gainToDb(gain: number): number {
  if (gain <= 0.001) return -80;
  return 20 * Math.log10(Math.min(1, gain));
}