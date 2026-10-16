## Why

Chords sometimes render stacked vertically in the reader instead of sequentially. Beyond the reader-layout defect (tracked in `fix-chord-stacking-layout`), the source text itself can contain shapes that cause or worsen stacking: chord rows longer than the lyric row beneath them, runs of consecutive chord-only rows, and chords placed too close together. Auto Format currently classifies rows but says nothing about these layout risks, so authors cannot see or correct them while adding or editing a song.

## What Changes

- Auto Format analysis detects stacking-prone shapes and reports them as line-specific diagnostics with an explanation and a suggested manual remedy:
  - a chord row whose chords start at or beyond the end of the paired lyric row (chords overflow the lyric);
  - consecutive chord-only rows that the reader will show as separate stacked lines;
  - chord tokens in one row so close together that their rendered labels would collide and need extra lanes.
- Diagnostics are presented in the existing editor feedback panel as warnings, distinct from ambiguity warnings, and stay non-mutating.
- Only deterministic, meaning-preserving remedies may become safe fixes. Remedies that would merge rows, move chords, or alter lyrics remain recommendations.
- Detection uses the same anchor/overflow rules as the reader layout so the editor and reader agree on what is risky.

Non-goals: changing reader rendering (covered by `fix-chord-stacking-layout`), rewriting stored songs, adding persistence or telemetry, inferring chord-to-lyric association, or auto-merging chord rows. No security, authorization, email, deployment, or telemetry impact; diagnostics are computed client-side from editor text and must not log or transmit chord-sheet content.

## Capabilities

### New Capabilities

### Modified Capabilities
- `chord-sheet-formatting`: Auto Format analysis additionally reports chord-layout stacking risks as line-specific warnings and keeps them out of the safe-fix plan.

## Impact

- `lib/auto-format.ts`: new diagnostic codes and detection pass; `ChordSheetDiagnostic` code union extended.
- `lib/chord-syntax.ts` / `lib/chord-line-layout.ts`: reuse of token positions and collision logic (read-only reuse, possibly a small shared helper).
- `components/auto-format-feedback.tsx`: render layout-risk warnings and remedies.
- Tests: `lib/__tests__/auto-format.test.ts`, `lib/__tests__/auto-format-feedback.test.tsx`.
- Compatibility: additive; existing diagnostics, safe fixes, and stored content unchanged. Related to, but independent of, `fix-chord-stacking-layout`.
