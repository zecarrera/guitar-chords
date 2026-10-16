## Why

Pressing play (or arriving in auto-play) currently shows a "Get ready" 3-2-1 countdown before scrolling starts. The user no longer wants this delay; playback should start as soon as the reader is ready.

## What Changes

- Remove the "Get ready" 3-2-1 countdown and its overlay number from the reader.
- Auto-scroll begins as soon as the layout is stable, with no timed delay.
- Keep the layout-stability guarantee: line wrapping is still computed before scrolling so nothing shifts as playback begins. The existing "Preparing layout..." overlay may remain briefly while that completes.
- Retire the requirement that a countdown cannot be cancelled; the play control behaves like any other playback state.
- **BREAKING** (behavioral): play no longer waits 3 seconds before scrolling.

Non-goals: the playlist "Next song in Ns" auto-advance countdown in `components/playlist-player.tsx` is a different feature and is unchanged; no changes to speed persistence, data, security, deployment, or telemetry.

Assumptions (adjust if wrong): the `preparing` phase stays so layout is still stable before scrolling; the capability keeps the path `play-mode-countdown` even though it no longer contains a countdown.

## Capabilities

### New Capabilities

### Modified Capabilities
- `play-mode-countdown`: removes the get-ready countdown and no-cancel requirements and restates that scrolling starts only after layout is stable.

## Impact

- `components/auto-scroll-reader.tsx`: `countdownValue` state, `countingDown` phase, countdown effect, and overlay countdown text; `startPlayback`/`togglePlayback` handling of phases.
- Tests that cover playback phases, if any; add focused coverage for the phase transition.
- `openspec/specs/play-mode-countdown/spec.md` updated on archive.
- No data, API, or dependency impact.
