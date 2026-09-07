## Context

See `proposal.md` - Why. Relevant current-state details from `components/auto-scroll-reader.tsx`:

- Chord sheet text uses `font-mono`, so character width is uniform and `ch` CSS units map 1:1 to character columns.
- `buildPositionedChordLine` parses a raw line like `"[G] Harbor lights are [D] drifting slow"` into a lyric-only string plus a list of `{ column, label, name }` chord annotations, where `column` is a character offset into the lyric string. `ChordLine` renders the lyric text as one `whitespace-pre` row and absolutely positions each chord label at `left: {column}ch` on a row above it.
- Today, non-play mode wraps this pair of rows in a `overflow-x-auto` container (side-scroll); play mode instead measures `chordContentRef` (`clientWidth` vs `scrollWidth`) after paint and sets a `playFitScale` CSS scale factor applied to `font-size`/`line-height`.
- `AutoScrollReader` is the single shared implementation used by `song-page-shell.tsx`, `playlist-player.tsx`, and `song-editor-preview.tsx`.

## Goals / Non-Goals

**Goals:**
- Replace the shrink-to-fit mechanism with wrapping so font size is constant regardless of content.
- Keep the existing chord-to-lyric column alignment model, extended to work per wrapped visual row instead of assuming one row per source line.
- Make wrapping and the removal of horizontal scroll apply uniformly across all three consumers, since they share one component.
- Add a non-interactive countdown gate before scrolling starts, with layout already finalized beforehand.

**Non-Goals:**
- Changing the underlying data model (`ChordSection`/lines) or the `[Chord]` inline token syntax.
- Changing the manual font-scale control's range or storage (still 80-150%, still `localStorage`-backed).
- Optimizing wrap calculation for extremely large documents beyond typical song lengths (tens of lines per section).
- Redesigning auto-scroll speed/timing behavior itself (unaffected by this change, only its start is gated by the countdown).

## Decisions

### 1. Compute wrapping in JS against a measured character-width budget, not CSS `white-space: normal`
Because chords are positioned by character column (`ch` units) relative to the lyric text, naive CSS wrapping (`white-space: normal`) would let the browser wrap lyric text independently of chord positions, breaking alignment. Instead:
- Determine the available width in characters (`maxColumns`) for the current container width and font size (`containerWidthPx / chWidthPx`, measured once via a hidden probe element or derived from `clientWidth` and the known monospace character width in `ch`).
- Extend `buildPositionedChordLine` into a function that, given the parsed lyric text + chord annotations + `maxColumns`, produces an array of "visual rows," each with its own lyric substring and chord annotations re-based to that row's local column offsets.
- Wrapping logic per row: accumulate lyric characters (and any chord tokens reinserted inline for width-counting purposes) until adding the next word would exceed `maxColumns`; break at the preceding whitespace. If a single "word" (including any chord tokens glued to it) still exceeds `maxColumns` on its own with no internal whitespace, forcibly break immediately before the next `[Chord]` token boundary within it (never mid-token, never mid-word-that-isn't-a-chord-boundary).

Alternative considered: let the browser wrap via CSS and re-measure chord positions post-layout using `Range`/`getClientRects()` per character. Rejected because it requires expensive per-line DOM measurement on every resize/font-scale change and is harder to keep deterministic/testable than pure-JS column math.

### 2. Compute `maxColumns` from a single measured monospace character width, recompute on resize/font-scale change
Reuse the existing viewport-resize listener infrastructure (`viewportSize` state) and font-scale value already in the component. On any change to container width or font scale, remeasure a 0-width-visible probe character (or use `clientWidth` of the text container divided by a computed `ch`-to-px ratio from `getBoundingClientRect` on a reference `1ch` element) to get `maxColumns`, then recompute wrapped rows for visible sections. This replaces the existing `playFitScale` measurement effect with a `maxColumns`-driven re-wrap effect, keeping the same dependency triggers (`viewportSize`, `fontScale`) but changing what's produced (row layout, not a scale factor).

### 3. Wrapping applies unconditionally (no play-mode branch)
Remove the `isPlayModeActive` branch that currently toggles between `overflow-x-auto` (browse) and measure-and-scale (play). Wrapping is now the only rendering mode, applied whenever `AutoScrollReader` renders lines, regardless of `isPlayModeActive`. This simplifies the component (no separate code paths for browse vs. play) and satisfies the "everywhere" requirement directly.

### 4. Countdown as a state machine step between "play pressed" and "scrolling starts"
Introduce a `playbackPhase` value (`idle | countingDown | scrolling`) replacing the current boolean-ish `isPlaying`/`isPlayModeActive` pairing where relevant. On pressing play: set `isPlayModeActive` true (as today, so layout is already wrap-computed) and `playbackPhase = 'countingDown'`. A countdown effect ticks 3 -> 2 -> 1 -> done on a fixed interval (e.g. 1 second per step, no dependency on user input), then sets `playbackPhase = 'scrolling'`, which is what actually starts the existing `requestAnimationFrame` scroll loop (gated on `playbackPhase === 'scrolling'` instead of `isPlaying` alone). Because `isPlayModeActive` flips to true first and wrapping is unconditional anyway (Decision 3), the wrapped layout is already correct and stable before the countdown UI even mounts - no layout recalculation is triggered by the countdown itself.

Pressing play/pause again during `countingDown` is a no-op for cancellation purposes (per the confirmed requirement); it may optionally reset the visual countdown display state but must not skip ahead or abort into `scrolling` early, nor revert to `idle`.

### 5. Keep the manual font-scale control fully independent of wrapping
`fontScale` remains a direct multiplier on the base `--reader-font-size`/`--reader-line-height` CSS variables, unchanged from today, with no `playFitScale`-style secondary multiplier. Increasing font scale simply reduces `maxColumns` (since characters get wider), which increases how aggressively lines wrap - this is expected and desirable (larger text naturally wraps more).

## Risks / Trade-offs

- **[Risk] JS-based wrap calculation could be slower than CSS-native wrapping, especially on low-end devices, for very long songs** -> Mitigation: wrapping runs once per section per resize/font-scale change (not per animation frame), and typical song sections are short (a handful of lines); memoize wrapped output per `(line, maxColumns)` pair to avoid recompute on unrelated re-renders.
- **[Risk] Measuring monospace character width via a probe element could be off by sub-pixel amounts, causing occasional off-by-one wraps** -> Mitigation: bias `maxColumns` down by one character as a safety margin; this is cheap and avoids edge-case overflow at the cost of wrapping very slightly earlier than strictly necessary.
- **[Risk] Removing horizontal scroll changes existing user muscle memory/expectations outside of play mode** -> Accepted as an intentional, confirmed scope decision (see proposal - BREAKING); no mitigation planned beyond this being a deliberate UX improvement.
- **[Risk] Chord-only instrumental runs with many short chords could still produce many wrapped rows if `maxColumns` is small (e.g. narrow phones at large font scale)** -> Mitigation: acceptable per requirements (correctness over compactness); no line ever overflows, which is the primary goal. Not aiming to minimize row count.

## Migration Plan

- This is a client-side, non-persisted rendering change; no data migration is required.
- No feature flag: the change replaces existing behavior directly for all three consumers in one release, since they share the single `AutoScrollReader` component and there is no partial-rollout mechanism in this codebase for UI behavior.
- Rollback is a plain revert of the component changes if issues are found post-deploy.
