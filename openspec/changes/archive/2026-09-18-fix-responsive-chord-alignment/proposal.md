## Why

Chord labels can lose their association with the intended lyric when the reader font size or available width changes. The current layout uses one mutable column for both the chord's semantic lyric anchor and collision-adjusted display position, while imported chord-only rows and their following lyric rows are wrapped independently.

## What Changes

- Preserve each chord's immutable lyric anchor when parsing and wrapping inline chord notation.
- Resolve overlapping chord labels as a presentation concern without changing which lyric position or wrapped row owns the chord.
- Recognize eligible chord-only and following lyric row pairs as one logical chord-and-lyric line before responsive wrapping.
- Preserve standalone instrumental chord rows when no lyric row can be paired safely.
- Recalculate reader column capacity whenever its actual content width or typography metrics change.
- Decode artist route parameters before playlist lookup so artist names containing spaces reach the playlist reader.
- Add coverage for dense chord changes, multiple font scales, responsive widths, paired chord/lyric rows, and instrumental-only rows.

## Capabilities

### New Capabilities

- `artist-playlist-navigation`: Artist playlist links resolve encoded artist names to the matching playlist.

### Modified Capabilities

- `chord-reader-layout`: Strengthen responsive wrapping and alignment requirements so chords remain attached to their intended lyric anchors across font-size and container-width changes, including supported two-line chord-sheet input.

## Impact

- Affects chord-sheet parsing and normalization in `lib/chord-sections.ts`, `lib/auto-format.ts`, and potentially `lib/pdf-import.ts`.
- Affects the anchored layout and wrapping model in `lib/chord-line-layout.ts`.
- Affects reader rendering and width observation in `components/auto-scroll-reader.tsx`.
- Corrects artist playlist lookup in `app/artists/[name]/play/page.tsx`.
- Extends layout, formatting, and section parsing tests without changing the database schema or external APIs.
