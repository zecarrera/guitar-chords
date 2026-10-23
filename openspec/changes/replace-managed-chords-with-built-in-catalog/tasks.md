## 1. Vendor and validate the catalog

- [x] 1.1 Read `AGENTS.md` and the installed Next.js guides relevant to server/client boundaries and data loading; verify the implementation remains on the feature branch before editing code.
- [x] 1.2 Vendor `lib/guitar.json` from the design's pinned upstream revision with its MIT notice and provenance/checksum documentation; verify the checksum and the expected 828 entries and 3,283 ordered positions.
- [x] 1.3 Introduce provider-native typed catalog entries/positions and integrity tests for canonical identity uniqueness, first-position presence, six-string arrays, numerical bounds, barres, and MIDI consistency; verify malformed fixture entries fail explicitly and the bundled asset passes.
- [x] 1.4 Replace legacy shape lookup with a shared catalog resolver, naming/alias handling, and unconditional first-position selection; verify root/bass enharmonic aliases, major/minor distinctions, unknown-label rejection, and B/Bm first-position fidelity in focused tests.

## 2. Wire recognition and every diagram consumer

- [x] 2.1 Extend shared syntactic recognition to all bundled display labels and supported aliases without requiring catalog membership; verify catalog-wide recognition plus absent valid chords, lyrics, malformed brackets, repeat/bar annotations, and unchanged source anchors.
- [x] 2.2 Update editor missing-diagram analysis to use the shared resolver; verify extended catalog chords resolve and valid absent chords still produce informational missing-diagram diagnostics.
- [x] 2.3 Extract a shared accessible SVG diagram component using upstream relative frets, muted/open strings, fingers, base fret, and barres; verify representative open, higher-neck, and multiple-barre renderings and escaped labels with focused render tests.
- [x] 2.4 Replace database-backed chord loading in `lib/data.ts` and update song shell, reader, artist playlist, and editor preview consumers to the new catalog contract; verify the same first position appears across surfaces, unavailable feedback remains explicit, and database-disabled chord loading does not access Prisma.

## 3. Replace chord management with reference browsing

- [x] 3.1 Replace `/chords` forms with named diagram cards, chord-name/alias search, and root/family filters covering the entire catalog; verify combined criteria, alias deduplication, all-family coverage, clear/reset controls, and explicit empty results.
- [x] 3.2 Bound visible diagram cards without restricting the searchable catalog and preserve keyboard-accessible controls; verify changing criteria resets the displayed result window and matching entries beyond the initial page remain reachable.
- [x] 3.3 Delete chord mutation actions and management-only UI/helpers and remove the hardcoded dataset; verify no active create/update/delete chord entry points or legacy-shape fallback remain.

## 4. Retire persistence and document recovery

- [x] 4.1 Remove `ChordDefinition` from the Prisma schema and chord creation from seeding, and add a table-removal migration without editing migration history; verify Prisma generation and fresh/existing-database migration plus seed behavior in an isolated database with unchanged song documents.
- [x] 4.2 Document and rehearse protected backup, table/data restoration, Prisma migration-history reconciliation, and deployment ordering for the migrate-before-build Vercel flow; verify recovery in a disposable database, including a simulated post-migration build failure, without committing backup content or secrets.
- [x] 4.3 Update existing project documentation with read-only catalog behavior, upstream attribution/update procedure, known shape/coverage limitations, and release/rollback prerequisites; verify documentation matches the implementation and contains no legacy management instructions.

## 5. Verify integrated behavior

- [x] 5.1 Update affected fixtures and add integration regressions for reference/reader/editor agreement, database-independent catalog availability, and unchanged authored song labels; verify focused catalog, syntax, formatting, and reader suites pass together.
- [x] 5.2 Run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`; verify all pass and inspect built output for unnecessary catalog duplication across playlist instances.
- [x] 5.3 Manually verify reference search/filters, mobile diagram layout, keyboard access, tooltips, editor preview, artist playlists, aliases, and missing-diagram feedback with database reads both enabled and disabled; verify no provider runtime requests or chord-write controls are present and record concise non-sensitive release evidence.

## Verification evidence

- Typecheck and ESLint completed successfully; three existing reader warnings remain unchanged. All 150 tests passed. Production builds succeeded with database reads disabled and against an isolated migrated PostgreSQL database.
- The client build contains one shared catalog chunk; artist-playlist RSC payloads contain no serialized position arrays.
- Browser checks at 390x844 and desktop sizes covered alias search, combined filters, pagination/reset, empty states, keyboard access, diagram bounds, and song/playlist tooltips with reads disabled and enabled. No runtime provider requests, browser exceptions, or chord management controls were observed.
- The active database-backed editor recognized extended/alias chords and reported absent diagrams without changing authored text. The existing detached editor-preview component was render-tested and its mobile layout inspected in a browser fixture; no new preview route was added.
- The public MIT notice matched the vendored notice byte-for-byte.
- Disposable PostgreSQL rehearsal verified fresh migration/seed and an existing library with 31 managed definitions, including a custom record. The removal left song/document records unchanged. Restoring a protected full snapshot after a simulated post-migration build failure recovered definitions and baseline migration history; applying the removal again succeeded.
- No configured development or production database was changed. A protected production backup and controlled deployment remain operator prerequisites, as documented in README.md.
