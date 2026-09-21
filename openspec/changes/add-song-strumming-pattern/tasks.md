## 1. Data model and migration

- [x] 1.1 Replace the overloaded `difficulty` song field with nullable `strummingPattern` metadata in the Prisma schema and shared `Song` type, and verify Prisma client generation succeeds.
- [x] 1.2 Create a Prisma migration that adds and backfills `strummingPattern` from existing `difficulty` values before removing the legacy column, and verify it preserves a legacy populated record.
- [x] 1.3 Update database mapping, seed data, and demo fallback songs to use `strummingPattern`, and verify database-backed and fallback song retrieval expose the same value.

## 2. Song management and detail display

- [x] 2.1 Update every create and edit song form/action to submit and persist the optional `strummingPattern` field, and verify a saved pattern is shown when the song is reopened for editing.
- [x] 2.2 Render a labeled strumming pattern in the standard song-detail header only when it is non-empty, and verify the header omits the element for a song without a pattern.
- [x] 2.3 Keep the strumming-pattern display outside `AutoScrollReader`, and verify entering play mode does not add metadata or change reader controls.

## 3. Verification

- [x] 3.1 Add focused tests for strumming-pattern data mapping and standard detail-header visibility, including absent and whitespace-only patterns, and verify the new tests pass.
- [x] 3.2 Run `npm run typecheck`, `npm run lint`, and the relevant Vitest suite to verify the migration-facing type changes and display behavior integrate cleanly.
