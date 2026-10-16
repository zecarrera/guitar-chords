## Context

In `components/auto-scroll-reader.tsx`, `playbackPhase` moves `idle → preparing → countingDown → scrolling`. `startPlayback` sets `countdownValue` to 3; an effect moves `preparing → countingDown` once `isLayoutReady`; another effect ticks the counter each second and then enters `scrolling`. The overlay shows "Get ready" with either "Preparing layout..." or the number. `isPlaying` is `playbackPhase !== "idle"`, so wake lock and controls treat preparation as playing. `togglePlayback` ignores presses outside `idle`/`scrolling`.

## Goals / Non-Goals

**Goals:**
- Start scrolling immediately once layout is ready, with no visible counter or delay.
- Keep the layout-stability guarantee.

**Non-Goals:**
- Playlist next-song countdown, speed persistence, any data or telemetry change.

## Decisions

1. **Drop the `countingDown` phase and `countdownValue`.** Phases become `idle | preparing | scrolling`; the layout-ready effect moves `preparing → scrolling` directly. Alternative: keep a 0-second countdown; rejected as dead code.
2. **Keep `preparing`.** Layout is recomputed on start (`setIsLayoutReady(false)` plus a revision bump), so scrolling must wait for it to avoid shifts. The overlay is simplified to a "Preparing layout..." message, dropping the "Get ready" heading, and is only visible for the brief preparation window.
3. **Control behavior unchanged**: presses during `preparing` remain no-ops to prevent double starts; `isPlaying` semantics are unchanged.
4. Rename the overlay/comments that mention the countdown so the code matches the new behavior.

## Risks / Trade-offs

- Users get no lead time to position themselves → intended by the request; speed and play controls are unchanged.
- Overlay flicker if layout is ready almost instantly → acceptable; verify manually, and consider rendering the overlay only after a short threshold if it flashes.
- Spec capability name `play-mode-countdown` becomes a misnomer → kept to avoid churn; rename can be a later change.

## Migration Plan

Front-end only; no data or schema changes. Roll back by reverting the commit.
