import { neutralPose, restArm, type ArmPose, type CharacterPose, type Mood, type MouthStyle } from '@/art/CharacterPose';
import { DEFAULT_CONFIG, type GameConfig } from '@/config/defaults';
import { clamp } from '@/game/rng';
import type { HitQuality, Side } from '@/game/types';

export interface MotionConfig {
  breatheSpeed: number;
  breatheAmount: number;
  blinkFrequency: number;
  blinkDuration: number;
  eyeFollow: number;
  slapDuration: number;
  anticipation: number;
  impactHandScale: number;
  recoil: number;
  squash: number;
  stretch: number;
  expressionDuration: number;
  stiffness: number;
  damping: number;
  armStretch: number;
  reducedMotion: boolean;
}

export function motionConfigFrom(cfg: GameConfig): MotionConfig {
  return {
    breatheSpeed: cfg.idleBreathingSpeed,
    breatheAmount: cfg.idleBreathingAmount,
    blinkFrequency: cfg.blinkFrequency,
    blinkDuration: cfg.blinkDuration,
    eyeFollow: cfg.eyeFollowStrength,
    slapDuration: cfg.slapDuration,
    anticipation: cfg.anticipationDuration,
    impactHandScale: cfg.impactHandScale,
    recoil: cfg.recoilAmount,
    squash: cfg.squashAmount,
    stretch: cfg.stretchAmount,
    expressionDuration: cfg.expressionDuration,
    stiffness: cfg.springStiffness,
    damping: cfg.springDamping,
    armStretch: cfg.armStretch,
    reducedMotion: cfg.reducedMotion,
  };
}

const MOOD_PRIORITY: Record<Mood, number> = {
  idle: 0,
  curious: 1,
  satisfied: 2,
  cocky: 3,
  embarrassed: 3,
  disgust: 4,
  manic: 4,
  ecstatic: 5,
  celebrate: 5,
  record: 6,
  exhausted: 9,
};

interface MoodFace {
  browLeft: number;
  browRight: number;
  mouth: MouthStyle;
  mouthOpen: number;
  eyeScale: number;
  cheek: number;
  sweat: number;
  sparkle: number;
  glow: number;
  jitter: number;
  tongue: number;
}

const FACES: Record<Mood, MoodFace> = {
  idle: { browLeft: 0, browRight: 0, mouth: 'smile', mouthOpen: 0, eyeScale: 1, cheek: 0.5, sweat: 0, sparkle: 0, glow: 0, jitter: 0, tongue: 0 },
  curious: { browLeft: 0.5, browRight: -0.2, mouth: 'open', mouthOpen: 0.25, eyeScale: 1.08, cheek: 0.5, sweat: 0, sparkle: 0, glow: 0, jitter: 0, tongue: 0 },
  satisfied: { browLeft: 0.2, browRight: 0.2, mouth: 'grin', mouthOpen: 0.3, eyeScale: 1, cheek: 0.9, sweat: 0, sparkle: 0, glow: 0, jitter: 0, tongue: 0.2 },
  ecstatic: { browLeft: 0.8, browRight: 0.8, mouth: 'grin', mouthOpen: 0.9, eyeScale: 1.22, cheek: 1, sweat: 0, sparkle: 0.8, glow: 0.25, jitter: 0, tongue: 0.5 },
  celebrate: { browLeft: 0.9, browRight: 0.9, mouth: 'open', mouthOpen: 1, eyeScale: 1.18, cheek: 1, sweat: 0, sparkle: 1, glow: 0.5, jitter: 0.1, tongue: 0.3 },
  disgust: { browLeft: -0.9, browRight: -0.5, mouth: 'wobble', mouthOpen: 0.2, eyeScale: 0.92, cheek: 0.15, sweat: 0.3, sparkle: 0, glow: 0, jitter: 0.2, tongue: 0 },
  embarrassed: { browLeft: -0.7, browRight: -0.7, mouth: 'flat', mouthOpen: 0, eyeScale: 0.82, cheek: 0.4, sweat: 1, sparkle: 0, glow: 0, jitter: 0, tongue: 0 },
  cocky: { browLeft: 0.35, browRight: -0.75, mouth: 'smirk', mouthOpen: 0.1, eyeScale: 0.95, cheek: 0.95, sweat: 0, sparkle: 0.15, glow: 0, jitter: 0, tongue: 0 },
  manic: { browLeft: 0.9, browRight: -0.9, mouth: 'grit', mouthOpen: 0.5, eyeScale: 1.28, cheek: 0.8, sweat: 0.15, sparkle: 0.5, glow: 0.35, jitter: 1, tongue: 0 },
  exhausted: { browLeft: -0.55, browRight: -0.55, mouth: 'flat', mouthOpen: 0.05, eyeScale: 0.62, cheek: 0.25, sweat: 0.5, sparkle: 0, glow: 0, jitter: 0, tongue: 0 },
  record: { browLeft: 1, browRight: 1, mouth: 'grin', mouthOpen: 1, eyeScale: 1.3, cheek: 1, sweat: 0, sparkle: 1, glow: 0.8, jitter: 0.15, tongue: 0.6 },
};

