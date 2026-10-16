## 1. Preserve paired chord source positions

- [x] 1.1 Add parser regression cases for bracketed and bare chord rows whose later chord columns extend beyond short lyric rows; verify the parsed anchors remain distinct and match their original source columns.
- [x] 1.2 Remove lyric-length clamping from paired-row anchor creation and verify existing section parsing tests plus the new short-lyric cases pass.

## 2. Wrap overflow chords without collapsing or clipping

- [x] 2.1 Separate lyric-word ownership from out-of-range chord placement in the responsive layout; wrap overflow at chord-token boundaries with locally rebased columns and preserved source order, and verify no chord label exceeds the available column budget.
- [x] 2.2 Add layout tests for the screenshot pattern: a short lyric with multiple spaced chords beyond its end must not collapse or stack non-overlapping labels solely due to lyric length; verify narrow and wide column budgets preserve every chord exactly once and in order.
- [x] 2.3 Verify true chord-label collisions still use vertical lanes while separated source positions remain in the same lane; run the focused chord-line and chord-section test files.

## 3. Reader compatibility and validation

- [x] 3.1 Verify standalone consecutive chord-only rows remain separate and inline chord notation retains its existing behavior; run `npm run test -- lib/__tests__/chord-line-layout.test.ts lib/__tests__/chord-sections.test.ts`.
- [x] 3.2 Check song view and playback at narrow and wide widths to confirm short-lyric chord rows remain legible and no horizontal scrolling is introduced; run `npm run typecheck`, `npm run lint`, and `npm run build`.
