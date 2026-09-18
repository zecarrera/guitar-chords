## ADDED Requirements

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