interface ArmState {
  slapMs: number;
  active: boolean;
  quality: HitQuality | 'whiff';
  anticip: number;
  contact?: { x: number; y: number };
}

interface Smooth {
  browLeft: number;
  browRight: number;
  eyeScale: number;
  eyeOffsetY: number;
  pupilX: number;
  pupilY: number;
  cheek: number;
  mouthOpen: number;
  sweat: number;
  sparkle: number;
  glow: number;
  jitter: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  lean: number;
  bobY: number;
  tongue: number;
}

const easeOut = (t: number): number => 1 - (1 - t) * (1 - t);

const approach = (cur: number, target: number, k: number): number => cur + (target - cur) * k;

/** Drives the gremlin's pose from gameplay events using springs + reactions. */
export class CharacterMotion {
  private cfg: MotionConfig = motionConfigFrom(DEFAULT_CONFIG);
  private clock = 0;
  private walkClock = 0;
  private nextBlink = 1400;
  private blinkMs = -1;
  private mood: Mood = 'idle';
  private moodTtl = 0;
  private moodPriority = 0;
  private impulse = 0;
  private lookX = 0;
  private lookY = 0;
  private arms: Record<Side, ArmState> = {
    left: { slapMs: 0, active: false, quality: 'normal', anticip: 0 },
    right: { slapMs: 0, active: false, quality: 'normal', anticip: 0 },
  };
  private smooth: Smooth = {
    browLeft: 0, browRight: 0, eyeScale: 1, eyeOffsetY: 0, pupilX: 0, pupilY: 0,
    cheek: 0.5, mouthOpen: 0, sweat: 0, sparkle: 0, glow: 0, jitter: 0,
    scaleX: 1, scaleY: 1, rotation: 0, lean: 0, bobY: 0, tongue: 0,
  };
  private pose: CharacterPose = neutralPose();

  reset(): void {
    this.clock = 0;
    this.walkClock = 0;
    this.nextBlink = 1400;
    this.blinkMs = -1;
    this.mood = 'idle';
    this.moodTtl = 0;
    this.moodPriority = 0;
    this.impulse = 0;
    this.lookX = 0;
    this.lookY = 0;
    this.arms.left = { slapMs: 0, active: false, quality: 'normal', anticip: 0 };
    this.arms.right = { slapMs: 0, active: false, quality: 'normal', anticip: 0 };
    this.pose = neutralPose();
  }

  applyConfig(cfg: GameConfig): void {
    this.cfg = motionConfigFrom(cfg);
  }

  slap(side: Side, quality: HitQuality | 'whiff', contact?: { x: number; y: number }): void {
    this.arms[side] = { slapMs: 0, active: true, quality, anticip: 0, contact };
    this.impulse = quality === 'perfect' ? 1 : quality === 'normal' ? 0.68 : 0.32;
    if (quality === 'perfect') this.react('ecstatic');
    else if (quality === 'normal') this.react('satisfied');
    else this.react('embarrassed');
  }

  react(mood: Mood): void {
    const priority = MOOD_PRIORITY[mood];
    if (priority >= this.moodPriority || this.mood === mood) {
      this.mood = mood;
      this.moodPriority = priority;
      this.moodTtl = mood === 'exhausted'
        ? Number.POSITIVE_INFINITY
        : this.cfg.expressionDuration * (mood === 'manic' ? 3 : 1);
    }
  }

  /** Wind-up hint while an object is about to arrive on that side. */
  anticipate(side: Side): void {
    if (this.arms[side].active) return;
    this.arms[side].anticip = 1;
  }

  lookAt(nx: number, ny: number): void {
    this.lookX = clamp(nx, -1, 1);
    this.lookY = clamp(ny, -1, 1);
  }

