/**
 * Per-run score send integration placeholder. Called exactly once per
 * RUN_FINISHED event (including zero-score runs and every replay).
 * Practice runs are logged for diagnostics but never masquerade as a
 * real ranked submission.
 */
export interface ScoreSendPayload {
  runId: string;
  score: number;
  candy: number;
  maxCandy: number;
  hits: number;
  perfects: number;
  misses: number;
  babyHits: number;
  pumpkins: number;
  stains: number;
  eligible: boolean;
  submitted: boolean;
  completedAt: string;
}

export function sendScorePlaceholder(payload: ScoreSendPayload): void {
  console.info('[BONK SCORE SEND PLACEHOLDER]', payload);
  // TODO: Aippy wire score transport here.
  // Use payload.runId as the idempotency key: only retry FAILED sends,
  // never blindly duplicate a successful one.
  try {
    localStorage.setItem('bonk:lastScoreSend', JSON.stringify(payload));
  } catch {
    // storage unavailable — console log above is enough for inspection
  }
}