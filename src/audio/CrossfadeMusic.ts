/** Schedules overlapping buffer sources on the game AudioContext. */
export class CrossfadeMusic {
  private buffer: AudioBuffer | null = null;
  private bus: GainNode | null = null;
  private sources: AudioBufferSourceNode[] = [];
  private generation = 0;
  private timer: number | null = null;

  async start(ctx: AudioContext, bytes: ArrayBuffer, volume: number): Promise<boolean> {
    const generation = ++this.generation;
    this.stopSources();
    try {
      if (!this.buffer) this.buffer = await ctx.decodeAudioData(bytes.slice(0));
      if (generation !== this.generation || !this.buffer || this.buffer.duration < 0.3) return false;
      const bus = ctx.createGain();
      bus.gain.value = volume;
      bus.connect(ctx.destination);
      this.bus = bus;
      const overlap = Math.min(0.1, this.buffer.duration * 0.18);
      const step = this.buffer.duration - overlap;
      let nextAt = ctx.currentTime + 0.035;
      let index = 0;
      const schedule = () => {
        if (generation !== this.generation) return;
        // Keep a short audio-clock lookahead. The ready scene can idle forever
        // without creating an unbounded pile of future sources.
        while (nextAt < ctx.currentTime + Math.max(12, step * 2)) {
          const at = nextAt;
          const first = index++ === 0;
          nextAt += step;
          const source = ctx.createBufferSource();
          const gain = ctx.createGain();
          source.buffer = this.buffer;
          source.connect(gain); gain.connect(bus);
          gain.gain.setValueAtTime(first ? 1 : 0, at);
          if (!first) gain.gain.linearRampToValueAtTime(1, at + overlap);
          gain.gain.setValueAtTime(1, at + this.buffer.duration - overlap);
          gain.gain.linearRampToValueAtTime(0, at + this.buffer.duration);
          source.start(at); source.stop(at + this.buffer.duration + 0.01);
          this.sources.push(source);
          source.onended = () => {
            source.disconnect(); gain.disconnect();
            this.sources = this.sources.filter((active) => active !== source);
          };
        }
      };
      schedule();
      this.timer = window.setInterval(schedule, 2000);
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  setVolume(volume: number): void {
    if (this.bus) this.bus.gain.setTargetAtTime(Math.max(0, volume), this.bus.context.currentTime, 0.025);
  }

  private stopSources(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    for (const source of this.sources) { try { source.stop(); } catch { /* already ended */ } source.disconnect(); }
    this.sources = [];
    this.bus?.disconnect(); this.bus = null;
  }

  stop(): void { this.generation++; this.stopSources(); }
}
