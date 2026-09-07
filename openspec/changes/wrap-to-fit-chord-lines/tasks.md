## 1. Wrap calculation core

- [x] 1.1 Add a utility that measures the monospace character width (`ch`-to-px ratio) for the current font scale and derives `maxColumns` from a container's `clientWidth`, biased down by one character as a safety margin; verify with a unit test that known pixel widths and font sizes produce the expected `maxColumns`.
- [x] 1.2 Extend `buildPositionedChordLine` (or add a new function alongside it) to accept `maxColumns` and produce an array of visual rows, each with its own lyric substring and chord annotations re-based to that row's local column offsets; verify with unit tests covering: a short line (single row, unchanged behavior), a long line with word boundaries (wraps at whitespace), and a line with no whitespace (wraps between chords).
- [x] 1.3 Add unit tests verifying no `[Chord]` token and no word is ever split across two visual rows, including the chord-only fallback case (e.g. `[Am][C][G][F]` with no whitespace).
- [x] 1.4 Add unit tests verifying chord-to-lyric column alignment is preserved on each wrapped row (a chord appears on the same visual row as, and aligned above, its associated word).

## 2. Reader rendering changes

- [x] 2.1 Update `ChordLine` to render multiple visual rows (from task 1.2's output) instead of a single `whitespace-pre` row pair, preserving existing chord tooltip hover/focus behavior on each rendered chord.
- [x] 2.2 Remove the `overflow-x-auto` branch and the `isPlayModeActive` conditional wrapper around `chordContentRef` in `auto-scroll-reader.tsx`; wrapping is now applied unconditionally whenever lines are rendered. Verify by rendering a long line in non-play (browse) mode and confirming it wraps instead of side-scrolling.
- [x] 2.3 Remove `playFitScale` state, its measurement `useEffect` (`clientWidth`/`scrollWidth` comparison), and its use in `readerTypographyStyle`; font size is now driven only by `fontScale`. Verify font size is visually identical between a short-line song and a long-line song at the same font scale.
- [x] 2.4 Wire the wrap calculation (task 1.1/1.2) into `auto-scroll-reader.tsx`, recomputing wrapped rows when `viewportSize` or `fontScale` changes, memoized per `(line, maxColumns)` to avoid recomputation on unrelated re-renders.

## 3. Get-ready countdown

- [x] 3.1 Introduce a `playbackPhase` state (`idle | countingDown | scrolling`) in `auto-scroll-reader.tsx`, replacing the parts of `isPlaying`/`isPlayModeActive` that currently gate the scroll animation loop directly.
- [x] 3.2 On pressing play from `idle`, set `isPlayModeActive` true (so wrapped layout is already computed) and `playbackPhase` to `countingDown`; render a "Get ready... 3, 2, 1" countdown UI over the reader.
- [x] 3.3 Implement the countdown timer (fixed interval, e.g. 1 second per step) that transitions `playbackPhase` from `countingDown` to `scrolling` after reaching zero; gate the existing `requestAnimationFrame` scroll loop on `playbackPhase === 'scrolling'` instead of the current `isPlaying` check.
- [x] 3.4 Ensure pressing play/pause during `countingDown` does not cancel, skip, or restart the countdown early (no-op or purely cosmetic reset only, per design decision 4); verify with a test/manual check that the countdown always reaches completion once started.
- [x] 3.5 Verify no layout shift occurs between the countdown appearing and auto-scroll starting (wrapped rows computed in task 2.4 do not change during this transition). Confirmed by code review: `maxColumns` is measured in its own effect keyed on `viewportSize`/`fontScale` only, independent of `playbackPhase`, so the phase transition from `countingDown` to `scrolling` never triggers a re-measurement or re-wrap.

## 4. Cross-consumer verification

- [x] 4.1 Verify wrap-to-fit and no-horizontal-scroll behavior on the song page (`song-page-shell.tsx`) for a song with long lines. Confirmed by code review: `song-page-shell.tsx` passes no props that bypass the shared unconditional wrapping logic in `AutoScrollReader`.
- [x] 4.2 Verify wrap-to-fit and no-horizontal-scroll behavior in playlist mode (`playlist-player.tsx`) when auto-advancing to a song with long lines. Confirmed by code review: each song mounts a fresh `AutoScrollReader` (`key={song.slug}`), so wrapping and the get-ready countdown both apply consistently on every auto-advance.
- [x] 4.3 Verify wrap-to-fit and no-horizontal-scroll behavior in the editor preview (`song-editor-preview.tsx`) while editing a song with long lines. Confirmed by code review: same shared component, no conflicting props.
- [x] 4.4 Run `npm run typecheck` and `npm run lint` and confirm both pass with no new errors. Ran both; all findings (Prisma client type errors, `speedSliderStep`/`documentLabel` unused-var warnings, `onPlaybackComplete` exhaustive-deps warning) are pre-existing and unchanged on the base branch (verified via `git stash`).
- [x] 4.5 Run `npm run test` and confirm all existing and newly added tests pass. `npx vitest run` — 34/34 tests passed (23 existing + 11 new).
