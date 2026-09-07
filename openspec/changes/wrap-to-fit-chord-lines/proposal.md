## Why

The chord reader currently shrinks the font size in play mode to force the longest line in a song to fit the viewport width (`playFitScale`). This makes font size inconsistent across songs (a single dense line can shrink an entire song's text) and causes a jarring, instant font-size snap the moment play mode is entered. Since the reader is used hands-free while playing guitar, the user cannot scroll or interact once playback starts, so any overflow or unreadable text is a real usability failure, not just a cosmetic one.

## What Changes

- **BREAKING**: Remove the shrink-to-fit behavior (`playFitScale`) entirely. Font size is now fixed at the user's chosen scale (existing 80–150% manual control is retained) and never auto-shrinks.
- Add wrap-to-fit rendering: lines that exceed the available width wrap onto additional visual rows instead of shrinking or side-scrolling.
  - Wrap at word boundaries first.
  - Fall back to breaking directly between adjacent `[Chord]` tokens when a line has no whitespace to wrap on (e.g. `[Am][C][G][F]` instrumental runs).
  - Never break inside a single `[Chord]` token or inside a word.
- Chord positions are re-mapped per visual row after wrapping so each chord stays aligned above its associated word/position, including on wrapped rows.
- **BREAKING**: Remove horizontal side-scrolling (`overflow-x-auto`) for chord sheets. Wrapping applies everywhere a song is rendered (song page, playlist mode, editor preview), not only in play mode.
- Add a "Get ready... 3, 2, 1..." countdown that plays before auto-scroll starts. Content is fully wrapped and laid out before the countdown begins, so there is no layout shift during or after the countdown. The countdown always runs to completion once started (no cancel-on-tap).

## Capabilities

### New Capabilities
- `chord-reader-layout`: Defines how chord sheet lines are wrapped to fit the available width (word-boundary wrapping with chord-token fallback, per-row chord re-alignment, fixed/user-controlled font size, no horizontal scroll) across all rendering contexts (song page, playlist mode, editor preview).
- `play-mode-countdown`: Defines the pre-playback "Get ready" countdown behavior — timing, non-cancelable completion, and the guarantee that layout is stable before the countdown starts.

### Modified Capabilities
(none — no existing capability specs predate this change)

## Impact

- `components/auto-scroll-reader.tsx`: remove `playFitScale` state/effect and the `isPlayModeActive` font-scale branch; rework `ChordLine`/`buildPositionedChordLine` to compute wrapped rows and per-row chord columns; remove `overflow-x-auto` fallback wrapper; add countdown state/UI before starting the scroll animation loop.
- Affects all three consumers of `AutoScrollReader`: `components/song-page-shell.tsx`, `components/playlist-player.tsx`, `components/song-editor-preview.tsx` — all get wrap-to-fit and lose horizontal side-scroll, since they share the one component.
- No data model or Prisma schema changes; this is purely a client-side rendering/behavior change.
