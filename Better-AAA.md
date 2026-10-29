# BONK Oween — practical polish review

Review date: 29 October 2026. Baseline: Git HEAD `12bb1f3`.

## What was actually reviewed

I opened the supplied live preview, started a run, and tried a short sequence of left/right taps. It loaded, started, and visibly animated the character's hands. That preview is an older build: it shows a flat row of houses and many oval road markings, whereas HEAD contains the new perspective street. Its timing feel must not be treated as verification of the latest game. Remote browser clicks also cannot establish real phone input latency. I inspected the supplied Frankenstein screenshot and read the relevant committed game, renderer, street, character, and audio code with `git show HEAD:<path>`, because the working directory contains stale modifications. This is a focused polish review, not a completed Android device or audio listening test.

The strongest asset is the expressive, readable little character. The short rounds and two-side input are a good foundation for a replayable mobile game. The fastest route to a premium result is to make every catch feel truthful, make the world move coherently, and make failure amusing and legible. More systems, currencies, and effects would currently dilute that work.

## Priority 0 — fix the things players will distrust

### 1. Make the ring, hand contact, and score describe the same instant

HEAD awards a perfect inside ±55 ms and a normal hit inside ±140 ms. The renderer makes the ring gold when `closeness > 0.78`, using `normalWindowMs + 120` as its span. At defaults this happens within roughly ±57 ms, almost matching perfect, but it stops matching when settings change. The cue also breathes with a separate urgency wave. Players should not have to reconcile those signals.

- Derive cue states directly from the same perfect/normal windows used by `Game.tap()`. Use a stable thin approach ring, a clearly active normal state, and a gold perfect state. Keep any decorative pulse subordinate to those states.
- Use one shared contact geometry for object trajectory endpoints, hand reach, and impact effects. A successful hit should visibly meet the object at its current position, including early and late normal hits; do not resolve an invisible hit at a distant fixed hand location.
- Preserve movement through impact. HEAD already avoids freezing targets at the endpoint; retain that improvement.
- Verify candy, egg, TP roll, pumpkin, and baby at their actual visible sizes. A circular ring should surround the main object body; a trailing TP tail should not enlarge the timing cue into an ambiguous target.
- Keep input immediate on pointer-down. Measure phone touch-to-first-visible-response with screen capture; do not infer it from a desktop browser.

**Acceptance:** replay a deterministic encounter at early normal, perfect, and late normal times on both sides. The awarded result, ring state, object position, and palm contact agree in slow motion. Test at 30, 60, and 120 Hz and after a frame hitch. No successful hit appears to pass through the palm.

### 2. Move the bag strap onto the shoulder and chest

The supplied screenshot clearly shows the strap crossing Frankenstein's face. HEAD's front strap begins at `(-26, -80)` and is painted after the costume, so the anchor and draw order can put it over facial features.

- Give each costume an explicit shoulder anchor and chest route; do not share a head-level anchor merely because their canvases have the same origin.
- Draw the rear strap behind the body, the visible diagonal section across the chest, and the pouch in front. Keep the buckle below the chin.
- Attach the lower end to the pouch rim as the bag swings and grows. A small eased swing is enough; avoid a new physics body.
- Check idle, wind-up, slap, lean, squash, results portrait, empty bag, and full bag for all three costumes.

**Acceptance:** no strap or buckle crosses an eye, mouth, chin, or name label; the bag looks supported in every pose.

### 3. Give the street one coherent travel direction

HEAD advances house depth toward the foreground using positive phase. The user's requested motion is the opposite. Reverse the house flow deliberately and make nearby environmental elements support that camera interpretation. Avoid reversing only one layer while pedestrians and curb marks continue to imply conflicting travel.

Pedestrians currently exist only inside `depth > 0.12 && depth < 0.59` and share a house-loop index. That guarantees a sudden disappearance in the middle distance.

- Track a handful of pedestrian instances independently from house visibility. Keep each visible along its path until it leaves the view or is naturally occluded.
- Use stable identities, costumes, and walking phase for each instance; recycle only beyond the visible boundary.
- Fade at the far horizon or beyond the near edge, not midway through a sidewalk. Depth-sort pedestrians and houses where they overlap.
- Retain cached house/background rendering. Four to six small pedestrians with simple leg cycles are sufficient.

**Acceptance:** watch a full round without tapping. Houses flow in the requested direction; people never pop out halfway down the street; loop resets are offscreen; sidewalks remain quieter than gameplay objects.

## Priority 1 — turn feedback into a satisfying little performance

### 4. Make toilet paper behave like paper

Use a short ribbon made from approximately 8–12 points with a fixed root, damped follow motion, and a gently oscillating free tip. Draw it as a tapered strip with a light crease or two. The roll rotates; the ribbon trails its velocity. On a miss, briefly drape a short strip over a shoulder or torso, then let it settle. On a deflection, the ribbon should follow the outgoing roll rather than point along its old flight path.

Keep this cosmetic: no collision on the ribbon, no expensive cloth solver, no dozens of persistent strips. Cap simultaneous strips and remove them deterministically. A believable silhouette matters more than physical accuracy.

### 5. Separate the sounds by meaning

The code already has a substantial SFX manifest and separate incoming-baby/baby-hit recordings. Add distinctions to the existing event pipeline instead of layering everything on every hit.

