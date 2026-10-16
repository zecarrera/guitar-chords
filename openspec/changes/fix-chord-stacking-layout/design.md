## Context

See `proposal.md` for the observed behavior and `specs/chord-reader-layout/spec.md` for the layout contract. Paired chord rows are parsed in `lib/chord-sections.ts`, then wrapped and assigned chord lanes in `lib/chord-line-layout.ts`. Parsing currently clamps source chord columns to the lyric length; wrapping also clamps ownership lookup to the lyric end. The former collapses distinct anchors, and the latter treats all anchors beyond the lyrics as belonging to the same final position.

## Goals / Non-Goals

**Goals:**
- Keep source chord columns immutable and separate from lyric-word ownership.
- Preserve distinct horizontal positions for chords past the lyric text.
- Wrap chord positions that exceed the reader width without splitting labels or reordering them.
- Keep collision lanes for labels that genuinely overlap at their preserved positions.

**Non-Goals:**
- Merge consecutive standalone chord-only rows or otherwise reinterpret their authored line breaks.
- Change chord classification, stored source text, or the responsive font-size behavior.
- Add a dependency, data migration, or new persistence behavior.

## Decisions

1. **Do not clamp paired-row source columns to lyric length.** `buildAnchoredLine` should retain each parsed token's source start column. A source anchor beyond the lyric text is still meaningful horizontal layout information, even when no lyric word exists at that exact offset.
   - **Alternative considered:** Leave the anchor clamp and modify lane spacing. Rejected because lane layout cannot recover the distinct source positions after they have already been collapsed.
   - **Alternative considered:** Stop pairing when chord columns exceed lyric length. Rejected because it would make the existing paired notation behavior dependent on lyric length and split a logical source line into unrelated rendering paths.

2. **Separate lyric ownership from chord placement during wrapping.** Use lyric ownership only to associate anchors that fall within lyric content. Preserve out-of-range source columns for display rather than treating every one as the lyric's final column. Partition overflow at safe chord boundaries into additional visual rows, rebasing columns locally per row while retaining source order and the existing no-horizontal-scroll contract.
   - **Alternative considered:** Place all out-of-range chords in extra vertical lanes at the end of the lyric row. Rejected because it reproduces the stacked appearance even when their source columns do not overlap.
   - **Alternative considered:** Render the chord source row in an independent horizontal-scroll region. Rejected because it conflicts with the existing requirement that chord sheets need no horizontal scrolling.

3. **Apply collision lanes only after source-position ownership and wrapping.** Labels that actually overlap at their retained row-local columns may use lanes; different, non-overlapping positions must not be moved into lanes merely because lyric text ended earlier. Standalone chord-only rows continue through their current independent path.

## Risks / Trade-offs

- [Large source-column gaps can require additional visual rows on narrow screens] -> Preserve the existing width budget, break only at chord-token boundaries, and verify that every chord remains visible and ordered.
- [A chord beyond the lyric text has no word at its anchor] -> Treat it as a positioned chord in the logical line rather than inventing a lyric association; keep actual lyric ownership rules unchanged for in-range anchors.
- [Changes to row partitioning could affect ordinary paired and inline notation] -> Retain current word-boundary behavior for lyric text and add regression coverage for existing layouts alongside short-lyric cases.
- [The first screenshot also contains consecutive standalone chord rows] -> Keep these rows separate as authored; only revisit this if source inspection demonstrates that row breaks were introduced by extraction.

## Migration Plan

No data migration is required because stored source text is not rewritten. Add parser and wrapping regression tests first, implement anchor retention and overflow row handling, then validate both song viewing and playback at narrow and wide widths. Rollback consists of reverting the parser/layout change.
