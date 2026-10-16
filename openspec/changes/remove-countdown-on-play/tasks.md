## 1. Reader changes

- [ ] 1.1 In `components/auto-scroll-reader.tsx`, remove the `countingDown` phase, `countdownValue` state, and the countdown ticking effect; make the layout-ready effect move `preparing` directly to `scrolling`
- [ ] 1.2 Remove `setCountdownValue(3)` from `startPlayback` and update `togglePlayback`/comments to the new phases
- [ ] 1.3 Simplify the overlay to show only "Preparing layout..." during `preparing` (no "Get ready" text or number)

## 2. Tests and validation

- [ ] 2.1 Extract the phase transition into a small pure helper if needed and add a Vitest case that layout-ready moves `preparing` to `scrolling` with no intermediate phase
- [ ] 2.2 Manually verify play and auto-play start scrolling without a counter and with no layout shift, and that the playlist "Next song in Ns" countdown still works
- [ ] 2.3 Run `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `openspec validate "remove-countdown-on-play" --strict`
