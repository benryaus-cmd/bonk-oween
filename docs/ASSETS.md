# BONK Oween assets and audio

The Aippy asset list is `src/config/assets.json`. It contains the two looped music tracks and five recorded cues used by the game:

| Event | Asset key | Source |
| --- | --- | --- |
| Ready / attract screen only | `AUDIO_MENU_BGM` | 865677_71257-lq.mp3 |
| Playing only | `AUDIO_BGM` | 865678_71257-lq.mp3 |
| Baby incoming | `AUDIO_BABY_INCOMING` | 461792_9676877-lq.mp3 |
| Baby punched, first layer | `AUDIO_BABY_HIT` | 113160_1927446-lq.mp3 |
| Baby punched, second layer | `AUDIO_BABY_HIT_EXTRA` | 172078_764147-lq.mp3 |
| Perfect catch, beside synth | `AUDIO_PERFECT_EXTRA` | 547346_10485775-lq.mp3 |
| Every candy catch, beside slap | `AUDIO_CANDY_POP` | 868506_19015218-lq.mp3 |

All URLs are the user-supplied Freesound CDN preview files. The candy pop was resolved from the specific [LSpec sound page](https://freesound.org/people/LSpec/sounds/868506/), which lists CC0. Check the other sounds' licenses before store distribution.

`AssetPreload.ts` fetches all active audio before the player enters the ready scene, reports real asset-count progress, and permits play when a CDN file fails. `useGameAudio.ts` uses the recorded sounds with the existing SFX volume/mute controls and Tone.js synth fallbacks. `CrossfadeMusic.ts` decodes each music file once and schedules two copies to overlap for up to 100 ms at the loop seam; it stops music on the results screen and when backgrounded. The platform may require a user gesture to unlock sound, so the loader has an Enter button before the ready scene.

The street, characters, candy, and the toilet paper strip are drawn in Canvas 2D. The old static background image is no longer used.
