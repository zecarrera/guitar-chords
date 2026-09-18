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

### Requirement: Format analysis is non-mutating
Running format analysis SHALL preserve the editor's current chord-sheet text and SHALL separately report deterministic fixes that are available.

#### Scenario: Analysis finds safe fixes
- **WHEN** a user analyzes content containing one or more deterministic formatting issues
- **THEN** the editor content remains unchanged and the result states how many safe fixes are available and what categories of text they affect

#### Scenario: Analysis finds no safe fixes
- **WHEN** a user analyzes content that already satisfies deterministic formatting rules
- **THEN** the editor content remains unchanged and no apply-fixes action is offered

### Requirement: Safe fixes do not infer musical meaning
The system SHALL classify a fix as safe only when its result is deterministic and does not infer chord identity, chord-to-lyric association, bracket intent, repeat meaning, bar structure, or diagram availability.

#### Scenario: Deterministic text cleanup
- **WHEN** content contains noncanonical line endings, non-breaking spaces, leading or trailing blank space, redundant blank-line runs, trailing line whitespace, or tab characters
- **THEN** analysis may offer deterministic fixes that canonicalize those characters while preserving non-whitespace content and chord start columns under the defined tab-stop policy

#### Scenario: Ambiguous musical notation
- **WHEN** analysis finds malformed brackets, mixed chord and repeat annotations, bar-delimited progressions, unknown musical intent, or missing chord diagrams
- **THEN** those findings remain recommendations and are not included in the safe-fix plan

### Requirement: User can apply all safe fixes
When a current analysis contains safe fixes, the editor SHALL provide one action that applies every safe fix atomically to the analyzed text.

#### Scenario: Apply current safe fixes
- **WHEN** a user activates **Apply safe fixes** without changing the analyzed text
- **THEN** all listed safe fixes are applied together and no semantic recommendation is applied

#### Scenario: Safe-fix application fails
- **WHEN** the system cannot apply the complete safe-fix plan
- **THEN** it leaves the editor content unchanged and reports that the fixes were not applied

### Requirement: Stale fixes cannot overwrite newer edits
The system SHALL apply a safe-fix plan only to the exact source content from which that plan was produced.

#### Scenario: Content changes after analysis
- **WHEN** editor content changes after analysis and before safe fixes are applied
- **THEN** the stale fix action is removed or rejected without changing the newer content

### Requirement: Analysis reruns after fixes
After safe fixes are applied, the system SHALL analyze the updated text again and SHALL present the current outcomes.

#### Scenario: Recommendations remain after safe cleanup
- **WHEN** safe fixes are applied to content that also contains ambiguous musical notation
- **THEN** the updated analysis no longer offers the completed safe fixes and continues to show the unresolved recommendations

#### Scenario: All findings are resolved
- **WHEN** safe fixes resolve every reported formatting issue
- **THEN** the updated analysis confirms that no safe fixes or unresolved warnings remain

### Requirement: Safe fixes preserve chord layout semantics
Applying safe fixes SHALL preserve chord token order, non-whitespace text, and chord-to-lyric associations. Tab expansion SHALL use one documented fixed tab-stop width shared by analysis and editor presentation.

#### Scenario: Tabs precede aligned chords
- **WHEN** a chord row uses tabs before or between chord tokens
- **THEN** applying safe fixes replaces each tab with the spaces needed to reach the next shared tab stop and subsequent analysis derives anchors from those resulting columns

#### Scenario: Existing chord spacing
- **WHEN** a chord row already uses spaces for alignment
- **THEN** applying unrelated safe fixes does not change the internal spaces or source columns of its chord tokens
