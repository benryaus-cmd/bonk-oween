import { BOUNDS, type GameConfig } from '@/config/defaults';

export type ControlKind = 'number' | 'color' | 'boolean';

export type ControlGroup =
  | 'gameplay'
  | 'character'
  | 'physics'
  | 'effects'
  | 'interface'
  | 'audio'
  | 'art';

export interface ControlDef {
  key: keyof GameConfig;
  label: string;
  kind: ControlKind;
  group: ControlGroup;
  min: number;
  max: number;
  step: number;
  help: string;
}

const num = (
  key: keyof GameConfig,
  label: string,
  group: ControlGroup,
  help: string,
): ControlDef => {
  const b = BOUNDS[key] ?? [0, 1, 1];
  return { key, label, kind: 'number', group, help, min: b[0], max: b[1], step: b[2] };
};

const col = (key: keyof GameConfig, label: string, group: ControlGroup, help: string): ControlDef => ({
  key,
  label,
  kind: 'color',
  group,
  min: 0,
  max: 0,
  step: 0,
  help,
});

const bool = (key: keyof GameConfig, label: string, group: ControlGroup, help: string): ControlDef => ({
  key,
  label,
  kind: 'boolean',
  group,
  min: 0,
  max: 0,
  step: 0,
  help,
});

/** Live tuning panel — mirrors tweaksConfig.json, bounds come from defaults. */
export const CONTROLS: ControlDef[] = [
  num('roundDuration', 'Round seconds (length of one run)', 'gameplay', 'How long one run lasts.'),
  num('meltdownStartTime', 'Meltdown at (second the final frenzy starts)', 'gameplay', 'Second the final meltdown starts.'),
  num('initialSpawnInterval', 'Start gap (time between objects at the beginning)', 'gameplay', 'Seconds between objects at the start.'),
  num('minimumSpawnInterval', 'Fast gap (time between objects at full speed)', 'gameplay', 'Seconds between objects at full speed.'),
  num('spawnAcceleration', 'Speed ramp (how quickly the game speeds up)', 'gameplay', 'How sharply the round speeds up.'),
  num('travelDuration', 'Travel time (seconds an object takes to arrive)', 'gameplay', 'Seconds an object takes to arrive.'),
  num('minimumTravelDuration', 'Fast travel (approach time at full speed)', 'gameplay', 'Approach time at full speed.'),
  num('sameLaneCooldownMs', 'Lane gap (min gap between same-side impacts, ms)', 'gameplay', 'Minimum gap between same-side impacts.'),
  num('minimumReactionWindowMs', 'Reaction (minimum warning time before impact, ms)', 'gameplay', 'Minimum warning time before impact.'),
  num('maxIncomingTargets', 'In flight (objects allowed in the air at once)', 'gameplay', 'Objects allowed in the air at once.'),
  num('perfectWindowMs', 'Perfect ms (window that counts as a perfect slap)', 'gameplay', 'Perfect slap window.'),
  num('normalWindowMs', 'Hit window ms (window that still counts as a hit)', 'gameplay', 'Window that still counts as a hit.'),
  num('slapRecoveryMs', 'Arm recovery (arm return time after a slap, ms)', 'gameplay', 'Arm return time after a slap.'),
  num('goldenChance', 'Pumpkin rate (chance an object is a candy-stuffed pumpkin)', 'gameplay', 'Chance an object is a pumpkin that spills candy.'),
  num('cursedChance', 'Baby rate (chance an object is a baby you must not slap)', 'gameplay', 'Chance an object is the baby you must avoid slapping.'),
  num('goldenIntroductionTime', 'Pumpkins from (second pumpkins may appear)', 'gameplay', 'Second pumpkins may appear.'),
  num('cursedIntroductionTime', 'Babies from (second the baby may appear)', 'gameplay', 'Second the baby may appear.'),
  num('scorePerHit', 'Base score (points for one clean slap)', 'gameplay', 'Points for one clean slap.'),
  num('perfectMultiplier', 'Perfect x (score boost on perfect slaps)', 'gameplay', 'Score boost on perfect slaps.'),
  num('goldenMultiplier', 'Pumpkin x (score boost when smashing a pumpkin)', 'gameplay', 'Score boost when smashing a pumpkin.'),
  num('comboScoreScaling', 'Bag x per candy (extra multiplier per candy collected)', 'gameplay', 'Extra bag multiplier for each candy added to the bag.'),
  num('invalidTapPenalty', 'Bad slap cost (extra points lost when slapping the baby)', 'gameplay', 'Extra score lost when you accidentally slap the baby.'),

  num('characterScale', 'Character size (overall size of the ghost kid)', 'character', 'Overall size of the ghost character.'),
  num('characterYOffset', 'Height (vertical placement in the arena)', 'character', 'Vertical placement in the arena.'),
  num('idleBreathingSpeed', 'Breath speed (idle breathing rate)', 'character', 'Idle breathing rate.'),
  num('idleBreathingAmount', 'Breath amount (idle breathing depth)', 'character', 'Idle breathing depth.'),
  num('blinkFrequency', 'Blink rate (how often the ghost kid blinks)', 'character', 'How often the kid in the sheet blinks.'),
  num('blinkDuration', 'Blink ms (length of each blink)', 'character', 'Length of each blink.'),
  num('eyeFollowStrength', 'Eye tracking (how much the eyes follow objects)', 'character', 'How much the eyes follow objects.'),
  num('slapDuration', 'Slap out ms (time to full arm extension)', 'character', 'Time to full arm extension.'),
  num('anticipationDuration', 'Wind up ms (arm wind-up before impact)', 'character', 'Arm wind-up before impact.'),
  num('armStretch', 'Arm reach (how far hands stretch out)', 'character', 'How far hands stretch out.'),
  num('armCurve', 'Arm curve (elastic bend of the arms)', 'character', 'Elastic bend of the arms.'),
  num('impactHandScale', 'Hand pop (hand inflation on contact)', 'character', 'Hand inflation on contact.'),
  num('recoilAmount', 'Recoil (body kick-back after a slap)', 'character', 'Body kick-back after a slap.'),
  num('bodyRotation', 'Body tilt (lean and rotation amount)', 'character', 'Lean and rotation amount.'),
  num('squashAmount', 'Squash (impact squash of the body)', 'character', 'Impact squash of the body.'),
  num('stretchAmount', 'Stretch (vertical stretch on fast moves)', 'character', 'Vertical stretch on fast moves.'),
  num('expressionDuration', 'Face hold ms (how long a reaction face lasts)', 'character', 'How long a reaction face lasts.'),
  num('springStiffness', 'Spring (pose easing speed)', 'character', 'Pose easing speed.'),
  num('springDamping', 'Damping (how fast pose wobble settles)', 'character', 'How fast pose wobble settles.'),

  num('gravity', 'Gravity (pull on launched objects)', 'physics', 'Pull on launched objects.'),
  num('launchSpeed', 'Launch power (how hard objects fly away)', 'physics', 'How hard objects fly away.'),
  num('launchLift', 'Launch lift (upward part of the launch)', 'physics', 'Upward part of the launch.'),
  num('perfectLaunchMultiplier', 'Perfect fly (extra power on perfect slaps)', 'physics', 'Extra power on perfect slaps.'),
  num('goldenLaunchMultiplier', 'Gold fly (extra power on golden prizes)', 'physics', 'Extra power on golden prizes.'),
  num('spinSpeed', 'Spin (rotation speed of launched objects)', 'physics', 'Rotation speed of launched objects.'),
  num('spinRandomness', 'Spin randomness (variation between launches)', 'physics', 'Variation between launches.'),
  num('restitution', 'Bounce (bounciness of flying objects)', 'physics', 'Bounciness of flying objects.'),
  num('friction', 'Friction (surface friction)', 'physics', 'Surface friction.'),
  num('frictionAir', 'Air drag (air resistance)', 'physics', 'Air resistance.'),
  num('maxBodies', 'Body cap (max simultaneous flying objects)', 'physics', 'Max simultaneous flying objects.'),
  num('bodyLifetime', 'Body life ms (time before a body is recycled)', 'physics', 'Time before a body is recycled.'),
  bool('floorBounceEnabled', 'Floor bounce (bounce off the floor)', 'physics', 'Bounce off the floor.'),
  bool('wallBounceEnabled', 'Wall bounce (bounce off the sides)', 'physics', 'Bounce off the sides.'),

  num('particleCount', 'Normal sparks (particles per normal hit)', 'effects', 'Particles per normal hit.'),
  num('perfectParticleCount', 'Perfect sparks (particles per perfect hit)', 'effects', 'Particles per perfect hit.'),
  num('goldenParticleCount', 'Gold sparks (particles per golden hit)', 'effects', 'Particles per golden hit.'),
  num('particleLifetime', 'Fx life ms (base particle lifetime)', 'effects', 'Base particle lifetime.'),
  num('particleSpeed', 'Fx speed (base particle speed)', 'effects', 'Base particle speed.'),
  num('particleGravity', 'Fx gravity (pull on particles)', 'effects', 'Pull on particles.'),
  num('particleDrag', 'Fx drag (particle slowdown)', 'effects', 'Particle slowdown.'),
  num('particleSize', 'Fx size (global particle size)', 'effects', 'Global particle size.'),
  num('impactRingCount', 'Rings (shockwave rings per impact)', 'effects', 'Shockwave rings per impact.'),
  num('impactRingRadius', 'Ring size (starting ring radius)', 'effects', 'Starting ring radius.'),
  num('ringExpansionSpeed', 'Ring growth (ring expansion speed)', 'effects', 'Ring expansion speed.'),
  num('trailOpacity', 'Trails (motion trail strength)', 'effects', 'Motion trail strength.'),
  num('shakeStrength', 'Shake scale (global shake multiplier)', 'effects', 'Global shake multiplier.'),
  num('perfectShake', 'Perfect shake (shake on perfect slaps)', 'effects', 'Shake on perfect slaps.'),
  num('goldenShake', 'Gold shake (shake on golden prizes)', 'effects', 'Shake on golden prizes.'),
  num('shakeDecay', 'Shake decay (how fast shake settles)', 'effects', 'How fast shake settles.'),
  num('hitStopMs', 'Freeze ms (base impact pause)', 'effects', 'Base impact freeze.'),
  num('perfectHitStopMs', 'Perfect freeze (impact pause on perfect slaps)', 'effects', 'Freeze on perfect slaps.'),
  num('goldenHitStopMs', 'Gold freeze (impact pause on golden prizes)', 'effects', 'Freeze on golden prizes.'),
  num('flashOpacity', 'Flash power (screen flash strength)', 'effects', 'Screen flash strength.'),
  num('flashDuration', 'Flash ms (flash fade time)', 'effects', 'Flash fade time.'),
  num('backgroundPulseStrength', 'Bg pulse (background pulse strength)', 'effects', 'Background pulse strength.'),
  num('meltdownIntensity', 'Meltdown fx (meltdown visual intensity)', 'effects', 'Meltdown visual intensity.'),
  num('effectsQuality', 'Fx quality (scales particle counts)', 'effects', 'Scales particle counts.'),
  bool('reducedMotion', 'Calm mode (disable shake and heavy effects)', 'effects', 'Disable shake and heavy effects.'),

  num('hudScale', 'HUD scale (scale of the whole HUD)', 'interface', 'Scale of the whole HUD.'),
  num('scoreFontSize', 'Score px (score font size)', 'interface', 'Score font size.'),
  num('timerFontSize', 'Timer px (timer font size)', 'interface', 'Timer font size.'),
  num('comboFontSize', 'Candy px (candy and multiplier text size)', 'interface', 'Text size of the candy count and bag multiplier.'),
  num('floatingTextScale', 'Popups (floating number scale)', 'interface', 'Floating number scale.'),
  num('floatingTextDuration', 'Popup ms (floating number duration)', 'interface', 'Floating number duration.'),
  num('captionFrequency', 'Captions s (seconds between hype captions)', 'interface', 'Seconds between captions.'),
  num('captionDuration', 'Caption s (caption hold time)', 'interface', 'Caption hold time.'),
  num('resultAnimationSpeed', 'Results speed (results entrance speed)', 'interface', 'Results entrance speed.'),
  num('buttonScale', 'Button scale (main button size)', 'interface', 'Main button size.'),
  num('uiAnimationIntensity', 'UI motion (HUD punch intensity)', 'interface', 'HUD punch intensity.'),

  num('masterVolume', 'Master (overall volume)', 'audio', 'Overall volume.'),
  num('musicVolume', 'Music (music volume)', 'audio', 'Music volume.'),
  num('sfxVolume', 'Effects (sound effect volume)', 'audio', 'Sound effect volume.'),
  num('normalHitVolume', 'Hit volume (normal slap gain)', 'audio', 'Normal slap gain.'),
  num('perfectHitVolume', 'Perfect volume (perfect slap gain)', 'audio', 'Perfect slap gain.'),
  num('goldenHitVolume', 'Gold volume (golden chime gain)', 'audio', 'Golden chime gain.'),
  num('mistakeVolume', 'Miss volume (miss and mistake gain)', 'audio', 'Miss and mistake gain.'),
  num('comboVolume', 'Combo volume (combo tone gain)', 'audio', 'Combo tone gain.'),
  num('pitchVariation', 'Pitch spread (random pitch variation)', 'audio', 'Random pitch variation.'),
  num('maxAudioVoices', 'Voices (max overlapping sounds)', 'audio', 'Max overlapping sounds.'),
  bool('soundEnabled', 'Sound (all sound effects on or off)', 'audio', 'All sound effects on or off.'),
  bool('musicEnabled', 'Music on (looping track on or off)', 'audio', 'Looping track on or off.'),
  bool('hapticsEnabled', 'Vibration (vibrate on impacts)', 'audio', 'Vibrate on impacts.'),
  num('hapticIntensity', 'Buzz power (vibration strength)', 'audio', 'Vibration strength.'),

  col('backgroundColour', 'Backdrop (arena base colour)', 'art', 'Arena base colour.'),
  col('backgroundSecondary', 'Backdrop 2 (second backdrop colour)', 'art', 'Second backdrop colour.'),
  col('characterPrimary', 'Sheet colour (main colour of the ghost sheet)', 'art', 'Main colour of the bedsheet ghost costume.'),
  col('characterShadow', 'Body shade (cel shading colour)', 'art', 'Cel shading colour.'),
  col('characterOutline', 'Outline (ink colour of all outlines)', 'art', 'Ink colour of all outlines.'),
  col('accentColour', 'Accent (accent / UI highlight colour)', 'art', 'Accent / UI highlight colour.'),
  col('goldenAccent', 'Gold (golden prize colour)', 'art', 'Golden prize colour.'),
  col('cursedAccent', 'Warning (colour of the baby warning)', 'art', 'Do-not-slap warning colour.'),
  col('uiText', 'UI text (primary interface text colour)', 'art', 'Primary interface text colour.'),
  num('outlineWidth', 'Line width (outline thickness)', 'art', 'Outline thickness.'),
  num('shadowIntensity', 'Shading (cel shading strength)', 'art', 'Cel shading strength.'),
  num('backgroundAnimationSpeed', 'Street scroll (speed the street passes by)', 'art', 'Speed the Halloween street travels past the ghost.'),
];

export const GROUP_ORDER: ControlGroup[] = [
  'gameplay',
  'character',
  'physics',
  'effects',
  'interface',
  'audio',
  'art',
];

export const GROUP_LABELS: Record<ControlGroup, string> = {
  gameplay: 'Gameplay',
  character: 'Ghost',
  physics: 'Physics',
  effects: 'Effects',
  interface: 'Interface',
  audio: 'Audio',
  art: 'Art',
};

export function controlsForGroup(group: ControlGroup): ControlDef[] {
  return CONTROLS.filter((c) => c.group === group);
}