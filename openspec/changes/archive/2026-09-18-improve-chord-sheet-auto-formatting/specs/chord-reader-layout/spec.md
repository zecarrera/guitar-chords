## MODIFIED Requirements

### Requirement: Supported two-line chord notation shares one responsive layout
The system SHALL recognize a syntactically valid bare or bracketed chord-only source row followed immediately by an eligible lyric row as one logical chord-and-lyric line. It SHALL preserve each chord token's start column in the authored source row as the lyric anchor and SHALL wrap the paired chords and lyrics together rather than wrapping the two source rows independently.

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
