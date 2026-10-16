## 1. Detection

- [ ] 1.1 Extend `ChordSheetDiagnostic["code"]` in `lib/auto-format.ts` with `chord-overflows-lyric`, `consecutive-chord-rows`, and `chords-too-close`
- [ ] 1.2 Add overflow detection for paired chord rows whose chord start is at or beyond the lyric row length, with a remedy in the message
- [ ] 1.3 Add consecutive chord-only row detection that warns once per run at its first line
- [ ] 1.4 Add tight-spacing detection that shares the lane-collision rule with `lib/chord-line-layout.ts` (extract a helper if needed)
- [ ] 1.5 Confirm none of the new findings enter `safeFixes` or change `projectedText`

## 2. Editor feedback

- [ ] 2.1 Update `components/auto-format-feedback.tsx` to list layout warnings with line numbers and remedies, separate from ambiguity warnings, and include them in the review count

## 3. Tests and validation

- [ ] 3.1 Add cases to `lib/__tests__/auto-format.test.ts` for overflow, consecutive rows, tight spacing, well-formed input, non-mutation, and coexistence with safe fixes
- [ ] 3.2 Add a parity test comparing analysis findings with reader layout helpers on shared fixtures
- [ ] 3.3 Update `lib/__tests__/auto-format-feedback.test.tsx` for rendering and summary counts
- [ ] 3.4 Run `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `openspec validate "add-chord-layout-auto-format-feedback" --strict`
