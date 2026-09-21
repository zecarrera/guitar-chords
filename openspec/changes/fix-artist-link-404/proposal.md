## Why

The artist name shown in a song's compact header links to `/artists/<name>`, but the application currently exposes the artist playlist at `/artists/<name>/play`. As a result, selecting the artist from a song page sends users to a 404 page instead of the matching artist playlist.

## What Changes

- Update the song-page artist link to target the existing artist playlist route.
- Preserve URL encoding for artist names containing spaces or other special characters.
- Add focused coverage for the song-page artist link so the route contract does not regress.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `artist-playlist-navigation`: Require artist links rendered on song pages to resolve to the existing encoded artist playlist route.

## Impact

- Affected UI: `components/song-page-shell.tsx`.
- Affected validation: focused component or route-link test coverage, using the existing Vitest setup.
- No API, database schema, dependency, deployment, security, privacy, authorization, or telemetry changes are expected.
