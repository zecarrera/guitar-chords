## Context

`autoFormatChordSheet` (`lib/auto-format.ts`) classifies each row with `classifyChordRow`, pairs bare chord rows with a following non-bracket lyric row, and records instrumental rows, ambiguity warnings, and missing-diagram info. Safe fixes come from `planChordDocumentFixes` and are whitespace-only. `AutoFormatFeedback` renders the result. It never inspects layout consequences, so shapes that the reader stacks pass silently. The reader fix (`fix-chord-stacking-layout`) changes how overflow is rendered; this change gives authors early feedback on the same shapes.

## Goals / Non-Goals

**Goals:**
- Warn, per source line, about chord rows that overflow the paired lyric, consecutive chord-only rows, and tightly spaced chords.
- Keep detection consistent with reader pairing/column rules.
- Stay non-mutating and additive.

**Non-Goals:**
- Reader rendering changes, data migration, persistence, telemetry.
- Auto-merging rows, moving chords, or padding lyrics (would infer association or conflict with trailing-whitespace cleanup).

## Decisions

1. **Feedback-first, no new safe fixes.** Every remedy (pad lyric, merge rows, re-space chords) alters layout semantics, which the existing "safe fixes do not infer musical meaning" requirement forbids. Alternative: auto-pad lyric rows with spaces; rejected because the trailing-whitespace fix would undo it and it hides authoring intent.
2. **New diagnostic codes** `chord-overflows-lyric`, `consecutive-chord-rows`, `chords-too-close` added to `ChordSheetDiagnostic["code"]`, severity `warning`, with a suggested remedy in the message. The panel groups them as "Layout" separately from ambiguity warnings.
3. **Reuse recognition results.** Detect inside the existing loop using `recognizedPairs` token starts and lyric line length, and instrumental row adjacency from classification. Collision threshold: a gap smaller than the previous label length plus one space, matching the lane-collision rule in `layoutChordLanes`; extract a small shared helper if needed rather than duplicating the constant.
4. **Consecutive rows**: warn once per run starting at its first line (not per row) to avoid noise; intentional instrumental sections remain legitimate, so the message is advisory.
5. **Bracketed notation**: apply the inline-token variant of overflow/collision checks only where tokens come from the same positioned-line builder; otherwise skip rather than guess.

## Risks / Trade-offs

- False positives for deliberate instrumental runs → wording is advisory and severity is warning, not blocking.
- Drift from reader rules → covered by a parity test that runs identical fixtures through analysis and the reader layout helpers.
- Warning count inflation changes the "needs review" headline → update summary tests; no stored data affected.
- Privacy: diagnostics hold only line numbers and short messages; do not log or send sheet text.

## Migration Plan

Pure code change with no schema or data impact; ship with the app. Rollback by reverting the commit. Land after or alongside `fix-chord-stacking-layout`; neither depends on the other's merge.

## Open Questions

- Whether a later iteration should offer an explicit, user-confirmed (non-safe) "pad lyric" action.
