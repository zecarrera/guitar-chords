## 1. Shared Chord Analysis

- [x] 1.1 Add a shared chord-syntax analyzer for bare and bracketed labels that returns normalized names and exact source ranges, and verify unit tests cover roots, accidentals, qualities, extensions, alterations, slash bass notes, and invalid tokens.
- [x] 1.2 Add strict chord-row classification using the shared analyzer, including explicit ambiguous results for mixed annotations, bar separators, malformed brackets, and tabs, and verify each classification with focused tests.
- [x] 1.3 Keep chord syntax independent from diagram lookup while reporting recognized chords without shapes, and verify valid unknown chords such as `G13` and `Cmaj9` remain recognized.

## 2. Reader Compatibility

- [x] 2.1 Update section parsing to build anchored logical lines from confident bare chord-row/lyric-row pairs using original token start columns, and verify chord-section tests assert unchanged anchors for multiple spaced chords.
- [x] 2.2 Support bare consecutive and terminal chord rows as standalone instrumental sequences while preserving strict pairing eligibility, and verify reader parsing tests cover instrumental, ambiguous, and bracket-containing follower rows.
- [x] 2.3 Retain existing inline and bracketed two-line behavior, including trailing-anchor clamping, and verify the complete chord-section and chord-layout test suites pass.
- [x] 2.4 Add pipeline fixtures that pass bare paired notation through parsing and responsive wrapping at different column budgets, and verify every chord remains associated with the same lyric anchor.

## 3. Non-Destructive Auto Format

- [x] 3.1 Replace the string-only Auto Format contract with a structured result containing formatted text, recognized pairs, instrumental rows, line-addressable diagnostics, and missing-diagram information, and verify result-shape tests cover confident and warning cases.
- [x] 3.2 Preserve confident bare rows, existing bracketed notation, ambiguous rows, and internal section boundaries without bracket insertion or partial rewrites, and verify idempotency and source-column tests replace the old bracket-wrapping expectations.
- [x] 3.3 Ensure malformed brackets, mixed `x2` annotations, bar-delimited progressions, and tab-containing candidate rows remain unchanged with actionable warning codes and line numbers, and verify focused formatter tests pass.

## 4. Safe Save and Import Normalization

- [x] 4.1 Refactor document normalization to perform only safe line-ending, non-breaking-space, outer-whitespace, and section-preserving cleanup, and verify dedicated normalization tests prove chord tokens and source columns never change.
- [x] 4.2 Apply the same safe normalizer to manual create, manual update, modal create, modal update, and PDF extraction paths, and verify create/update parity through action-helper tests or extracted pure-function tests.
- [x] 4.3 Remove partial save-time and PDF chord bracketing, and verify representative bare, unknown, mixed, and bar-delimited rows survive normalization unchanged.

## 5. Editor Diagnostics

- [x] 5.1 Update the active add/edit song modal to consume structured Auto Format results and display recognized-structure summaries plus line-numbered warnings, and verify component behavior for clean and ambiguous content.
- [x] 5.2 Update the alternate song document fields to use the same formatter-result presentation instead of unconditional success, and verify both editor entry points clear stale diagnostics after content changes.
- [x] 5.3 Update editor help text and examples to document supported inline, bracketed two-line, and bare two-line notation, and verify the rendered guidance no longer implies brackets are required.

## 6. End-to-End Verification

- [x] 6.1 Add compatibility fixtures for existing bracketed documents and new bare documents across Auto Format, normalization, section parsing, and layout, and verify the targeted Vitest suites pass.
- [x] 6.2 Verify the active add and edit flows preserve bare chord columns, surface ambiguous-line diagnostics, and render chords over the same lyrics at 80% and 150% reader font scales.
- [x] 6.3 Run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`, then resolve regressions introduced by this change.
