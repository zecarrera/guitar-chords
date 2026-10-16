## ADDED Requirements

### Requirement: Auto Format reports chord-layout stacking risks
Auto Format analysis SHALL identify source shapes that can cause chords to render stacked instead of sequentially and SHALL report each as a warning that names the affected source line, explains the risk, and suggests a manual remedy. These findings SHALL be distinguishable from ambiguity and malformed-notation warnings. Analysis SHALL NOT change the editor text when reporting them.

#### Scenario: Chords extend past the paired lyric
- **WHEN** a recognized chord-only row is paired with a lyric row and one or more chords start at or beyond the end of that lyric row
- **THEN** analysis returns a layout-risk warning for the chord row's source line stating that the chords extend past the lyric

#### Scenario: Consecutive chord-only rows
- **WHEN** two or more recognized chord-only rows appear consecutively without an intervening lyric row
- **THEN** analysis returns a layout-risk warning identifying the first affected line and stating that each row will display as its own line

#### Scenario: Chords too close together
- **WHEN** adjacent chord tokens in one recognized row begin closer together than the longer of their labels' widths plus one space
- **THEN** analysis returns a layout-risk warning for that line stating that the chords may overlap or stack

#### Scenario: Well-formed layout
- **WHEN** every recognized chord row is paired with a lyric row at least as long as its last chord start, or is a standalone instrumental row, and chords are adequately spaced
- **THEN** analysis returns no layout-risk warnings

#### Scenario: Reporting does not mutate text
- **WHEN** analysis returns layout-risk warnings
- **THEN** the editor text is unchanged and the rows remain available for manual correction

### Requirement: Layout-risk findings agree with reader layout
Layout-risk detection SHALL use the same chord token columns and pairing rules as the reader so that a row is reported only if the reader's layout would place its chords beyond the lyric, on separate lines, or in additional lanes.

#### Scenario: Reader and editor agree
- **WHEN** identical text is analyzed in the editor and laid out in play mode
- **THEN** every row the reader renders with stacked or overflowing chords is reported with a layout-risk warning, and rows reported with none render sequentially

### Requirement: Layout-risk findings are not safe fixes
Layout-risk remedies that would merge rows, move chords, change spacing between chords, or alter lyrics SHALL be recommendations only and SHALL NOT be included in the safe-fix plan.

#### Scenario: Risk and safe fixes coexist
- **WHEN** a document contains both layout-risk rows and deterministic whitespace issues
- **THEN** applying safe fixes changes only the deterministic whitespace issues, and the updated analysis continues to report the unresolved layout risks

### Requirement: Editor presents layout-risk feedback
The add and edit song editor SHALL display layout-risk warnings in the Auto Format feedback panel with line numbers and remedies, and SHALL count them in the review summary.

#### Scenario: Warnings displayed
- **WHEN** a user runs Auto Format on content with layout-risk rows
- **THEN** the feedback panel lists each affected line with its explanation and suggested remedy and does not report an unconditional success

#### Scenario: Warnings cleared after manual edit
- **WHEN** the user corrects the flagged rows and runs Auto Format again
- **THEN** the corresponding warnings no longer appear
