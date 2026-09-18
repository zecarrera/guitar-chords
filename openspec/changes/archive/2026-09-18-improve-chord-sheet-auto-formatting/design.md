## Context

See `proposal.md` for motivation. The current pipeline has three independent chord classifiers: Auto Format uses a broad token regex, save/PDF normalization combines a narrower regex with diagram lookup, and the reader only treats fully bracketed rows as pairable. Both formatting paths add bracket characters in place, shifting later chord start columns while leaving the lyric row unchanged.

The reader already has an immutable `anchorColumn` model and responsive layout. The missing invariant is that parsing must derive each anchor from the authored chord token's original start column before any display decoration. Existing stored documents use bracketed inline and two-line notation and must remain compatible.

## Goals / Non-Goals

**Goals:**

- Establish one reusable syntactic chord parser for editor analysis, imports, and play-mode parsing.
- Preserve authored columns for bare two-line notation and avoid semantic changes during automatic saves.
- Represent Auto Format as analysis plus safe formatting, with source-addressable diagnostics.
- Keep syntax recognition independent from optional chord-diagram availability.
- Preserve all currently supported bracketed documents.

**Non-Goals:**

- Automatically repair ambiguous chord sheets or infer user intent from mixed annotations.
- Convert all stored chord sheets to a new representation or run a database migration.
- Add diagrams for every syntactically valid chord.
- Support proportional-font or grapheme-cell column measurement.
- Redesign general section-title inference beyond reporting relevant ambiguity.

## Decisions

### 1. Introduce a shared chord-syntax analyzer

Create a small domain module that parses bare and bracketed chord labels and returns normalized metadata plus exact source ranges. It will recognize conventional roots, accidentals, qualities, extensions, alterations, and slash bass notes without consulting the chord-shape library.

Line classification will be strict: a chord-only row must consist entirely of recognized chord tokens and whitespace. Bar markers, repeat counts, comments, malformed brackets, tabs with uncertain display width, and mixed content make the row ambiguous unless explicitly supported by the grammar.

Diagram lookup remains a second operation over recognized chord names. This avoids rejecting playable labels such as `G13` merely because the local diagram catalog is incomplete.

Alternative considered: use the diagram library as the grammar. Rejected because diagram coverage is intentionally narrower than valid chord notation.

### 2. Preserve bare two-line notation as the canonical result

Auto Format will not bracket bare chord rows. A bare chord row followed by eligible lyrics remains readable in the editor, and token source offsets remain the authoritative anchors. Existing bracketed rows remain unchanged.

The reader's logical-line builder will accept parsed bare or bracketed chord-only rows. Bare annotations can use bracketed labels for display while retaining the original bare token start as `anchorColumn`; display label width must never feed back into ownership.

Alternative considered: merge each pair into inline notation. This would encode association explicitly but would make pasted sheets harder to edit and require insertion into lyric text at clamped positions.

Alternative considered: insert brackets and subtract accumulated bracket width. This creates representation-dependent offsets and remains fragile when users mix generated and authored brackets.

### 3. Return a structured formatter result

Replace the string-only formatter contract with a result containing:

- `formattedText`
- recognized paired-row outcomes
- recognized instrumental-row outcomes
- diagnostics with severity, stable code, one-based line number, and message
- recognized chord labels that lack diagrams

The initial transformation is intentionally conservative: canonical line-ending/space cleanup may occur, but confidently recognized bare and existing bracketed notation remain textually unchanged. Ambiguous rows are never partially transformed.

Both editor callers will share presentation behavior for success summaries and warnings. Diagnostics clear or refresh when the content changes so stale results are not shown as current.

Alternative considered: keep a string return and run a second validator. Rejected because two passes could disagree and would duplicate parsing.

### 4. Separate safe normalization from explicit analysis

Refactor document normalization into a safe layout-only operation used consistently by manual create, manual update, and PDF extraction. It may normalize CRLF, non-breaking spaces, excessive outer whitespace, and redundant blank spacing only where section boundaries remain semantically equivalent. It must not bracket or otherwise reinterpret chord tokens.

Auto Format remains an explicit editor action that analyzes the entire document and reports findings. Saving does not require users to run it because the play-mode parser understands confident bare rows directly.

Alternative considered: run structural formatting automatically on every save. Rejected because it would silently reinterpret ambiguous user-authored content and make create/update edits surprising.

### 5. Preserve strict pairing eligibility

Bare and bracketed chord rows share the same adjacency rules: pair only with an immediate, nonempty lyric row that is neither chord-only nor bracket-containing. Consecutive chord rows and terminal chord rows remain instrumental. Chords beyond lyric length retain the current endpoint-clamping behavior.

Mixed or malformed rows remain ordinary text in play mode and receive editor diagnostics rather than best-effort partial parsing.

### 6. Test contracts at pipeline boundaries

Unit tests will cover shared syntax/range parsing, formatter diagnostics and idempotency, safe normalization, and section parsing. Integration-style fixtures will pass representative documents through normalization, Auto Format, section parsing, and responsive layout to prove that original chord anchors survive every supported font/width calculation.

Compatibility fixtures will retain existing inline and bracketed two-line behavior. Action-path tests or extracted helpers will verify create and update normalization parity.

## Risks / Trade-offs

- [A lyric line containing only chord-like words can be classified as a chord row] -> Require every token to satisfy the strict grammar, use adjacency context, and expose the classification in editor diagnostics.
- [Expanding chord syntax can introduce false positives] -> Keep the grammar explicit and fixture-driven; classify unsupported decorations as ambiguous rather than stripping them.
- [Tabs do not have stable character-column semantics] -> Warn and preserve tab-containing candidate rows until a separate tab-expansion policy is specified.
- [Older bracketed rows may already contain shifted anchors] -> Preserve them for compatibility; do not attempt an irreversible automatic repair without source provenance.
- [PDF extraction may become less immediately decorated] -> Rely on bare-row reader support and expose diagnostics during review, consistent with review-first imports.

## Migration Plan

1. Add the shared analyzer and tests without changing existing callers.
2. Extend reader parsing to accept bare chord-only rows while retaining bracketed fixtures.
3. switch Auto Format to structured, non-destructive results and update both editor callers.
4. Replace semantic save/PDF bracketing with safe normalization across create and update paths.
5. Validate representative existing bracketed documents and new bare documents through editor preview and play mode.

Rollback can restore the prior callers and normalizer because no stored-data migration is performed. Documents saved as bare notation during rollout would render as plain rows under the old parser, so reader support and safe-save behavior should deploy atomically.
