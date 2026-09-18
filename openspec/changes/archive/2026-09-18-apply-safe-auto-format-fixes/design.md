## Context

See `proposal.md` for motivation. The current formatter returns `formattedText` after immediately applying safe document normalization, and both editor callers replace the textarea value as part of **Analyze Format**. Its diagnostics do not distinguish actionable deterministic edits from recommendations requiring user judgment.

The relevant logic is already pure and client-safe: chord analysis lives in `lib/auto-format.ts`, safe normalization lives in `lib/chord-document-text.ts`, and both editor surfaces share `AutoFormatFeedback`. No persistence, identity, external service, telemetry, or database change is needed.

## Goals / Non-Goals

**Goals:**

- Make analysis observational and move deterministic mutation behind explicit user intent.
- Produce a typed, explainable fix plan from the same source snapshot used for analysis.
- Apply every safe fix atomically, reject stale plans, and immediately reanalyze.
- Preserve chord anchors and retain unresolved recommendations.
- Keep behavior identical across both editor entry points.

**Non-Goals:**

- Repair malformed bracket syntax or infer intended chords, repeats, bars, sections, or lyric associations.
- Add per-fix selection or undo history beyond normal textarea/browser editing.
- Save automatically after applying fixes.
- Add server-side state, persistence, telemetry, or third-party dependencies.

## Decisions

### 1. Separate source, projected text, and analysis outcomes

`autoFormatChordSheet` will analyze the exact input without mutating the textarea. Its result will identify the analyzed source snapshot, a deterministic projected text, safe-fix summaries, recognized structures, and unresolved diagnostics.

Structural results shown before application describe the current source. Applying fixes always triggers a fresh analysis rather than attempting to adjust previous line numbers or anchors.

Alternative considered: continue replacing the textarea during analysis and add a second button for other fixes. Rejected because the user cannot distinguish analysis from mutation and cannot review the initial changes.

### 2. Generate one deterministic fix plan

Refactor text normalization to expose both its normalized output and typed fix summaries. Initial safe-fix categories are:

- canonicalize CRLF or CR line endings to LF;
- replace non-breaking spaces with ordinary spaces;
- remove blank space outside document content;
- collapse each run of internal blank lines to one section boundary;
- remove trailing whitespace from nonblank lines;
- expand tabs to spaces at fixed eight-column tab stops.

Tab expansion computes the current character column and inserts enough spaces to reach the next tab stop. The editor and reader-facing text areas will declare the same tab width so the preview and deterministic conversion agree. Internal ordinary spaces are never collapsed.

Alternative considered: represent every replacement as a UI-selectable patch. Rejected because the selected product behavior is one bulk action and per-edit controls add complexity without improving the deterministic safety boundary.

### 3. Apply from an immutable source snapshot

The fix result will retain the source text in client memory and expose a pure apply helper that succeeds only when the current textarea value exactly matches that source. On success it returns the projected text; on mismatch it returns an explicit stale-result outcome and does not mutate.

The editor also clears feedback on ordinary input events, preventing a stale button from normally remaining visible. Exact source validation remains the correctness guard for programmatic changes and event-order races.

Alternative considered: hash the text. Rejected because hashing adds no security property in this local client flow and still requires collision-safe comparison for correctness.

### 4. Apply atomically and reanalyze

Both editors will use a shared interaction helper or component contract:

```text
Analyze
   |
   v
result(source, projectedText, safeFixes, recommendations)
   |
   +--> no safe fixes: show findings only
   |
   +--> Apply safe fixes
            |
            +--> source matches --> replace once --> dispatch input --> reanalyze
            |
            +--> source differs  --> preserve text --> request fresh analysis
```

The textarea receives one replacement, so partial application cannot occur. The post-apply result is rendered immediately and unresolved recommendations stay visible.

### 5. Keep fix metadata concise and non-sensitive

Each safe-fix summary has a stable code, human-readable description, and occurrence count. UI output does not embed raw source fragments. The source snapshot and projected text remain transient client state and must not be logged or emitted to telemetry.

This feature adds no Application Insights events. If telemetry is added later, only aggregate fix codes and counts may be considered; chord-sheet text and replacement values remain excluded.

### 6. Verify semantics at pure and UI boundaries

Pure tests will cover every fix category, eight-column tab expansion, idempotency, atomic application, stale rejection, and preservation of chord columns. Formatter tests will prove unresolved musical recommendations survive reanalysis.

Shared feedback component tests will cover button visibility, fix summaries, and residual warnings. Browser validation will exercise both add and edit flows, including text changed after analysis.

## Risks / Trade-offs

- [Trailing whitespace may be intentionally authored] -> Limit removal to line ends, never internal spacing, and describe it before application.
- [Tab width can differ across environments] -> Set and document an explicit eight-column tab size in editor presentation and use the same value during expansion.
- [Normalization can change diagnostic line numbers] -> Rerun analysis after applying fixes and render only the new result.
- [Source snapshots duplicate chord-sheet content in memory] -> Keep them transient in existing client state and never log or send them to telemetry.
- [A future safe-fix category may cross into musical inference] -> Require every new category to prove deterministic output and non-semantic behavior through specification and focused tests.

## Migration Plan

1. Add fix-plan generation and application helpers while retaining current normalization for save/import paths.
2. Update formatter results and tests so analysis preserves input and reports projected changes.
3. Add shared feedback and apply behavior to both editors.
4. Validate safe-fix and residual-recommendation flows, then deploy with no data migration.

Rollback restores immediate analysis-time normalization. No stored schema changes or background migrations are involved; text already fixed by a user remains valid chord-sheet content.