  setExhausted(on: boolean): void {
    if (on) {
      this.mood = 'exhausted';
      this.moodPriority = MOOD_PRIORITY.exhausted;
      this.moodTtl = Number.POSITIVE_INFINITY;
    } else if (this.mood === 'exhausted') {
      this.mood = 'idle';
      this.moodPriority = 0;
      this.moodTtl = 0;
    }
  }

  update(dtMs: number): CharacterPose {
    const dt = clamp(dtMs, 0, 60);
    this.clock += dt;
    // Walking phase: drives legs, hem bounce, sway and the bag pendulum so the
    // kid reads as striding down the street while the world scrolls past.
    const walkRate =
      7.2 * (this.cfg.reducedMotion ? 0.55 : 1) * (this.mood === 'manic' ? 1.25 : 1);
    this.walkClock += (dt / 1000) * walkRate;
    const swingPhase = this.walkClock;
    const stepLeft = Math.sin(swingPhase);
    const stepRight = Math.sin(swingPhase + Math.PI);
    const hemBounce = Math.abs(Math.sin(swingPhase));
    const sway = Math.sin(swingPhase) * 1.8;
    const bagSwing = Math.sin(swingPhase + 0.9) * (this.cfg.reducedMotion ? 0.4 : 1);

    if (this.moodTtl !== Number.POSITIVE_INFINITY) {
      this.moodTtl -= dt;
      if (this.moodTtl <= 0) {
        this.mood = 'idle';
        this.moodPriority = 0;
      }
    }

    if (this.blinkMs >= 0) {
      this.blinkMs += dt;
      if (this.blinkMs >= this.cfg.blinkDuration) this.blinkMs = -1;
    } else {
      this.nextBlink -= dt;
      if (this.nextBlink <= 0) {
        this.blinkMs = 0;
        const base = 1300 + Math.random() * 2600;
        this.nextBlink = base / Math.max(0.2, this.cfg.blinkFrequency);
      }
    }

    (['left', 'right'] as Side[]).forEach((side) => {
      const arm = this.arms[side];
      if (arm.active) {
        arm.slapMs += dt;
        if (arm.slapMs > this.cfg.slapDuration + Math.max(40, this.cfg.expressionDuration)) {
          arm.active = false;
          arm.anticip = 0;
        }
      } else if (arm.anticip > 0) {
        arm.anticip = Math.max(0, arm.anticip - dt / Math.max(60, this.cfg.anticipation));
      }
    });

    this.impulse *= Math.pow(0.05, dt / 1000) * Math.max(0.6, this.cfg.damping);

    const face = FACES[this.mood];
    const speed = this.cfg.breatheSpeed * (this.mood === 'exhausted' ? 2.1 : 1) * (this.mood === 'manic' ? 2.4 : 1);
    const breathe =
      (Math.sin((this.clock / 620) * speed) * 0.5 + Math.sin((this.clock / 1450) * speed) * 0.5) *
      this.cfg.breatheAmount;

    const k = clamp((dt / 1000) * (3 + this.cfg.stiffness * 26), 0.02, 1);
    const s = this.smooth;
    s.browLeft = approach(s.browLeft, face.browLeft, k);
    s.browRight = approach(s.browRight, face.browRight, k);
    s.eyeScale = approach(s.eyeScale, face.eyeScale, k);
    s.cheek = approach(s.cheek, face.cheek, k);
    s.mouthOpen = approach(s.mouthOpen, face.mouthOpen, k);
    s.sweat = approach(s.sweat, face.sweat, k);
    s.sparkle = approach(s.sparkle, face.sparkle, k);
    s.glow = approach(s.glow, face.glow, k);
    s.jitter = approach(s.jitter, face.jitter, k);
    s.tongue = approach(s.tongue, face.tongue, k);
    s.eyeOffsetY = approach(s.eyeOffsetY, this.mood === 'exhausted' ? 4 : 0, k);
    s.pupilX = approach(s.pupilX, this.lookX * 5 * this.cfg.eyeFollow, k * 0.7);
    s.pupilY = approach(s.pupilY, this.lookY * 4 * this.cfg.eyeFollow, k * 0.7);

    const droop = this.mood === 'exhausted' ? 7 : 0;
    s.bobY = approach(s.bobY, breathe * 3.2 + droop, k);
    s.lean = approach(
      s.lean,
      this.mood === 'cocky' ? 3 : this.mood === 'exhausted' ? 0 : Math.sin(this.clock / 1900) * 2.4,
      k,
    );
    const stretchUp = this.mood === 'ecstatic' || this.mood === 'record' || this.mood === 'celebrate' ? 1 : 0;
    s.scaleY = approach(s.scaleY, 1 + stretchUp * 0.04, k);
    s.scaleX = approach(s.scaleX, 1 - stretchUp * 0.02, k);
    s.rotation = approach(s.rotation, 0, k);

    const jitterX = Math.sin(this.clock * 0.09) * s.jitter * 1.6;
    const wobble = Math.sin(this.clock / 40) * this.impulse * this.cfg.recoil;

    this.pose = {
      mood: this.mood,
      breathe,
      bobY: s.bobY,
      scaleX: s.scaleX + this.impulse * this.cfg.squash * 0.75,
      scaleY: s.scaleY - this.impulse * this.cfg.squash,
      rotation: s.rotation + wobble * 0.06 + jitterX * 0.012,
      lean: (s.lean + wobble * 3 + sway) * this.cfg.recoil,
      eyeScale: s.eyeScale,
      eyeOffsetX: jitterX * 0.8,
      eyeOffsetY: s.eyeOffsetY,
      pupilX: s.pupilX,
      pupilY: s.pupilY,
      blink: this.blinkMs >= 0 ? clamp(this.blinkMs / (this.cfg.blinkDuration * 0.5), 0, 1) : 0,
      browLeft: s.browLeft,
      browRight: s.browRight,
      mouth: face.mouth,
      mouthOpen: s.mouthOpen,
      cheek: s.cheek,
      tongue: s.tongue,
      sweat: s.sweat,
      sparkle: s.sparkle,
      glow: s.glow,
      jitter: s.jitter,
      walk: swingPhase,
      stepLeft,
      stepRight,
      hemBounce,
      bagSwing,
      sway,
      left: this.armPose('left'),
      right: this.armPose('right'),
    };
    return this.pose;
  }

