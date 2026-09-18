## Why

Format analysis can identify problems, but users must currently interpret every result and edit the chord sheet manually. Deterministic cleanup can be applied safely without guessing musical meaning, while ambiguous notation should remain visible for manual review.

## What Changes

- Separate analysis from mutation so running format analysis never changes editor content.
- Include an ordered, previewable safe-fix plan in analysis results for deterministic text cleanup.
- Add one **Apply safe fixes** action that applies all still-valid safe edits atomically and reruns analysis.
- Show how many fixes are available and what they will change before application.
- Keep ambiguous chord syntax, bar/repeat annotations, malformed brackets, missing diagrams, and other semantic recommendations unchanged after safe fixes.
- Prevent stale analysis results from being applied after the source text changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chord-sheet-formatting`: Adds deterministic fix planning, explicit bulk application, post-fix reanalysis, and retention of recommendations that require user judgment.

## Impact

- Extends `lib/auto-format.ts` with source-preserving analysis and a typed safe-fix plan.
- Reuses or refactors `lib/chord-document-text.ts` so normalization can describe edits instead of applying them during analysis.
- Updates `components/auto-format-feedback.tsx` and both add/edit document surfaces to expose and apply safe fixes.
- Adds focused tests for fix planning, atomic application, idempotency, stale-result rejection, source-anchor preservation, and remaining recommendations.
- No database, authorization, deployment, secret-management, email, or telemetry changes are required.
