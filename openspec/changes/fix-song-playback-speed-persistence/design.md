## Context

See `proposal.md` for the motivation and `specs/song-playback-speed/spec.md` for the behavior contract. The reader currently reads and writes one shared browser speed key while the song data loader reads `scrollSpeed` from the oldest chord document. The update action instead selects an unordered document, so the reader and the save may address different records.

## Goals / Non-Goals

**Goals:**
- Use the current song's supplied `defaultSpeed` as the reader's initial speed, without a shared browser speed override.
- Preserve saving a changed speed when playback stops.
- Make loading and saving agree on one deterministic primary chord document.
- Leave the global font-scale preference unchanged.

**Non-Goals:**
- Add a schema migration, new storage system, or cross-device synchronization.
- Change the playback-speed controls, speed range, or the existing auto-save trigger.
- Migrate or delete the old browser-wide speed key; the reader will simply stop treating it as authoritative.

## Decisions

1. **Use the song's existing speed value as the initial reader speed.** `lib/data.ts` already maps the primary document's `scrollSpeed` into `Song.scrollSpeed`, and the reader receives it as `defaultSpeed`. Remove the shared speed snapshot and persistence path so that only the current reader's manual adjustment can override that value. Keep the font-scale storage path independent.
   - **Alternative considered:** Store speed in browser storage keyed by song slug. This would still split the source of truth between browser state and the database, and would not fix the action targeting a different chord document.

2. **Use an identical deterministic ordering for primary-document reads and speed writes.** Order chord documents by `createdAt` ascending and then `id` ascending in both `lib/data.ts` and `updateScrollSpeedAction`. The oldest document remains primary as before; the id tie-breaker resolves equal timestamps consistently.
   - **Alternative considered:** Update all chord documents for a song. This would change per-document semantics and could overwrite values unrelated to the primary playback document.

3. **Retain the existing save-on-stop behavior and database field.** Continue to save only when playback transitions from active to stopped and the chosen speed differs from the song's supplied default. No data migration is needed; only future user-triggered saves write the primary document's speed.
   - Keep persistence batched at playback end: speed adjustments update reader state locally, and the final chosen value is saved once when playback stops manually or reaches the end. Do not call the server action for every adjustment.

## Risks / Trade-offs

- [A previously stored browser-wide speed will no longer affect any song] -> This is intentional; each song's stored speed or the existing reader default becomes authoritative. The old local-storage value is left in place but unused.
- [Existing chord documents may share a creation timestamp] -> Both code paths use the same id tie-breaker, keeping primary-document selection stable.
- [A deployment rollback restores the old shared-speed behavior] -> No schema change is introduced, so rollback requires only reverting the application deployment; user-saved values remain in the existing document field.

## Migration Plan

Deploy the application change without a database migration. Validate that different songs retain independent speeds and that a multi-document song saves and reloads speed through its primary document. If rollback is needed, redeploy the previous application version; no data cleanup is required.
