## 1. Per-song speed initialization

- [x] 1.1 Remove the shared browser-wide playback-speed override and rely on the current song's supplied speed or its existing default; preserve font-scale storage, and verify the reader initializes independently for two songs even when a legacy shared speed value exists.
- [x] 1.2 Add focused Vitest coverage for selecting/restoring each song's speed, including the default when no per-song value exists, and verify multiple adjustments issue no save until playback ends and then persist the final value exactly once on manual stop and natural completion.

## 2. Primary playback document persistence

- [x] 2.1 Apply the same deterministic `createdAt`-then-`id` ordering to primary-document loading and `updateScrollSpeedAction`; verify both code paths target the same document when a song has multiple documents or tied timestamps.
- [x] 2.2 Add focused Vitest coverage for updating the primary playback document and loading its saved speed; verify the relevant test file passes.

## 3. Integration validation

- [x] 3.1 Run the focused playback-speed tests and verify switching between songs and revisiting a song restores only that song's persisted speed.
- [x] 3.2 Run `npm run typecheck` and `npm run lint` and verify both complete successfully.