  get current(): CharacterPose {
    return this.pose;
  }

  private armPose(side: Side): ArmPose {
    const arm = this.arms[side];
    const dir = side === 'left' ? -1 : 1;

    if (arm.active) {
      const out = Math.max(30, this.cfg.slapDuration);
      const rec = Math.max(40, this.cfg.expressionDuration);
      if (arm.slapMs < out) {
        const t = clamp(arm.slapMs / out, 0, 1);
        const reach = easeOut(t) * 1.14;
        const pop = Math.sin(Math.PI * t);
        return {
          reach,
          raise: 0.12 + t * 0.22,
          spread: 0.45 + reach * 0.55,
          handScale: 1 + (this.cfg.impactHandScale - 1) * pop,
          handRot: dir * reach * 0.42,
          contact: arm.contact ? { ...arm.contact, blend: Math.max(0, 1 - t * 1.7) } : undefined,
        };
      }
      const k = Math.exp(-(arm.slapMs - out) / (rec * 0.5));
      return {
        reach: 1.14 * k,
        raise: 0.3 * k,
        spread: 0.4 * k,
        handScale: 1 + (this.cfg.impactHandScale - 1) * 0.3 * k,
        handRot: dir * 0.4 * k,
        contact: arm.contact ? { ...arm.contact, blend: 0.12 * k } : undefined,
      };
    }

    if (arm.anticip > 0.02) {
      const a = arm.anticip;
      return {
        reach: -0.2 * a,
        raise: 0.58 * a,
        spread: a * 0.55,
        handScale: 1 + 0.08 * a,
        handRot: -dir * 0.35 * a,
      };
    }

    const moodArms = this.moodArms();
    if (moodArms) return { ...moodArms, handRot: dir * 0.1 };
    return restArm();
  }

  private moodArms(): ArmPose | null {
    switch (this.mood) {
      case 'celebrate':
      case 'record':
        return { reach: 0.18, raise: 0.95, spread: 1, handScale: 1.1, handRot: 0 };
      case 'ecstatic':
        return { reach: 0.12, raise: 0.7, spread: 0.9, handScale: 1.06, handRot: 0 };
      case 'manic':
        return { reach: 0.42, raise: 0.45, spread: 1, handScale: 1.08, handRot: 0 };
      case 'exhausted':
        return { reach: -0.05, raise: -0.15, spread: 0.1, handScale: 1, handRot: 0 };
      case 'disgust':
        return { reach: 0.05, raise: 0.25, spread: 0.7, handScale: 1, handRot: 0 };
      default:
        return null;
    }
  }
}
