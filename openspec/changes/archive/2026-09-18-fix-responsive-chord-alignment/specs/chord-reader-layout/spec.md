## MODIFIED Requirements

### Requirement: Chord alignment is preserved across wrapped rows
The system SHALL keep each chord visually aligned with its associated lyric position after a line has been wrapped into multiple visual rows. A chord's association with its lyric position SHALL remain unchanged when chord labels require collision avoidance, when the configured font scale changes within the supported range, or when the available reader width changes. For chord-only runs, the system SHALL preserve the original left-to-right chord order.

#### Scenario: Chord stays aligned with its word after wrapping
- **WHEN** a line wraps and a chord's associated word ends up on a particular visual row
- **THEN** that chord is rendered on the same visual row at the associated lyric position

#### Scenario: Dense chord labels do not change lyric association
- **WHEN** two or more chord labels are anchored close enough that their labels would overlap
- **THEN** the system resolves the visual collision without moving any chord to a different lyric position or wrapped lyric row

#### Scenario: Font scale changes preserve chord association
- **WHEN** a user changes the reader font scale anywhere within the supported 80%-150% range
- **THEN** every chord remains associated with the same lyric position after the reader rewraps the content

#### Scenario: Reader width changes preserve chord association
- **WHEN** the available reader width changes because of viewport, orientation, surrounding layout, or play-mode changes
- **THEN** the reader recalculates wrapping and every chord remains associated with the same lyric position

#### Scenario: Chord-only sequence preserves order
- **WHEN** a standalone instrumental chord sequence wraps
- **THEN** every chord appears exactly once and in its original left-to-right order

## ADDED Requirements

### Requirement: Supported two-line chord notation shares one responsive layout
The system SHALL recognize a chord-only source row followed immediately by an eligible lyric row as one logical chord-and-lyric line, preserving the chord columns from the source row as lyric anchors. The system SHALL wrap the paired chords and lyrics together rather than wrapping the two source rows independently.

#### Scenario: Paired chord and lyric rows wrap together
- **WHEN** a chord-only row is followed immediately by an eligible lyric row and their logical line exceeds the available width
- **THEN** each chord is rendered on the same visual row as its associated lyric position after wrapping

#### Scenario: Paired notation responds to font scale
- **WHEN** a paired chord-and-lyric line is displayed at different supported font scales
- **THEN** the chord-to-lyric associations remain unchanged even if the number of visual rows changes

#### Scenario: Instrumental row is not paired with another chord row
- **WHEN** a chord-only row is followed by another chord-only row
- **THEN** the first row remains a standalone instrumental chord sequence

#### Scenario: Unpaired terminal chord row remains playable
- **WHEN** a section ends with a chord-only row
- **THEN** the row is preserved and rendered as a standalone chord sequence

#### Scenario: Inline notation remains compatible
- **WHEN** a source row already contains inline chord tokens mixed with lyrics
- **THEN** the reader preserves the existing lyrics and chord associations without requiring conversion to two-line notation
