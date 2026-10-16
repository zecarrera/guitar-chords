export type PlaybackPhase = "idle" | "preparing" | "scrolling";

export function getPhaseWhenLayoutReady(
  phase: PlaybackPhase,
  isLayoutReady: boolean,
): PlaybackPhase {
  return phase === "preparing" && isLayoutReady ? "scrolling" : phase;
}
