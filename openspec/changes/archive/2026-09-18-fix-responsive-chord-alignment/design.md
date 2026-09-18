## Context

See `proposal.md` for motivation. The reader currently parses each text row independently into lyric text and chord columns, measures one monospace character to derive a wrapping budget, and renders labels at absolute `ch` offsets. A single mutable column currently serves as both the lyric anchor and the collision-adjusted label position. The import and editor paths also preserve traditional chord-only rows above lyric rows, but the reader has no model connecting those adjacent rows.

The existing `chord-reader-layout` specification requires fixed user-selected typography, word-boundary wrapping, no horizontal scrolling, and preserved chord alignment. The solution must retain those behaviors across the song page, playlist player, and editor preview without changing stored database records.

## Goals / Non-Goals

**Goals:**

- Use one logical representation for inline chord notation and safely paired chord-row/lyric-row notation.
- Keep a chord's semantic lyric anchor immutable through parsing, wrapping, and collision handling.
- Recompute responsive wrapping from the actual reader width and current typography.
- Keep instrumental-only chord rows and existing inline content compatible.
- Make the layout logic deterministic and unit-testable outside React.

**Non-Goals:**

- Rewriting stored chord documents or migrating the database.
- Inferring chord timing, beats, syllable-level musical semantics, or playback synchronization.
- Supporting proportional reader fonts; character-column alignment continues to rely on the configured monospace font.
- Correcting ambiguous or already misaligned whitespace in imported source documents.

## Decisions

### Represent semantic anchors separately from rendered label placement

Each parsed chord will retain an immutable lyric `anchorColumn`. Wrapping will assign the chord to a visual row using only this anchor and the lyric row boundaries. Render-time collision layout may derive a separate row-local display position or lane, but it must not feed back into wrapping or ownership.

This separates two concerns:

```text
source token --> lyric anchor --> wrapped lyric row
                                      |
                                      v
                              collision layout
                                      |
                                      v
                              rendered chord label
```

**Alternative considered:** Continue pushing later chord columns to the right. This is simpler, but it changes the semantic association and can move a chord across a responsive wrap boundary.

### Normalize eligible adjacent rows into a logical chord line at section parsing

Section parsing will scan content rows in order. A row containing only bracketed chord tokens and whitespace may pair with the immediately following row when that following row contains lyric content rather than another chord-only sequence or a section boundary. The parser will convert chord token start columns into anchors on the following lyric text and emit one logical reader line. Inline rows remain directly parseable, while unmatched chord-only rows remain standalone.

The public `ChordSection` shape should be extended only as needed to represent logical lines explicitly; pairing should not be encoded by synthesizing inline text because inserting bracket tokens changes source columns and reintroduces ambiguous spacing.

**Alternative considered:** Pair rows inside the React renderer. This would duplicate parsing decisions across render surfaces and leave section-level behavior harder to test.

**Alternative considered:** Permanently rewrite imported text into inline notation. This is destructive, can alter reviewed source assets, and requires a migration strategy that is unnecessary for a rendering correction.

### Wrap lyrics first and place chords by anchor ownership

For lyric-bearing logical lines, row boundaries will be computed from lyric word spans and the available column budget. A chord belongs to the row whose source range contains its anchor. A chord anchored in whitespace at a boundary will use a deterministic boundary rule favoring the following lyric position so it remains with the word it precedes.

Line breaking will reserve enough width for each chord label at its immutable anchor. When a label would cross the right edge, the associated lyric word and chord move together to the next visual row when that can make the label fit. Label width may therefore influence a wrap boundary, but it never changes the chord's source anchor or associates it with a different word.

Standalone chord-only runs will continue to use chord token boundaries because they have no lyric anchors to govern wrapping.

**Alternative considered:** Ignore chord-label width when selecting lyric boundaries. This keeps lyric wrapping independent, but a long label near the right edge can clip despite the no-horizontal-scroll requirement. Shifting only the label left was also rejected because it weakens visual alignment with the intended lyric position.

### Resolve dense labels using chord lanes

Within each visual lyric row, chord labels will initially render at their anchor columns. Labels that overlap at those positions will be assigned to additional vertical chord lanes rather than shifted away from their anchors. The lyric row height will account for the number of lanes. This preserves exact horizontal association and avoids clipping labels.

**Alternative considered:** Shift labels horizontally while retaining a separate anchor. This preserves row ownership but can still make the chord appear above a later word, especially at larger font sizes.

### Observe actual reader width

The reader will use `ResizeObserver` on the content container to trigger column-capacity recalculation whenever its content box changes. Font-scale changes and font readiness remain explicit measurement inputs. The measured probe and rendered content must inherit the same monospace family, font size, and relevant font metrics.

**Alternative considered:** Depend only on viewport resize and React layout state. This misses width changes caused by surrounding component layout, including side-panel and play-mode transitions.

## Risks / Trade-offs

- **[Ambiguous two-line input may be paired incorrectly]** -> Pair only a strict chord-only row with an immediate non-chord lyric row; preserve uncertain and chord-followed rows as standalone content.
- **[Whitespace columns may not represent intended musical semantics]** -> Preserve source columns faithfully and avoid inventing word associations beyond deterministic boundary handling.
- **[Additional chord lanes increase vertical height and affect scroll duration]** -> Let the existing scroll-height calculation use the rendered height; verify completion behavior with dense examples.
- **[Unicode text can make JavaScript offsets differ from perceived glyph columns]** -> Continue documenting monospace character-column semantics for this change and cover common accented Latin lyrics; defer grapheme-cell support unless real content demonstrates a failure.
- **[Resize observation can cause render/measure loops]** -> Update state only when the computed column count changes and observe the stable content-box width rather than rendered scroll width.

## Migration Plan

1. Introduce the logical anchored-line model and parsing adapters while retaining compatibility with existing string lines.
2. Replace wrap ownership and collision calculations with anchor-based behavior.
3. Switch reader measurement to observe actual width.
4. Validate existing inline demo songs, imported two-line notation, standalone instrumental rows, playlist mode, and editor preview.

No stored-data migration is required. Rollback consists of reverting the parser and renderer changes; source documents remain unchanged.

The playlist validation surface currently receives percent-encoded artist names
from the dynamic route. Decode the route parameter at the page boundary before
metadata generation and song lookup so the existing exact-name data API remains
unchanged.
