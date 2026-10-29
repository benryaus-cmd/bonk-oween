# BONK! — Build Worklist

Legend: `[x]` implemented and statically verified (code reviewed + wired),
`[!]` implemented but needs a real device/renderer check, `[ ]` not done.

## 0. Foundation (Prompt 1) — preserved
- [x] React 19 + TypeScript + Vite, single React root, no iframes, no external game URLs
- [x] Canvas 2D world only (no WebGL / Three / Phaser / Pixi)
- [x] matter-js used **only** for the launched aftermath of a slap
- [x] gsap only for HUD / results / caption choreography
- [x] lucide-react only for mute / settings / replay icons
- [x] Phases READY → PLAYING → PAUSED → FINISHING → RESULTS with authoritative transitions
- [x] One rAF loop, game state outside React, throttled HUD snapshots
- [x] pointerdown input, `touch-action: none`, multi-touch tolerant, UI buttons stop propagation
- [x] Opens straight into READY with a live practice target; first touch can score it
- [x] Scripted target timing; hit windows from the active-round clock, never Matter collisions
- [x] 45 s active play, Final Meltdown in the last 5 s, results + replay
- [x] Cursed cube is a mistake, never a game over
- [x] Restart resets targets, bodies, particles, motion, timers

## 1. Gremlin rig (Prompt 2)
- [x] `CharacterPose` = pure data (bone-less pose struct, 21 animatable channels)
- [x] `CharacterMotion` = spring/reaction state machine, separate from art
- [x] `CharacterDraw` = pure drawing from local coordinates (bezier + ellipse passes)
- [x] Palette centralised in `art/palette.ts`, driven by the live config
- [x] Outline pass, cel-shade pass, belly patch, specular highlights
- [x] Independent eyes (iris + two highlights + lid), independent brows, 8 mouth styles
- [x] Cheek blush, tuft, feet, sweat drop, sparkle halo, aura glow
- [x] Elastic arms: tapered bezier with shoulder anchor, bow, overshoot, recoil, hand pop
- [x] Distinct states: idle breathing, blink, curious look, wind-up, slap L/R, satisfaction,
      ecstatic, golden celebration, disgust, embarrassment, cocky (high combo), manic
      (meltdown), exhausted finish, new-record celebration
- [x] Reaction priority ladder so a slap is never interrupted by idle flourishes
- [x] Eye tracking toward the nearest live object, dt-based easing, configurable springs

## 2. Objects
- [x] 12 unique procedural objects: duck, cone, tomato, avocado, rubber chicken, tiny TV,
      soda can, donut, inflatable fish, parcel, golden trophy, cursed cube
- [x] Each has silhouette, dark outline, 2–3 shading tones, highlight, idle motion
      (duck bob, cone sway, TV flicker, fish wiggle, fish/tomato squish, cursed pulse,
      golden sparkle)
- [x] Same art follows the Matter body after a hit (single draw path)
- [x] Spawner never repeats the same normal object twice in a row

## 3. Juice / feedback
- [x] Per-quality hit-stop (normal / perfect / golden) applied to simulation only —
      the round timer keeps real-time accounting
- [x] Particle system with 5 shapes, drag/gravity/spin, pooled caps (320 particles)
- [x] Expanding impact rings, motion trails, floating score, screen flash, background pulse
- [x] Camera shake offsets the world canvas only — HUD and tap zones never move
- [x] Combo milestones 3 / 5 / 10 / 20 / 30 emit single kinetic captions
- [x] Ambient captions at a configurable rate, one on screen at a time
- [x] Meltdown: manic face, red pulses, expanding rings, urgent timer, flash
- [x] FINISHING slow-motion transition into RESULTS
- [x] Reduced-motion path kills shake/flash and thins particles

## 4. Audio + haptics
- [x] Tone.js instruments created once on unlock (no gameplay-time node spam)
- [x] 17 synthesised SFX ids with per-event gain, cooldown, max voices, pitch variance
      (spec asset type `synth` — see docs/ASSETS.md for the rationale)
- [x] Music asset loaded through `useSound`, looped, started from a trusted `click`
- [x] Master / music / SFX / per-event volumes, sound + music toggles, mute persistence
- [x] Haptics via the verified `vibrate` device bridge with intensity + on/off, silent fallback
- [x] Audio failure never blocks gameplay (all players guarded)

## 5. UI
- [x] Compact HUD: score + PB top-left, countdown top-centre, mute/settings top-right
- [x] Combo pill near the character, tiered colour at 20+
- [x] Results card: tier title, score, best, max combo, hits/perfect/golden/missed, PLAY AGAIN
- [x] Tuning panel: 7 groups, search, 117 live controls, reset all
- [x] ResizeObserver sizing, DPR capped at 2, safe-area inset used once
- [!] Visual check on 360×640, 390×650, 390×844, 412×915 (needs a real renderer)

## 6. Tuning
- [x] 117 typed controls, single source of truth (`BOUNDS` → panel + normalisation)
- [x] Every control maps to real behaviour (grep-verified usage per key)
- [x] Cross-field validation (windows, travel, meltdown, special-object rates)
- [x] Versioned persistence with v1 → v2 migration, clamps on load
- [x] Safe-value clamping in `normalizeConfig` — bad storage can never break a run

## 7. Architecture safety
- [x] Deterministic hit detection from scripted impact times (seeded RNG for scheduling)
- [x] One Matter engine, fixed 16.667 ms substeps, max 3 catch-up steps, body cap + lifetime
- [x] Particle pool bounded, trail history capped at 4 points per body
- [x] No setState inside the animation loop; HUD syncs on discrete changes only
- [x] No object allocation per particle per frame; gradients cached
- [x] Visibility change pauses the round; settings pause; no time jump on resume
- [!] Repeated-replay leak check on device (loops/listeners reviewed by hand)

## PHASE 3 IDEAS (not built)
- Shareable score card
- Alternate arenas / season themes
- Object-specific reactions (duck squeak, TV static burst)
- Endless mode with escalating speed