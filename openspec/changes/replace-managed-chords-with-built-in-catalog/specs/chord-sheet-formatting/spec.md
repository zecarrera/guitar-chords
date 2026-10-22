## MODIFIED Requirements

### Requirement: Shared syntactic chord recognition
The system SHALL use one syntactic chord-recognition policy when analyzing editor content, imported text, and reader content. It SHALL recognize the bundled catalog's supported chord labels and aliases, including extended and slash notation, while retaining syntax-based recognition independently of diagram availability. Diagram availability SHALL use the same catalog resolution as playback, not a separate legacy list.

#### Scenario: Valid chord has no diagram
- **WHEN** a chord row contains a syntactically valid label with no matching catalog entry
- **THEN** the system recognizes the label as a chord and separately reports that its diagram is unavailable

#### Scenario: Recognition is consistent across surfaces
- **WHEN** identical chord-sheet text is analyzed in the editor, imported, saved, and opened in play mode
- **THEN** each surface classifies its chord tokens and chord-only rows consistently

#### Scenario: Catalog-supported extended notation
- **WHEN** chord-sheet text contains a supported catalog label such as `C7sus4`, `Cmadd9`, or `Cm7b5`
- **THEN** each surface recognizes that chord and editor analysis does not report its diagram as missing

#### Scenario: Lookup preserves authored text and anchors
- **WHEN** a chord label resolves through a suffix or enharmonic alias
- **THEN** analysis uses the resolved entry for diagram availability without rewriting the label or moving its source column
