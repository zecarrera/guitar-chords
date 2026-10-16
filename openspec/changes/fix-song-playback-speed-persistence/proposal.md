## Why

The reader currently lets one browser-wide saved speed override each song's configured speed, so changing a song's speed can affect other songs and revisiting a song may not restore its own saved value. The save action also selects a chord document without an ordering even though the reader loads the oldest document, so the speed can be written to a different document than the one used for playback.

## What Changes

- Make each song's persisted scroll speed the authoritative initial speed for its reader.
- Persist a changed speed to the same primary chord document that supplies the song's playback content.
- Prevent a speed chosen for one song from silently becoming the initial speed of another song.
- Persist only the final chosen speed once when playback ends, rather than issuing persistence calls for each adjustment; leave font-scale preference behavior unchanged.

## Capabilities

### New Capabilities

- `song-playback-speed`: Defines per-song playback speed selection, restoration, and persistence.

### Modified Capabilities

None.

## Impact

- Affects `components/auto-scroll-reader.tsx`, the song playback data mapping in `lib/data.ts`, and `updateScrollSpeedAction` in `app/manage/actions.ts`.
- Uses the existing `ChordDocument.scrollSpeed` database field; no schema migration or new dependency is expected.
- Existing browser-wide scroll-speed storage will no longer determine a song's initial speed. No security, privacy, authorization, telemetry, or deployment behavior is intended to change.
