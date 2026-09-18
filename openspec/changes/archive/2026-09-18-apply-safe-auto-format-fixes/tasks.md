## 1. Deterministic Fix Planning

- [x] 1.1 Refactor chord-document normalization to return normalized text plus typed fix summaries for line endings, non-breaking spaces, outer blank space, redundant blank runs, trailing whitespace, and tabs, and verify focused tests cover each category and occurrence count.
- [x] 1.2 Implement eight-column tab-stop expansion and expose the shared tab width for editor presentation, and verify tests preserve the visual start column of chord tokens after tabs are replaced.
- [x] 1.3 Preserve the existing save/import normalization API on top of the new fix planner, and verify current create, update, and PDF normalization behavior remains compatible.

## 2. Source-Preserving Analysis and Application

- [x] 2.1 Update the format-analysis result to retain the analyzed source, projected fixed text, and safe-fix summaries without changing the source, and verify analysis tests assert input preservation.
- [x] 2.2 Add a pure atomic apply helper that returns projected text only for an exact source match and rejects stale or invalid plans without partial output, and verify success and rejection tests.
- [x] 2.3 Keep malformed brackets, bar/repeat annotations, missing diagrams, and other musical recommendations outside the safe-fix plan, and verify they remain unchanged after fixes and post-fix reanalysis.
- [x] 2.4 Verify applying safe fixes is idempotent and preserves ordinary internal spacing, chord order, and chord-to-lyric anchors with pipeline tests.

## 3. Shared Editor Experience

- [x] 3.1 Extend shared format feedback to summarize available fix categories and counts and show **Apply safe fixes** only when fixes exist, and verify clean, fixable, and recommendation-only render states.
- [x] 3.2 Update the active add/edit modal so analysis does not mutate text, applying fixes performs one replacement and input event, and the updated content is immediately reanalyzed; verify component behavior and stale-result clearing.
- [x] 3.3 Apply the same interaction to the alternate song-document fields and share logic where practical, and verify both editor surfaces produce equivalent results.
- [x] 3.4 Set the editor text areas to the shared eight-column tab width and update concise help text to distinguish safe automatic cleanup from recommendations requiring manual review.

## 4. End-to-End Verification

- [x] 4.1 Validate add and edit flows in a supported browser: analysis preserves text, bulk fixes update it once, unresolved recommendations remain, and editing after analysis prevents stale application.
- [x] 4.2 Run the targeted formatter, normalization, feedback, section, and layout tests, then run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` and resolve regressions introduced by this change.
