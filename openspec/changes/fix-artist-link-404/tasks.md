## 1. Update Artist Navigation

- [x] 1.1 Change the song-page artist link to append `/play` while retaining `encodeURIComponent(song.artist)`, and verify the rendered destination matches `/artists/<encoded-name>/play`.

## 2. Add Regression Coverage

- [x] 2.1 Add focused Vitest coverage for a song artist containing spaces or other encoded characters, and verify the song-page link targets the existing artist playlist route.
- [x] 2.2 Run the focused regression test and `npm run typecheck` to verify the route change preserves type safety and the artist playlist navigation contract.
