# QA — BONK! (Halloween ghost edition)

## What was actually executed

This working environment has **no installed dependencies and no build output**, so
`pnpm build`, `tsc` and a headless browser could not be run here. The table below
separates what is *statically verified by reading the code* from what still needs a
real device / preview pass.

| Check | Status |
| --- | --- |
| Source review of every gameplay / art / audio / UI module | Done |
| `tweakSchema` ↔ `defaults` ↔ `tweaksConfig.json` key parity | Done (unchanged key set) |
| Production build / typecheck / lint | Runs in the delivery pipeline after submission |
| Automated unit tests | **Not added** — no test runner in this template |
| Device / browser playtest | **Not performed in this environment** |

## Deterministic invariants (verified by reading the code paths)

1. **Hit windows nest.** `normalizeConfig` forces `normalWindowMs >= perfectWindowMs + 10`.
2. **One resolution per target.** `Target.resolved` is set before any side effect and `tap()`
   skips resolved targets, so double taps cannot double-score.
3. **Wrong side = whiff.** Candidate search filters by `t.side === side`; whiffs never score.
4. **Baby is the avoid-me object.** Letting it pass resolves it without a miss or penalty
   (`handleUnblocked` returns early for `category === 'baby'`). Slapping it applies the score
   penalty, empties `candyCount` (multiplier back to 1) and keeps the already-banked score.
   It is never launched as a physics body — only a poof + guilty reaction.
5. **Candy is the streak.** Only a baby hit empties the bag. Missed candy, egg/TP/pumpkin
   impacts add stains and feedback but never remove candy. Multiplier is defined once:
   `1 + min(candyCount, 20) * comboScoreScaling`.
6. **Mess is bounded and persistent.** Stains are capped at `MAX_STAINS` (6), stored on `Game`
   (not React), placed away from the face and hand zones, drawn clipped to the same moving
   sheet shape, and cleared only by `resetRound()` / `startRound()`.
7. **Round expiry.** `roundMs` accumulates active time only; pause returns before touching it.
8. **Hit-stop does not steal time.** `hitStop` scales simulation time only; the round clock
   always advances by the real delta.
9. **Ranked eligibility.** Latched at `startRound()` from `isRankedConfig(cfg)`; any non-default
   gameplay/art/scoring value during a run makes `runEligible` false permanently for that run.
   `reportScore` and the ranked PB write are gated on it; mute/music/haptics/calm-mode do not
   affect eligibility.
10. **Restart hygiene.** `resetRound()` clears targets, events, physics bodies, particles,
    rings, floaters, motion state, stats, stains and the bag, and re-seeds the spawn director.

## Rendering budget (Android WebView mindful)

- One rAF loop; HUD `setState` only on phase/score/candy/best/meltdown/record/second changes.
- Street art is baked once into four cached surfaces (static sky/ground + far houses band +
  near houses band + pavement band). Per frame only 2 blits per band with a wrap offset and a
  small cached palette key check — no gradient or house paths rebuilt in the loop.
- Walking (legs, hem bounce, sway, bag pendulum) comes from one phase value on the character
  pose; no extra per-frame allocation.
- Bag sweets are capped at 9 drawn items plus a fullness tint, so a huge bag never costs
  hundreds of arcs.
- Matter is used only for post-hit aftermath, fixed 16.667 ms steps with a 3-step cap, bodies
  capped by `maxBodies` (24) and lifetime.
- `reducedMotion` slows the street scroll and damps the bag swing.

## Known limitations

- Real-device audio unlock (Android WebView / iOS silent mode) relies on the Aippy audio SDK;
  only a device can confirm the first-gesture path.
- Vibration depends on the platform bridging `navigator.vibrate`.
- No "save image" export button: the results screen itself is composed to be screenshot-worthy.

## Manual test script (for a device pass)

1. READY: ghost kid walks in place, legs alternate, hem bounces, bag swings; hint text visible.
2. Tap once → round starts only (no whiff, no bad-slap sound).
3. Catch candy → arcs into the bag, `CANDY n` and `x1.xx` tick up beside the score.
4. Deflect egg / TP → Matter launch, TP ribbon trails; let one through → stain appears on the
   sheet and survives pause, scoring and the next hits.
5. Smash a pumpkin → 3 candy + gold burst; let one through → orange pulp stain.
6. Let the baby pass → "PHEW", no penalty. Slap it → "THAT'S A BABY, BRO", bag empties,
   banked score stays.
7. Meltdown at 40 s → manic face, faster spawned waves, street keeps scrolling.
8. After the round: results shows the same renderer with final stains and bag, tier, stats,
   PLAY AGAIN one tap away; replay starts clean (no stains, empty bag).
9. Settings: change a gameplay value → PRACTICE badge in HUD and results, no score submit.
   Reset all → next run eligible again.
10. Repeated replays: no drifting physics bodies, no duplicate loops, no stain carry-over.