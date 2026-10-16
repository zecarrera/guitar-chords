## MODIFIED Requirements

### Requirement: Supported two-line chord notation shares one responsive layout
The system SHALL recognize a syntactically valid bare or bracketed chord-only source row followed immediately by an eligible lyric row as one logical chord-and-lyric line. It SHALL preserve each chord token's start column in the authored source row as its horizontal anchor, including when that column is beyond the lyric text's length, and SHALL wrap the paired chords and lyrics together rather than wrapping the two source rows independently. Chords with distinct source columns SHALL NOT collapse to a shared column solely because the lyric row is shorter; the system SHALL preserve their left-to-right order and fit them within the available reader width.

#### Scenario: Paired chord and lyric rows wrap together
- **WHEN** a chord-only row is followed immediately by an eligible lyric row and their logical line exceeds the available width
- **THEN** each chord is rendered on the same visual row as its associated lyric position after wrapping

#### Scenario: Bare paired chord and lyric rows wrap together
- **WHEN** a bare chord-only row is followed immediately by an eligible lyric row and their logical line exceeds the available width
- **THEN** each chord is rendered on the same visual row as its associated lyric position after wrapping

#### Scenario: Bracketed paired chord and lyric rows wrap together
- **WHEN** a bracketed chord-only row is followed immediately by an eligible lyric row and their logical line exceeds the available width
- **THEN** each chord is rendered on the same visual row as its associated lyric position after wrapping

#### Scenario: Paired notation responds to font scale
- **WHEN** a bare or bracketed paired chord-and-lyric line is displayed at different supported font scales
- **THEN** the chord-to-lyric associations remain unchanged even if the number of visual rows changes

#### Scenario: Brackets do not redefine a bare source anchor
- **WHEN** a bare chord row is parsed for play mode
- **THEN** every chord anchor is its token start column in the original bare row without any bracket-width adjustment

#### Scenario: Chords beyond a short lyric row retain distinct source columns
- **WHEN** a paired chord row contains chords whose source columns extend beyond the end of its lyric row
- **THEN** each chord retains its own source column instead of collapsing to the lyric row's final column

#### Scenario: Short lyric row does not cause unnecessary chord stacking
- **WHEN** chords in a paired row have distinct, non-overlapping source positions beyond the lyric text
- **THEN** the chords remain horizontally positioned in source order without being stacked solely because the lyric text ended earlier

#### Scenario: Paired chords beyond the reader width wrap in order
- **WHEN** distinct chord positions in a paired row extend beyond the available reader width
- **THEN** the chords wrap into additional visual rows without splitting chord labels, losing or reordering chords, or requiring horizontal scrolling

#### Scenario: Instrumental row is not paired with another chord row
- **WHEN** a bare or bracketed chord-only row is followed by another chord-only row
- **THEN** the first row remains a standalone instrumental chord sequence

#### Scenario: Unpaired terminal chord row remains playable
- **WHEN** a section ends with a bare or bracketed chord-only row
- **THEN** the row is preserved and rendered as a standalone chord sequence

#### Scenario: Ambiguous row is not paired
- **WHEN** a possible chord row contains unsupported non-chord content and cannot be classified confidently
- **THEN** the reader preserves it as authored and does not pair it with the following lyric row

#### Scenario: Inline notation remains compatible
- **WHEN** a source row already contains inline chord tokens mixed with lyrics
- **THEN** the reader preserves the existing lyrics and chord associations without requiring conversion to two-line notation
