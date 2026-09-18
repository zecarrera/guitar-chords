## Why

Auto Format and save-time normalization currently add brackets without compensating for their width, so later chords move away from their original lyric columns and can wrap against the wrong words in play mode. Chord recognition also differs between formatting, saving, and reading, causing valid chords, mixed notation, and ambiguous rows to behave inconsistently.

## What Changes

- Replace destructive bracket insertion with shared syntactic chord recognition that preserves bare chord-row text and original source columns.
- Make play mode recognize confidently parsed bare chord-only rows followed by lyrics, while retaining existing bracketed inline and two-line notation.
- Change Auto Format to return structured diagnostics describing recognized chord/lyric pairs, instrumental rows, ambiguous or malformed input, and chords without available diagrams.
- Show formatting outcomes and actionable warnings in the active add/edit song editor instead of reporting unconditional success.
- Limit automatic save and PDF text normalization to safe layout cleanup; structural interpretation remains explicit and non-destructive.
- Preserve meaningful blank-line section boundaries and leave ambiguous lines unchanged rather than partially rewriting them.

## Capabilities

### New Capabilities

- `chord-sheet-formatting`: Defines safe chord-sheet analysis, explicit Auto Format diagnostics, consistent chord syntax recognition, and non-destructive save normalization.

### Modified Capabilities

- `chord-reader-layout`: Extends supported two-line notation to bare chord-only rows while preserving token start columns as immutable lyric anchors.

## Impact

- Affects chord recognition and document normalization in `lib/auto-format.ts`, `lib/pdf-import.ts`, and a shared chord-syntax module.
- Extends `lib/chord-sections.ts` and its tests to parse bare two-line and instrumental chord notation without injected brackets.
- Changes Auto Format callers in the active add/edit modal and the alternate document-fields component to consume structured results and display diagnostics.
- Aligns create, update, and PDF-import save paths in `app/manage/actions.ts` around safe-only normalization.
- Requires migration-oriented compatibility tests for existing bracketed documents; no stored-data migration or new dependency is expected.
