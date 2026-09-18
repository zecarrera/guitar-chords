# chord-sheet-formatting Specification

## Purpose

Defines how chord-sheet text is safely analyzed and normalized so editor feedback, saved documents, imports, and play mode agree without changing authored chord-to-lyric positions.

## Requirements

### Requirement: Shared syntactic chord recognition
The system SHALL use one syntactic chord-recognition policy when analyzing editor content, imported text, and reader content. A syntactically valid chord SHALL be recognized independently of whether a matching chord diagram exists.

#### Scenario: Valid chord has no diagram
- **WHEN** a chord row contains syntactically valid labels such as `G13` or `Cmaj9` that have no available diagram
- **THEN** the system recognizes the labels as chords and separately reports that diagrams are unavailable

#### Scenario: Recognition is consistent across surfaces
- **WHEN** identical chord-sheet text is analyzed in the editor, imported, saved, and opened in play mode
- **THEN** each surface classifies its chord tokens and chord-only rows consistently

### Requirement: Auto Format preserves source anchors
Auto Format SHALL preserve the start column of every chord in a confidently recognized bare chord row and SHALL NOT inject characters that shift later chord anchors. It SHALL preserve existing bracketed notation as authored.

#### Scenario: Bare chord and lyric pair
- **WHEN** Auto Format analyzes a bare chord-only row followed by an eligible lyric row
- **THEN** it preserves the row text and reports the pair as confidently recognized with every chord at its original source column

#### Scenario: Existing bracketed notation
- **WHEN** Auto Format analyzes existing inline or two-line bracketed notation
- **THEN** it leaves the notation unchanged and reports its recognized structure

#### Scenario: Repeated formatting
- **WHEN** Auto Format analyzes text that it previously analyzed
- **THEN** the resulting document text is unchanged

### Requirement: Auto Format reports analysis outcomes
Auto Format SHALL return a structured result containing the resulting text, recognized chord-and-lyric pairs, recognized instrumental rows, ambiguous or malformed rows, and syntactically valid chords without available diagrams. Diagnostics SHALL identify the affected source line and SHALL distinguish informational outcomes from warnings.

#### Scenario: Confident document
- **WHEN** all chord notation in a document can be classified confidently
- **THEN** the editor reports the recognized structures without presenting an ambiguity warning

#### Scenario: Ambiguous mixed row
- **WHEN** a row mixes chord tokens with unsupported annotations such as `x2` or bar separators and cannot be classified confidently
- **THEN** Auto Format leaves that row unchanged and returns a warning for its source line

#### Scenario: Malformed bracket notation
- **WHEN** a row contains unmatched or otherwise malformed chord brackets
- **THEN** Auto Format leaves the row unchanged and returns a warning for its source line

### Requirement: Editor presents formatting diagnostics
The add and edit song editor SHALL display the result of Auto Format, including recognized structures and actionable warnings, instead of reporting unconditional formatting success.

#### Scenario: Formatting finds warnings
- **WHEN** a user runs Auto Format and one or more ambiguous or malformed rows are found
- **THEN** the editor displays the affected line numbers and explanations while preserving those rows for manual correction

#### Scenario: Formatting succeeds without warnings
- **WHEN** a user runs Auto Format and all relevant rows are confidently classified
- **THEN** the editor confirms successful analysis and summarizes the recognized chord-sheet structures

### Requirement: Automatic normalization is non-semantic
Automatic normalization during create, update, and PDF import SHALL be limited to safe text-layout cleanup and SHALL NOT add, remove, or reposition chord notation. The same normalization policy SHALL apply to create and update flows.

#### Scenario: Saving bare notation
- **WHEN** a user creates or updates a song containing bare chord rows
- **THEN** save-time normalization preserves the chord tokens and their source columns

#### Scenario: Importing PDF text
- **WHEN** extracted PDF text contains a possible chord row
- **THEN** automatic normalization preserves that row without partially adding bracket syntax

#### Scenario: Normalizing line endings
- **WHEN** submitted text contains platform-specific line endings or non-breaking spaces
- **THEN** automatic normalization converts them to the canonical text layout without changing chord-to-lyric columns

### Requirement: Section boundaries are preserved
Auto Format and automatic normalization SHALL preserve meaningful blank-line boundaries between chord-sheet sections and SHALL NOT infer or remove section structure merely to simplify whitespace.

#### Scenario: Multiple authored section boundaries
- **WHEN** input separates sections with blank lines
- **THEN** the resulting content retains a section boundary at each authored separation

#### Scenario: Leading and trailing whitespace
- **WHEN** a document contains only leading or trailing blank space outside its content
- **THEN** safe normalization may remove that outer whitespace without changing internal section boundaries
