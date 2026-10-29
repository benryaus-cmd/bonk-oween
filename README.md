# BONK! Oween

A Halloween arcade game: a costumed kid walks up the street collecting candy, deflecting thrown junk, and leaving babies alone. The candy bag builds the score multiplier; punching a baby spills it.

## Run locally

Requires Node 22.13 or newer. Run `npm install`, `npm run dev`, then `npm run build` for a production bundle.

## Structure

- `src/game/Game.ts`: round, scoring, collisions, ranked best.
- `src/game/SpawnDirector.ts`: incoming items and baby spacing.
- `src/art/Renderer.ts` and `StreetDraw.ts`: perspective street.
- `src/art/CharacterDraw.ts` and `CostumeDraw.ts`: kid, outfits, bag, stains.
- `src/ui/GameScreen.tsx`: input, render, sound, results, score reporting.
- `src/config/assets.json`: Aippy asset URLs including the two baby clips.

Default settings permit ranked scores. A tweak marks the active run as practice; reset defaults and start another run to restore eligibility. Every completed run also fires the score-send placeholder for Aippy integration.
