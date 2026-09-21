## Why

Song detail pages should expose each song's strumming pattern as readable practice metadata without requiring the user to enter play mode. The current implementation stores and renders the value through the ambiguously named difficulty field, which makes the intended information unclear and risks inconsistent editing and display behavior.

## What Changes

- Add a song-detail metadata capability that presents a configured strumming pattern on the standard song view.
- Keep the strumming pattern out of the play-mode reader controls and playback experience.
- Align the song data shape, persistence mapping, demo data, and management form terminology around a dedicated strumming-pattern value.
- Omit the strumming-pattern display when a song has no configured pattern.

## Capabilities

### New Capabilities
- `song-strumming-pattern-display`: Display a song's optional strumming pattern on its standard detail view, independently from play mode.

### Modified Capabilities

- None.

## Impact

- Affects the `Song` Prisma model and its mapped application type, demo/seed data, management form fields and actions, and the song detail header in `components/song-page-shell.tsx`.
- Does not add external APIs, dependencies, telemetry, authorization changes, or deployment configuration.
- Existing song records require compatibility handling so their current difficulty-backed values continue to appear as strumming patterns after the data-field alignment.
