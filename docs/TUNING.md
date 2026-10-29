# Tuning guide — BONK!

Every control exists twice:

1. **Editor tweaks** — `src/config/tweaksConfig.json` (117 keys, surfaced by the Aippy editor).
2. **In-game panel** — Settings → *Tuning*, same 117 keys grouped in 7 tabs with search.

Both feed one typed object (`GameConfig`), which is clamped by
`normalizeConfig()` before the game ever sees it. Slider bounds live only in
`BOUNDS` (`src/config/defaults.ts`), so the panel and validation can never drift.

## Difficulty

| Control | Effect |
| --- | --- |
| `roundDuration` | Length of one run in seconds (default 45). |
| `meltdownStartTime` | When the final meltdown kicks in. Clamped to at least 2 s before the end. |
| `initialSpawnInterval` / `minimumSpawnInterval` | Spawn gap at the start and at full speed. |
| `spawnAcceleration` | Curve exponent between the two gaps (1 = linear, >1 = fast ramp late). |
| `travelDuration` / `minimumTravelDuration` | Approach time, interpolated across the round. |
| `sameLaneCooldownMs` | Minimum gap between two impacts in the same lane — the fairness guard. |
| `minimumReactionWindowMs` | An object must be visible at least this long, otherwise it is skipped. |
| `maxIncomingTargets` | Hard cap on objects in flight. |
| `perfectWindowMs` / `normalWindowMs` | Timing windows (perfect always nests inside normal). |
| `goldenChance` / `goldenIntroductionTime` | Golden prize rate and the second they may appear. |
| `cursedChance` / `cursedIntroductionTime` | Cursed cube rate and the second they may appear. |

Raising `cursedChance` high while lowering `sameLaneCooldownMs` is the fastest way to
make the game unfair — the reaction window is the safety net for that.

## Scoring

`scorePerHit` × (perfect ? `perfectMultiplier` : 1) × (golden ? `goldenMultiplier` : 1) ×
(1 + min(combo, 30) × `comboScoreScaling`). Cursed slaps subtract `scorePerHit × 2`;
`invalidTapPenalty` sets how many combo hits a whiff removes.

## Character feel

`slapDuration` (extension), `expressionDuration` (recovery), `armStretch`, `armCurve`,
`impactHandScale`, `recoilAmount`, `squashAmount`, `stretchAmount`, `springStiffness`
and `springDamping` control the elastic arm. Lower `springStiffness` for a lazier
gremlin, raise `springDamping` for a snappier settle. `anticipationDuration` is the
wind-up window before an incoming object.

## Impact / graphics

Each hit feeds `particleCount` / `perfectParticleCount` / `goldenParticleCount`,
`particleLifetime`, `particleSpeed`, `particleGravity`, `particleDrag`, `particleSize`,
`impactRingCount`, `impactRingRadius`, `ringExpansionSpeed`, `trailOpacity`,
`normalShake`-equivalents (`shakeStrength`, `perfectShake`, `goldenShake`), `shakeDecay`,
`hitStopMs`, `perfectHitStopMs`, `goldenHitStopMs`, `flashOpacity`, `flashDuration`,
`backgroundPulseStrength`, `meltdownIntensity`.

## Performance

- `effectsQuality` (0.2–1.5) scales every particle count — drop it to 0.5 on weak devices.
- `maxBodies` caps Matter bodies; `bodyLifetime` recycles them.
- `trailOpacity = 0` removes the per-body ghost passes entirely.
- `reducedMotion` disables shake and flash and thins particles to 35%.
- `backgroundAnimationSpeed = 0` stops the ambient accents.
- `hudScale`, font sizes and `buttonScale` are pure UI cost — safe to push.

## Art direction

`backgroundColour`, `backgroundSecondary`, `characterPrimary`, `characterShadow`,
`characterOutline`, `accentColour`, `goldenAccent`, `cursedAccent`, `uiText`,
`outlineWidth`, `shadowIntensity`. Changing `characterPrimary` also rebuilds the body
gradient and every derived tint (light, shadow, accent glow).