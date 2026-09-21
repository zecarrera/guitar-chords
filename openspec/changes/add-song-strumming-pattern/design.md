## Context

See `proposal.md` for motivation. The app exposes song metadata through the `Song` type, with `lib/data.ts` mapping Prisma reads and `lib/demo-data.ts` providing the database-unavailable fallback. `components/song-page-shell.tsx` renders a normal song header before delegating the reader to `AutoScrollReader`; it currently shows a non-empty `difficulty` value without a label even though management forms call that value “Strumming Pattern.”

## Goals / Non-Goals

**Goals:**
- Represent strumming patterns as dedicated optional song metadata across database-backed and demo-backed data paths.
- Show a clearly labeled pattern in the standard song header only when one exists.
- Preserve existing stored values during the field transition.

**Non-Goals:**
- Changing play-mode reader layout, controls, or scroll behavior.
- Defining or validating strumming notation.
- Adding automatic pattern extraction from chord documents.

## Decisions

### Use a dedicated nullable `strummingPattern` song field

Replace the overloaded persistence and application use of `difficulty` with `strummingPattern`, and update form names, write actions, seed data, demo data, and database mapping together. This reflects the current management intent and keeps the fallback and database-backed data contracts aligned.

The alternative of retaining `difficulty` as an internal name would avoid a migration but preserve the misleading model and leave future difficulty support ambiguous.

### Preserve legacy values with a data migration

Create a Prisma migration that adds the nullable field and copies every existing non-null legacy value to it before removing the legacy column. The migration remains safe for empty databases and preserves records that already contain a pattern.

The alternative of discarding the legacy values is incompatible with existing library data. Keeping both fields indefinitely would prolong duplicate sources of truth.

### Render labeled metadata outside the reader

Render `Strumming: <pattern>` in the `SongPageShell` summary header when the normalized value is non-empty. Do not pass it to `AutoScrollReader`; this preserves the requested separation from play mode and limits layout changes to standard song viewing.

The alternative of adding it to the reader would show it in play mode and change playback layout, contrary to scope.

## Risks / Trade-offs

- [Database migrations run during deployment] → Add and backfill the new column before dropping the legacy one, and validate migration application on a database containing legacy values.
- [A blank or whitespace-only pattern could create visual noise] → Normalize optional form input and render only non-empty values.
- [Database and demo paths could diverge] → Update their shared `Song` contract and add focused coverage for both mapping and header visibility.

## Migration Plan

1. Add `strummingPattern` as nullable song metadata and backfill it from the legacy column.
2. Deploy the corresponding application code, seed data, and fallback data together.
3. Remove the legacy `difficulty` field after backfill in the same reviewed migration sequence.
4. Roll back application code only with a migration-aware release; the new nullable field and copied values are additive until the legacy column removal, so restore the prior application version before reversing a failed schema rollout.