| Event | Suggested sound | Mix rule |
| --- | --- | --- |
| Candy caught | Soft palm pop plus tiny bag rattle | Short; small pitch variation |
| Perfect catch | Sharper transient plus bright two-note accent | Clearly distinct, not substantially louder |
| Egg deflected / egg missed | Hollow tick / wet splat | Different outcomes must sound different |
| TP deflected / TP missed | Papery flick / soft unroll | Avoid another generic slap |
| Pumpkin | Low, rounded crack and brief sparkle | Reserve the strongest impact for this reward |
| Baby approaching | Existing warning | Prioritize it over jokes and combo accents |
| Baby mistake | Existing reaction plus dropped-candy scatter | Avoid a long pile-up of overlapping alarms |
| Bag growing / spilling | Tiny rustle / scatter | Trigger on milestones or actual spill only |

Use voice limits, cooldowns, and modest music ducking for key warnings. Stop or suspend audio when backgrounded. Unlock audio on the start gesture and resume cleanly. Listen on a cheap phone speaker and headphones at low volume; code inspection alone cannot validate the mix.

### 6. Load honestly and start cleanly

Show a small character/bag animation with actual readiness progress for essential assets. Do not simulate a long loading bar. Decode important sound files before the first encounter when possible; allow a silent fallback if audio fails. Keep the first start gesture responsible for unlocking audio without eating a scored action.

HEAD starts from an already moving READY scene and shifts existing target times. That is attractive as an attract mode, but can begin a run with an object already close to impact. Start the first scored encounter with a guaranteed reaction interval, or explicitly transition to a fresh small opening sequence. The costume should not unexpectedly change between the ready character and the first action unless that change is presented intentionally.

**Acceptance:** cold start, cached start, slow asset load, and failed audio all lead to a playable game. The first real target gives a fair reaction window. No blank screen, stuck loader, or loud delayed sound burst.

### 7. Teach the rule through three quick encounters

The live preview's small all-caps instruction line is easy to overlook. For a first run, present one clear candy catch, one junk deflection, and one baby to leave alone. Use brief prompts beside the relevant lane and remove them after success. Subsequent runs should start quickly. Keep left/right affordances near thumb areas without covering targets.

Use a visual baby warning as well as audio, and distinguish it by shape/icon as well as color. “Candy: tap. Junk: tap. Baby: wait.” is easier to remember than a sentence players must read during motion.

## Priority 2 — polish without making the game heavier

- **Pacing:** use readable phrases of encounters, with brief breathing room after a difficult crossing or big reward. The final meltdown can accelerate and intensify, but must preserve reaction time and target separation. Do not fill every gap with another effect.
- **Failure:** keep the character's reaction, a short label, and one unmistakable consequence. Baby mistakes already empty the bag; ensure the HUD, pouch contents, spill, and sound all change together. Avoid hiding the next target with a long caption.
- **Results:** make score, personal-best comparison, and one useful stat readable immediately. Keep Replay reachable without waiting for decorative animation. Give a short reason to improve, such as perfect catches, without adding a mission system yet.
- **Accessibility:** reduced motion should reduce camera shake, flashes, and disruptive pulses, not only background speed. Keep target motion and timing legible. Maintain independent sound/music controls and usable contrast at low screen brightness.
- **Production UI:** move art/difficulty tuning into a developer surface. A consumer settings panel should emphasize sound, music, haptics, and motion. Preserve the existing distinction between modified practice runs and ranked runs.
- **Layout:** verify narrow portrait screens, tall phones, cutouts, and landscape explicitly. The legacy desktop preview leaves a large empty sky and tiny instructional text; use a deliberate portrait playfield or a separately composed landscape layout.

## Performance and release checks

These are proposed product-quality targets, not claims that the game currently passes them or a statement of current Play Store policy.

1. Aim for stable 60 fps on a representative midrange Android phone; keep the main frame work within roughly 16.7 ms and investigate long frames during pumpkin bursts, bag spills, and consecutive hits. A stable lower-quality mode is preferable to irregular pacing.
2. Keep the existing cached street approach and bounded effects. Cap particles, flying items, ribbons, and audio voices; avoid per-frame DOM state updates and repeated asset decoding. Measure before introducing object pools or a renderer rewrite.
3. Run at least ten consecutive replays and a ten-minute session. Check memory growth, thermal slowdown, doubled audio, accumulated listeners, and degraded frame pacing.
4. Test Android background/resume, interruption, mute persistence, offline launch after installation, connection loss during score submission, and replay after a failed score request. A leaderboard failure must not block local results or Replay.
5. Check visible input under safe-area insets and system gesture regions. Avoid accidental page scrolling, zooming, text selection, or duplicate touch/click hits.
6. Before store submission, separately verify the actual Android package, current platform requirements, asset/audio rights, privacy disclosures, and content-rating answers against the final shipped build. A browser preview cannot certify these.

## Recommended order

First ship contact/ring consistency, shoulder strap, street direction, and persistent pedestrians. Then add the paper ribbon, differentiated audio, truthful loader, and fair first encounter. Finally do pacing, results, accessibility, and device profiling. Keep the two-side, short-round game intact throughout. The premium impression will come from consistency and finish, not a larger feature list.

## Implementation note — this pass

The requested priority fixes were implemented after this review: reverse and depth-sort the street, keep more walking pedestrians on both sidewalks, route the strap below the face, match hit rings to scoring windows, let the palm meet the visible item, anchor stains to the actual miss with face coverage, simulate a bounded TP strip, add the recorded audio layers and two music modes, and show a real asset loader before the attract scene. The ready scene now demonstrates taps without scoring, while the scored run starts with a fresh reaction window. These changes still need a real handset play and audio mix review; the older Aippy preview cannot verify the new build.
