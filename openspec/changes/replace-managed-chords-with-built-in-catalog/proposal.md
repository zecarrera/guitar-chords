## Why

The chord page currently asks the user to maintain a small database of shapes instead of providing a comprehensive reference. Replace that maintenance burden with a bundled open-source catalog that works consistently in browsing, song playback, and editor analysis without a database dependency.

## What Changes

- Bundle the guitar dataset from `tombatossals/chords-db` at a pinned revision with its MIT notice and source provenance.
- Use the first position supplied for each chord as the default everywhere; retain upstream positions without ranking, legacy-shape merging, or personal overrides.
- Replace `/chords` management forms with searchable diagram cards and root/family filters.
- Share catalog lookup, chord-name aliases, and diagram availability across the reference page, reader, playlists, and editor preview/analysis.
- Adapt the diagram renderer to upstream relative frets, muted strings, base frets, finger numbers, and barres.
- **BREAKING**: Remove the existing hardcoded shapes, chord create/update/delete actions, chord seeding, and `ChordDefinition` database storage. Existing custom definitions are not imported into the new catalog.
- Preserve authored song text and chord spellings; show explicit unavailable-diagram feedback when a chord cannot be resolved.

## Capabilities

### New Capabilities

- `chord-catalog`: Versioned built-in chord data, first-position defaults, shared resolution, visual reference browsing, and retirement of chord management.

### Modified Capabilities

- `chord-sheet-formatting`: Recognize catalog-supported notation consistently while preserving syntax-based recognition of valid chords without diagrams; resolve diagram availability against the shared catalog.

## Impact

- Affects `lib/chord-library.ts`, `lib/types.ts`, `lib/data.ts`, `lib/chord-syntax.ts`, `lib/auto-format.ts`, `app/chords/`, and the reader/preview/playlist consumers.
- Adds a vendored data asset and third-party license/provenance documentation; no live provider API or additional runtime service is needed.
- Changes Prisma schema and seed behavior. Release requires backing up existing chord definitions before their table is removed; rollback must restore that table/data before redeploying the previous application.
- Song documents and their database relationships remain unchanged: chord labels are text, not foreign keys to definitions.
- Removes chord-write entry points; no new identity, authorization, email, or telemetry functionality. Imported data is validated as structured data and displayed as escaped text/SVG attributes, never executable markup.
- Non-goals: song-library changes, custom chord editing, algorithmic fingering generation, difficulty ranking, alternate tunings, voicing selection UI, or exhaustive coverage of every theoretical chord.
