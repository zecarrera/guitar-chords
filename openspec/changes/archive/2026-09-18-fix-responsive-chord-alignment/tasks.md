## 1. Logical Chord-Line Model

- [x] 1.1 Extend the chord layout types to distinguish immutable lyric anchor columns from derived display placement, and verify TypeScript rejects use of display columns for wrap ownership with `npm run typecheck`.
- [x] 1.2 Add parsing tests for dense inline notation such as `[Am]I [G]am [F]here`, then update inline parsing so every chord retains its exact lyric anchor and verify the targeted chord-line layout tests pass.
- [x] 1.3 Add section parsing tests for strict chord-only plus lyric pairs, consecutive chord-only rows, terminal chord rows, and existing inline rows; implement non-destructive logical pairing and verify the targeted section tests pass.

## 2. Anchor-Based Responsive Layout

- [x] 2.1 Refactor lyric-bearing wrapping to derive boundaries from lyric word spans and assign chords by immutable anchor, including deterministic whitespace-boundary behavior; verify tests cover narrow widths that previously separated chords from their words.
- [x] 2.2 Preserve standalone instrumental wrapping through chord-token boundaries and verify every chord remains whole, appears exactly once, and retains source order.
- [x] 2.3 Add deterministic chord-lane collision layout for overlapping labels without horizontal anchor shifts, and verify unit tests cover adjacent short words, long chord labels, and three or more colliding labels.

## 3. Reader Rendering and Measurement

- [x] 3.1 Update `AutoScrollReader` to render logical anchored lines and variable chord lanes while preserving chord tooltip, show/hide, fixed font-scale, and no-horizontal-scroll behavior; verify `npm run typecheck` and targeted reader behavior.
- [x] 3.2 Observe the actual reader content width with `ResizeObserver`, keep the character probe's font metrics aligned with rendered content, and update column state only when its value changes; verify width changes from viewport and surrounding layout trigger rewrapping.
- [x] 3.3 Ensure layout measurement settles before the play countdown and that lane height participates in scroll completion; verify play, pause, countdown, and playlist auto-advance behavior manually at 80%, 100%, and 150% font scales.

## 4. Compatibility and Validation

- [x] 4.1 Verify the song page, artist playlist player, and editor preview render existing inline demo songs, paired two-line imports, and standalone instrumental rows consistently at narrow and desktop widths.
- [x] 4.2 Run `npm run test -- lib/__tests__/chord-line-layout.test.ts lib/__tests__/chord-sections.test.ts lib/__tests__/auto-format.test.ts`, adding or adjusting the section test path if the repository convention requires it, and confirm all targeted behavior passes.
- [x] 4.3 Run `npm run typecheck`, `npm run lint`, and `npm run build` to verify the completed change preserves type safety, lint rules, and the production Next.js build.
- [x] 4.4 Decode artist route parameters before playlist lookup and verify generated links for artist names containing spaces return the playlist page instead of 404.
