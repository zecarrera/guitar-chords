## Why

The library currently replaces its content with a “Desktop only” message on small screens, preventing users from finding and playing songs on mobile. A mobile browsing view lets users access the song library on the device they use to play while keeping song management limited to desktop.

## What Changes

- Replace the small-screen desktop-only message with a mobile song library that supports searching by song title or artist and opening a song’s play page.
- Show add, edit, and delete song controls as disabled on mobile; keep song-management functionality available on desktop.
- Keep mobile focused on song browsing and playback rather than artist management.

## Capabilities

### New Capabilities
- `mobile-song-library`: Browse, search, and play songs from the library on mobile without enabling song-management actions.

### Modified Capabilities
- None.

## Impact

- Affects `components/library-page.tsx` and focused library rendering tests.
- No API, persistence, dependency, or deployment changes. Desktop library behavior remains unchanged.
