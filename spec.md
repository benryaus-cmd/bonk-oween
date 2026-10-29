# Project Name

BONK! (Halloween Edition)

## Concept

A cheeky, fast-paced arcade game where a kid in a rubbish bedsheet ghost costume walks down a Halloween street. Players tap to collect candy into a swinging trick-or-treat bag for multipliers or swat away thrown junk, all while avoiding the cursed baby. It is a high-energy, 45-second "brainrot" challenge focused on rhythm, precision, and satisfying physical feedback.

## Gameplay

The player controls a central ghost character walking down a street. Objects fly toward the character from either the left or right side. The player must tap the corresponding side of the screen to interact.
- **Candy**: Collect to fill the trick-or-treat bag. Each piece increases the score multiplier.
- **Thrown Junk (Eggs, TP)**: Deflect away to keep the ghost clean. If they hit, the ghost gets stained, but the candy streak remains intact.
- **Pumpkin (Jack-o'-lantern)**: A rare, high-value target that spills multiple candies into the bag if hit. If missed, it leaves a messy orange stain.
- **Cursed Baby**: Must be avoided. Slapping the baby causes the ghost to drop all collected candy, resetting the multiplier. Letting it pass safely is a successful dodge.
- **Goal**: Maximize score within a 45-second session.
- **Ranked vs. Practice**: Any modification to gameplay/difficulty tweaks marks the run as "Practice." Only runs played with default settings are eligible for ranked leaderboard submission. Practice runs are clearly marked in the HUD and results.
- **Developer Utility**: A hidden, password-protected file viewer and ZIP exporter for project inspection, accessible via a secret tap sequence on the Settings title.

## Visual & Audio

- **Theme**: Playful, chaotic, and vibrant Halloween arcade aesthetic.
- **Art Style**: Vector-like, clean-lined 2D graphics. The ghost is a kid in a bedsheet with dark-violet outlines.
    - **Palette**: Ghost White (#F8F8FF), Pumpkin Orange (#FF7518), Candy Purple (#8A2BE2), Midnight Navy (#191970), and Electric Yellow (#FFD700).
    - **Lighting**: Soft, clean highlights and subtle shadows to give objects depth.
- **Layout**: Portrait orientation. The ghost is centered. HUD (score, timer, settings) is minimal and positioned at the top.
- **Key Visuals**:
    - **Ghost**: Procedurally drawn with bezier curves; expressive eyes and overshooting, elastic arms. The ghost accumulates stains (eggs, TP, pumpkin) throughout the run.
    - **Objects**: Wrapped sweets, eggs, toilet rolls, pumpkins, and the cursed baby.
    - **Effects**: Squash/stretch on impact, directional sparks, screen shake, and persistent stains on the ghost sheet.
- **Audio Mood**: Punchy, tactile, and rhythmic. Sounds are crisp and satisfying (slaps, pops, chimes, splats).

## Feedback & Juice

- **Interaction**: Immediate visual feedback on tap (arm extension/recoil).
- **Success/Failure**: Distinct sound effects and visual flashes for candy collection vs. junk deflection.
- **Juice**: Screen shake on heavy hits, floating score numbers, and particle bursts. GSAP-animated UI elements for score punches and results screen entrance.

## Leaderboard

Enabled: Yes.
Reason: To track and compare high scores across sessions.
Metric: Total score achieved in 45 seconds (Ranked runs only).
Order: DESC (highest score first).