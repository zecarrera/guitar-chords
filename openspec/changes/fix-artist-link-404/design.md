## Context

The song page renders its artist name as a link, while the only artist detail route currently implemented is the `/artists/[name]/play` playlist page. The artist index already uses that route and URL-encodes the artist name; the song-page link is the inconsistent surface. The existing artist playlist page decodes the dynamic route parameter before querying the shared data layer.

## Goals / Non-Goals

**Goals:**

- Make the song-page artist link use the same encoded playlist route as the artist index.
- Preserve support for artist names containing spaces and other characters requiring URL encoding.
- Add focused regression coverage for the user-visible link destination.

**Non-Goals:**

- Do not add a separate non-play artist detail page or redirect route.
- Do not change artist lookup, playlist loading, demo data, database schema, or song URL behavior.
- Do not introduce dependencies, telemetry, or persistence changes.

## Decisions

- **Reuse the existing playlist route.** Change only the song-page link destination to append `/play`, matching `components/artist-list.tsx` and the implemented `app/artists/[name]/play/page.tsx`. This avoids adding a second route with duplicated loading and not-found behavior.
- **Keep encoding at the link boundary.** Continue to apply `encodeURIComponent` to the artist value when constructing the href. The route page remains responsible for decoding before calling `getSongsByArtist`, preserving the current data contract.
- **Test the rendered contract.** Add focused coverage that renders or inspects the song-page header link for an artist with spaces and verifies the encoded `/artists/<name>/play` destination. This catches the original missing-segment regression without coupling the test to internal data-loading details.

## Risks / Trade-offs

- **[Risk]** A future artist detail route could make `/artists/<name>` valid, but the song page would still intentionally open the playable playlist experience. → **Mitigation:** Keep the route choice documented by the existing playlist-navigation capability and test the intended destination.
- **[Risk]** Encoding behavior could regress for punctuation or Unicode artist names. → **Mitigation:** Reuse the established `encodeURIComponent` pattern and include a representative name containing spaces in focused coverage.

## Migration Plan

No data or deployment migration is required. Deploy the UI and test change normally; rollback is limited to reverting the song-page href change if the playlist route behavior is later replaced.
