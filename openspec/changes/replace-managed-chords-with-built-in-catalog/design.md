## Context

See proposal.md for motivation. The existing catalog has 30 hardcoded definitions; database reads replace those defaults, `/chords` bypasses the shared loader to offer CRUD, and editor analysis checks only the hardcoded list. The reader's SVG is private to `components/auto-scroll-reader.tsx` and expects absolute frets with `"x"` for muted strings. `ChordDefinition` is independent of songs: song documents contain text labels, not definition IDs.

The inspected upstream guitar JSON has 828 entries and 3,283 positions (377,917 bytes). Each position has six relative frets, six fingers, a base fret, barres, and MIDI notes; some include `capo`. The existing parser does not recognize all upstream suffixes. Existing formatting specs require recognition independent of diagram availability; that invariant remains.

## Goals / Non-Goals

**Goals:**
- Establish one catalog contract with faithful upstream positions and deterministic first-position selection.
- Reuse a presentational SVG renderer and a single name resolver without coupling either to Prisma.
- Retire persistence safely without altering song text or requiring provider connectivity.

**Non-Goals:**
- No legacy-shape import, custom correction dataset, personal overrides, ranking, or voicing-switching UI.
- No runtime fetches, automatic provider updates, tuning selection, or song-content migration.
- No new telemetry or authentication architecture.

## Decisions

### 1. Vendor a pinned upstream data asset

Use `tombatossals/chords-db` revision `df06fa7b425cf5fd29485ff6591236b3557e3fac`, specifically `lib/guitar.json`, with the MIT notice and provenance (repository, revision, path, checksum, and update procedure). Retain all positions in their original order. Updates are deliberate reviewed asset changes, not network-dependent application builds.

Prefer vendoring over installing the entire provider package: only the guitar asset is needed, its exact contents are reviewable, and unrelated tooling/instruments do not become dependencies. Do not use the larger derived collections with unresolved licensing provenance.

Validate the complete asset in focused tests before release: unique canonical chord identities, nonempty position arrays, six frets/fingers per position, finite integers within the provider format, valid base frets/barres, and pitch consistency with standard tuning. Invalid data fails explicitly with a chord identifier; it is not filtered out or replaced silently. Numerical/structural validation is not proof of human playability.

### 2. Adopt upstream position semantics

Replace the old definition shape with typed catalog entries and positions using `-1` for mute, `0` for open, positive frets relative to `baseFret`, finger `0` for no fretting finger, and explicit barres. Derive display names and root/family filter metadata without altering position values.

The default is always `positions[0]`, including its original finger assignment and bass note. Do not normalize a B/Bm inversion into a familiar root-bass shape. Upstream order remains the tie-breaker because no ranking is performed at all. All other positions remain stored but are not exposed by a selector in this change.

This avoids retaining conversion/serialization code solely for compatibility with retired data.

### 3. Centralize identity separately from authored labels

Keep a pure catalog/resolver module under `lib/`, usable in both server loading and editor analysis. Translate `major` to an empty display suffix and `minor` to `m`; normalize supported suffix aliases, ASCII/Unicode accidentals, and enharmonic root/bass pitch classes. Preserve case-sensitive major/minor distinctions and reject ambiguous or unknown suffixes rather than falling back to the root chord.

Catalog identity is separate from the user's label: `A#` resolves to the bundled `Bb` entry, but the song remains `A#`. Apply the same resolution in reference search and missing-diagram checks.

Expand the shared syntactic recognition policy to cover supported catalog labels/aliases, while retaining the existing grammar for valid absent chords. Catalog membership must not become the sole syntax test. Preserve token spans, authored labels, and all current ambiguous-row safeguards.

### 4. Share catalog loading and rendering across every consumer

Keep `lib/data.ts` as the server-facing access point, but make chord loading independent of database configuration and remove its Prisma/fallback branches. Update the song page shell, artist playlist, editor preview, and reader to use the new catalog contract without transmitting the whole catalog repeatedly to every song instance. Analysis uses the same pure resolver.

Extract the SVG from `auto-scroll-reader.tsx` into a shared presentational component used by reference cards and the tooltip. Render relative positions directly against the displayed base fret. Interpret `capo` as the provider's barre presentation hint, never as the song's capo setting. Use barre fret/finger/string data to render the covered span without marking unrelated strings as sounding. Preserve accessible names, escaped labels, tooltip positioning, and missing-diagram feedback.

For `/chords`, use a server page with a focused interactive browsing component. Search and root/family filters operate locally on the bundled reference and have clear/reset and empty states. Group roots by pitch class so aliases do not duplicate cards; family classification must cover every suffix (including compound/slash types), not discard uncommon entries. Keep a bounded visible result set or pagination so hundreds of SVGs are not mounted unnecessarily; filtering covers the full catalog regardless of the displayed page. These are UI implementation details, not persisted preferences.

### 5. Remove the old management path completely

Delete chord mutation actions/forms, remove the hardcoded collection and serialization helpers, stop seeding definitions, and remove the Prisma model through a new migration. Historical migrations remain intact. Update affected tests/fixtures and documentation to the provider-native contract rather than retaining legacy data for test compatibility.

Do not migrate managed records into the new catalog. Backups serve rollback only and must not be committed to the repository.

### 6. Keep trust boundaries and operations narrow

The only new external-data boundary is acquisition of the pinned asset during development. Check its provenance and validate its shape; never execute provider code or render labels as HTML. Reference search accepts plain text and does not issue database queries. Chord-write entry points disappear, and existing song-write authorization remains unchanged.

No secrets, external runtime calls, email processing, or telemetry are introduced. Do not record song content or search text as new telemetry. Residual concerns are upstream musical inaccuracies and future supply-chain changes, mitigated by pinning and review rather than by claiming complete musical validation.

## Risks / Trade-offs

- Upstream first positions can be unfamiliar or inverted -> Deliberately accept them, show faithful diagrams, and document that "default" does not mean "easiest."
- Incorrect fingerings or missing slash chords -> Keep explicit unavailable feedback, document known limitations, and review future upstream revisions; do not add a second local shape source.
- An expanded recognition grammar can misclassify ordinary text -> Add regressions for lyrics, malformed labels, repeat/bar annotations, and authored anchors alongside catalog-label coverage.
- Client payload/rendering cost -> Reuse the catalog module, avoid duplicated props per playlist item, and bound visible diagram cards.
- Dropping managed records prevents an application-only rollback -> Require a verified restorable backup and explicit schema/data restoration procedure.

## Migration Plan

1. Implement and verify the bundled catalog, shared consumers, removal of actions/seed references, and pending Prisma migration in an isolated environment. Read installed Next.js guidance before implementation.
2. Before production deployment, export the existing chord table to protected operator-controlled storage and verify restoration in a disposable database. Do not store backup content or connection values in source control or test evidence.
3. Account for the existing Vercel build order (generate, migrate, seed, build): briefly prevent old application requests during the destructive migration, and have the tested restoration procedure ready if any later build step fails.
4. Apply the table-removal migration and deploy the new application. Smoke-check reference search, aliases, song/playlist/editor diagrams, unavailable feedback, and unchanged song documents. Confirm no chord writes or provider runtime requests occur.
5. For rollback, stop serving requests, restore the table and backed-up records, reconcile Prisma migration history using the tested recovery procedure, then redeploy the previous application. An application-only rollback is insufficient. Validate old chord loading and song access before resuming traffic.
6. Document the pinned source, expected shape changes, update procedure, backup prerequisite, deployment ordering, and recovery steps in the repository's existing operational documentation. No database changes are executed during this planning workflow.
