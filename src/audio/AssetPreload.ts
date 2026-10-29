import { BABY_HIT_EXTRA_URL, BABY_HIT_URL, BABY_INCOMING_URL, CANDY_POP_URL, MENU_MUSIC_URL, MUSIC_URL, PERFECT_EXTRA_URL } from '@/audio/manifest';

const AUDIO_URLS = [MUSIC_URL, MENU_MUSIC_URL, BABY_INCOMING_URL, BABY_HIT_URL, BABY_HIT_EXTRA_URL, PERFECT_EXTRA_URL, CANDY_POP_URL];
const URLS = AUDIO_URLS;
const audioBytes = new Map<string, ArrayBuffer>();

export function cachedAudio(url: string): ArrayBuffer | undefined { return audioBytes.get(url); }

/** Real download progress by asset count. A missing CDN file never traps the player. */
export async function preloadGameAssets(
  onProgress: (complete: number, total: number) => void,
  signal: AbortSignal,
): Promise<string[]> {
  let complete = 0;
  onProgress(0, URLS.length);
  const failures: string[] = [];
  await Promise.all(URLS.map(async (url) => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    const timeout = window.setTimeout(abort, 16000);
    try {
      const response = await fetch(url, { mode: 'cors', cache: 'force-cache', signal: controller.signal });
      if (!response.ok) throw new Error(`Asset ${response.status}`);
      const bytes = await response.arrayBuffer();
      if (AUDIO_URLS.includes(url)) audioBytes.set(url, bytes);
    } catch {
      if (!signal.aborted) failures.push(url);
    } finally {
      window.clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
      if (!signal.aborted) onProgress(++complete, URLS.length);
    }
  }));
  return failures;
}
