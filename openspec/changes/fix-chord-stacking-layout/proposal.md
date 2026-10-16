## Why

When a chord-only row is paired with a shorter lyric row, chord anchors beyond the lyric text are clamped to its end, collapsing otherwise spaced chords onto one position. The reader then avoids label overlap by stacking those chords vertically, even when their source positions were horizontally separated.

## What Changes

- Preserve chord positions from a paired source row when they extend beyond the lyric text instead of collapsing them to the lyric end.
- Ensure paired chord-and-lyric lines with short lyrics retain distinct, ordered chord placements and wrap safely within the reader width.
- Keep separate consecutive chord-only rows as separate authored rows; do not merge them as part of this fix.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chord-reader-layout`: Paired two-line notation must preserve distinct chord source positions when the lyric line is shorter and avoid unnecessary vertical stacking while remaining within the available width.

## Impact

- Affects paired-row anchor creation in `lib/chord-sections.ts`, responsive wrapping and lane layout in `lib/chord-line-layout.ts`, and related Vitest coverage.
- No stored source text, database schema, dependencies, security, privacy, telemetry, or deployment behavior needs to change.
- Intentional standalone chord-only source rows remain vertically separate and unchanged.
