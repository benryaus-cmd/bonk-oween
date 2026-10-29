# End-of-run score

The HUD keeps the existing live street score, including the bag multiplier and the immediate baby-hit penalty. The results screen then animates an **additional** audit:

The default bag multiplier adds `0.096` per candy (20% more than the previous `0.08`), capped at 20 candy for score scaling. The lower playfield badge mirrors the current bag count and multiplier.

| Row | Default points |
| --- | ---: |
| Candy still in the bag | +5 each |
| Perfect hands | +4 each |
| Pumpkin souvenirs | +12 each |
| Laundry bill (visible marks) | −4 each |
| Baby incident fine | −15 each |

These values scale with `scorePerHit` in modified practice settings. The total cannot fall below zero. The final total, after all five rows, is the personal-best value. The score-send placeholder (and eligible ranked report) fires once when the visible tally finishes. Replay fast-forwards any remaining rows and sends that same final total once before starting a new run.

Exactly one sticker is selected by the strongest qualifying run stat (relative to each award's threshold): Handcuffs for 2 baby hits, Sweet Tooth for 8 candy retained, Golden Hands for 12 perfects, Pumpkin Menace for 3 pumpkins, Laundry Crime for 5 visible marks, or Clean Getaway for 14 successful clearances with no stains or baby hits. The fallback is Street Legend. A sticker reveals its reason when tapped on the result screen; earned stickers persist locally and appear in colour on the ready screen. Stickers are comic labels only; they add no points.
