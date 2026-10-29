import { aippyTweaks } from '@aippy/runtime/tweaks';
import tweaksConfig from '@/config/tweaksConfig.json';
import type { GameConfig } from '@/config/defaults';

const tweaks = aippyTweaks(tweaksConfig);

export type TweakValues = Partial<GameConfig>;

/**
 * Every editor-facing tweak lives here as one boolean/number/colour value.
 * Hooks are called unconditionally in a fixed order — never inside loops.
 */
export function useTweakValues(): TweakValues {
  const roundDuration = Number(tweaks.roundDuration.useState());
  const meltdownStartTime = Number(tweaks.meltdownStartTime.useState());
  const initialSpawnInterval = Number(tweaks.initialSpawnInterval.useState());
  const minimumSpawnInterval = Number(tweaks.minimumSpawnInterval.useState());
  const spawnAcceleration = Number(tweaks.spawnAcceleration.useState());
  const travelDuration = Number(tweaks.travelDuration.useState());
  const minimumTravelDuration = Number(tweaks.minimumTravelDuration.useState());
  const sameLaneCooldownMs = Number(tweaks.sameLaneCooldownMs.useState());
  const minimumReactionWindowMs = Number(tweaks.minimumReactionWindowMs.useState());
  const maxIncomingTargets = Number(tweaks.maxIncomingTargets.useState());
  const perfectWindowMs = Number(tweaks.perfectWindowMs.useState());
  const normalWindowMs = Number(tweaks.normalWindowMs.useState());
  const slapRecoveryMs = Number(tweaks.slapRecoveryMs.useState());
  const goldenChance = Number(tweaks.goldenChance.useState());
  const cursedChance = Number(tweaks.cursedChance.useState());
  const goldenIntroductionTime = Number(tweaks.goldenIntroductionTime.useState());
  const cursedIntroductionTime = Number(tweaks.cursedIntroductionTime.useState());
  const scorePerHit = Number(tweaks.scorePerHit.useState());
  const perfectMultiplier = Number(tweaks.perfectMultiplier.useState());
  const goldenMultiplier = Number(tweaks.goldenMultiplier.useState());
  const comboScoreScaling = Number(tweaks.comboScoreScaling.useState());
  const invalidTapPenalty = Number(tweaks.invalidTapPenalty.useState());

  const characterScale = Number(tweaks.characterScale.useState());
  const characterYOffset = Number(tweaks.characterYOffset.useState());
  const idleBreathingSpeed = Number(tweaks.idleBreathingSpeed.useState());
  const idleBreathingAmount = Number(tweaks.idleBreathingAmount.useState());
  const blinkFrequency = Number(tweaks.blinkFrequency.useState());
  const blinkDuration = Number(tweaks.blinkDuration.useState());
  const eyeFollowStrength = Number(tweaks.eyeFollowStrength.useState());
  const slapDuration = Number(tweaks.slapDuration.useState());
  const anticipationDuration = Number(tweaks.anticipationDuration.useState());
  const armStretch = Number(tweaks.armStretch.useState());
  const armCurve = Number(tweaks.armCurve.useState());
  const impactHandScale = Number(tweaks.impactHandScale.useState());
  const recoilAmount = Number(tweaks.recoilAmount.useState());
  const bodyRotation = Number(tweaks.bodyRotation.useState());
  const squashAmount = Number(tweaks.squashAmount.useState());
  const stretchAmount = Number(tweaks.stretchAmount.useState());
  const expressionDuration = Number(tweaks.expressionDuration.useState());
  const springStiffness = Number(tweaks.springStiffness.useState());
  const springDamping = Number(tweaks.springDamping.useState());

  const gravity = Number(tweaks.gravity.useState());
  const launchSpeed = Number(tweaks.launchSpeed.useState());
  const launchLift = Number(tweaks.launchLift.useState());
  const perfectLaunchMultiplier = Number(tweaks.perfectLaunchMultiplier.useState());
  const goldenLaunchMultiplier = Number(tweaks.goldenLaunchMultiplier.useState());
  const spinSpeed = Number(tweaks.spinSpeed.useState());
  const spinRandomness = Number(tweaks.spinRandomness.useState());
  const restitution = Number(tweaks.restitution.useState());
  const friction = Number(tweaks.friction.useState());
  const frictionAir = Number(tweaks.frictionAir.useState());
  const maxBodies = Number(tweaks.maxBodies.useState());
  const bodyLifetime = Number(tweaks.bodyLifetime.useState());
  const floorBounceEnabled = Boolean(tweaks.floorBounceEnabled.useState());
  const wallBounceEnabled = Boolean(tweaks.wallBounceEnabled.useState());

  const particleCount = Number(tweaks.particleCount.useState());
  const perfectParticleCount = Number(tweaks.perfectParticleCount.useState());
  const goldenParticleCount = Number(tweaks.goldenParticleCount.useState());
  const particleLifetime = Number(tweaks.particleLifetime.useState());
  const particleSpeed = Number(tweaks.particleSpeed.useState());
  const particleGravity = Number(tweaks.particleGravity.useState());
  const particleDrag = Number(tweaks.particleDrag.useState());
  const particleSize = Number(tweaks.particleSize.useState());
  const impactRingCount = Number(tweaks.impactRingCount.useState());
  const impactRingRadius = Number(tweaks.impactRingRadius.useState());
  const ringExpansionSpeed = Number(tweaks.ringExpansionSpeed.useState());
  const trailOpacity = Number(tweaks.trailOpacity.useState());
  const shakeStrength = Number(tweaks.shakeStrength.useState());
  const perfectShake = Number(tweaks.perfectShake.useState());
  const goldenShake = Number(tweaks.goldenShake.useState());
  const shakeDecay = Number(tweaks.shakeDecay.useState());
  const hitStopMs = Number(tweaks.hitStopMs.useState());
  const perfectHitStopMs = Number(tweaks.perfectHitStopMs.useState());
  const goldenHitStopMs = Number(tweaks.goldenHitStopMs.useState());
  const flashOpacity = Number(tweaks.flashOpacity.useState());
  const flashDuration = Number(tweaks.flashDuration.useState());
  const backgroundPulseStrength = Number(tweaks.backgroundPulseStrength.useState());
  const meltdownIntensity = Number(tweaks.meltdownIntensity.useState());
  const effectsQuality = Number(tweaks.effectsQuality.useState());
  const reducedMotion = Boolean(tweaks.reducedMotion.useState());

  const hudScale = Number(tweaks.hudScale.useState());
  const scoreFontSize = Number(tweaks.scoreFontSize.useState());
  const timerFontSize = Number(tweaks.timerFontSize.useState());
  const comboFontSize = Number(tweaks.comboFontSize.useState());
  const floatingTextScale = Number(tweaks.floatingTextScale.useState());
  const floatingTextDuration = Number(tweaks.floatingTextDuration.useState());
  const captionFrequency = Number(tweaks.captionFrequency.useState());
  const captionDuration = Number(tweaks.captionDuration.useState());
  const resultAnimationSpeed = Number(tweaks.resultAnimationSpeed.useState());
  const buttonScale = Number(tweaks.buttonScale.useState());
  const uiAnimationIntensity = Number(tweaks.uiAnimationIntensity.useState());

  const masterVolume = Number(tweaks.masterVolume.useState());
  const musicVolume = Number(tweaks.musicVolume.useState());
  const sfxVolume = Number(tweaks.sfxVolume.useState());
  const normalHitVolume = Number(tweaks.normalHitVolume.useState());
  const perfectHitVolume = Number(tweaks.perfectHitVolume.useState());
  const goldenHitVolume = Number(tweaks.goldenHitVolume.useState());
  const mistakeVolume = Number(tweaks.mistakeVolume.useState());
  const comboVolume = Number(tweaks.comboVolume.useState());
  const pitchVariation = Number(tweaks.pitchVariation.useState());
  const maxAudioVoices = Number(tweaks.maxAudioVoices.useState());
  const soundEnabled = Boolean(tweaks.soundEnabled.useState());
  const musicEnabled = Boolean(tweaks.musicEnabled.useState());
  const hapticsEnabled = Boolean(tweaks.hapticsEnabled.useState());
  const hapticIntensity = Number(tweaks.hapticIntensity.useState());

  const backgroundColour = String(tweaks.backgroundColour.useState());
  const backgroundSecondary = String(tweaks.backgroundSecondary.useState());
  const characterPrimary = String(tweaks.characterPrimary.useState());
  const characterShadow = String(tweaks.characterShadow.useState());
  const characterOutline = String(tweaks.characterOutline.useState());
  const accentColour = String(tweaks.accentColour.useState());
  const goldenAccent = String(tweaks.goldenAccent.useState());
  const cursedAccent = String(tweaks.cursedAccent.useState());
  const uiText = String(tweaks.uiText.useState());
  const outlineWidth = Number(tweaks.outlineWidth.useState());
  const shadowIntensity = Number(tweaks.shadowIntensity.useState());
  const backgroundAnimationSpeed = Number(tweaks.backgroundAnimationSpeed.useState());

  return {
    roundDuration, meltdownStartTime, initialSpawnInterval, minimumSpawnInterval,
    spawnAcceleration, travelDuration, minimumTravelDuration, sameLaneCooldownMs,
    minimumReactionWindowMs, maxIncomingTargets, perfectWindowMs, normalWindowMs,
    slapRecoveryMs, goldenChance, cursedChance, goldenIntroductionTime,
    cursedIntroductionTime, scorePerHit, perfectMultiplier, goldenMultiplier,
    comboScoreScaling, invalidTapPenalty,
    characterScale, characterYOffset, idleBreathingSpeed, idleBreathingAmount,
    blinkFrequency, blinkDuration, eyeFollowStrength, slapDuration,
    anticipationDuration, armStretch, armCurve, impactHandScale, recoilAmount,
    bodyRotation, squashAmount, stretchAmount, expressionDuration,
    springStiffness, springDamping,
    gravity, launchSpeed, launchLift, perfectLaunchMultiplier, goldenLaunchMultiplier,
    spinSpeed, spinRandomness, restitution, friction, frictionAir, maxBodies,
    bodyLifetime, floorBounceEnabled, wallBounceEnabled,
    particleCount, perfectParticleCount, goldenParticleCount, particleLifetime,
    particleSpeed, particleGravity, particleDrag, particleSize, impactRingCount,
    impactRingRadius, ringExpansionSpeed, trailOpacity, shakeStrength, perfectShake,
    goldenShake, shakeDecay, hitStopMs, perfectHitStopMs, goldenHitStopMs,
    flashOpacity, flashDuration, backgroundPulseStrength, meltdownIntensity,
    effectsQuality, reducedMotion,
    hudScale, scoreFontSize, timerFontSize, comboFontSize, floatingTextScale,
    floatingTextDuration, captionFrequency, captionDuration, resultAnimationSpeed,
    buttonScale, uiAnimationIntensity,
    masterVolume, musicVolume, sfxVolume, normalHitVolume, perfectHitVolume,
    goldenHitVolume, mistakeVolume, comboVolume, pitchVariation, maxAudioVoices,
    soundEnabled, musicEnabled, hapticsEnabled, hapticIntensity,
    backgroundColour, backgroundSecondary, characterPrimary, characterShadow,
    characterOutline, accentColour, goldenAccent, cursedAccent, uiText,
    outlineWidth, shadowIntensity, backgroundAnimationSpeed,
  };
}