# Audio & art assets — BONK!

## Why there are no `.wav` files in this project

The product spec declares every sound effect as type **`synth`** (slap soft, slap
perfect, golden hit, cursed hit, combo up, UI tap). For `synth` assets the correct
implementation is programmatic synthesis with Tone.js on the Aippy audio context —
no file is generated, decoded or shipped. The single `music` asset is the real
looping track and is loaded from its CDN URL.

That means: no placeholder files, no silent buffers, no `OscillatorNode` created per
frame. Instruments are built once when the audio context unlocks and reused, with
per-event gain, cooldown, voice cap and pitch variance.

If you later replace a synth effect with a recorded file, here is how.

## Sound effects (synthesised)

Defined in `src/audio/manifest.ts` (`SFX_MANIFEST`) and played by
`src/audio/AudioManager.ts`.

| Id | Character | Used for |
| --- | --- | --- |
| `slapSoft` | soft noise slap + low thump | whiff / light tap |
| `slapHard` | heavier noise + body thump | normal hit |
| `slapPerfect` | sharp noise + high ping | perfect hit |
| `slapCritical` | big thump + bright FM stab | perfect hit at combo ≥ 10 |
| `comboUp` | two-note rise | every 5th combo |
| `comboBreak` | descending buzz | miss / whiff |
| `goldenHit` | three-note shimmer | golden prize |
| `cursedHit` | low buzz pair | cursed cube slapped |
| `objectMiss` | short sad buzz | object flew past |
| `countdown` | tick | last 5 seconds |
| `finalMeltdown` | alarm stab | meltdown starts |
| `scoreReveal` | arpeggio | results screen |
| `newRecord` | four-note flourish | new personal best |
| `uiTap` / `uiBack` / `uiRestart` | hollow clicks | UI |
| `characterReact` | squeak | reserved for character reactions |

Per-event metadata (`defaultGain`, `cooldown`, `maxVoices`, `pitchVariance`,
`category`) lives next to each id, so a sound can be retuned without touching
gameplay code.

## Music

- URL: the `music` asset from the spec, loaded through `useSound` (decoded once).
- Started **only** from a trusted `click` handler, looped, and stopped on results.
- Volume = `musicVolume × masterVolume`; `musicEnabled` and mute both silence it.
- If the browser refuses playback the game continues silently and retries on the
  next gesture.

## Haptics

`src/audio/haptics.ts` uses the verified Aippy device bridge (`vibrate`) with four
patterns scaled by `hapticIntensity`, and does nothing when `hapticsEnabled` is off
or the platform has no vibration motor.

## Art

Everything on screen is drawn procedurally with Canvas 2D:

- `src/art/CharacterDraw.ts` — the gremlin (bezier body, cel shading, face parts, elastic arms).
- `src/art/ObjectsDraw.ts` — the 12 objects.
- `src/art/Effects.ts` — particles, rings, floating text, flash, shake.
- `src/art/Renderer.ts` — backdrop (pre-rendered), ambient accents, draw order.
- `src/art/palette.ts` — every colour derived from the live config.

The single `image-bg` asset from the spec is used as the arena backdrop (cover fit,
with a veil + vignette on top). Character/prop sprites are intentionally **not**
used: both build prompts require an original procedurally drawn cast, and mixing
raster sprites with vector-drawn objects would break the art style.

### Swapping the backdrop

Replace the `IMAGE_MWMM` URL in `src/config/assets.json` (auto-generated from source
URLs) or drop a new URL into the `useGameImages` map in `src/ui/GameScreen.tsx`.
Any 2:3 portrait image works; it is drawn with cover semantics and darkened by the
backdrop gradient, so high-contrast images keep the objects readable.