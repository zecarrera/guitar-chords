## Purpose

Defines how chord sheet lines are laid out so that a song's full width always fits within the visible viewport, using a fixed, user-controlled font size instead of automatic shrinking, across every context where a song is rendered.

## ADDED Requirements

### Requirement: Fixed font size in all rendering contexts
The system SHALL render chord sheet text at the user's configured font scale (the existing 80%-150% manual control) without any automatic, content-dependent shrinking. The rendered font size for a given font scale SHALL be the same across every song, regardless of that song's line lengths or chord density.

#### Scenario: Font size is unaffected by a song's longest line
- **WHEN** a user views two different songs at the same font scale, one with short lines and one containing a very long chord-and-lyric line
- **THEN** the rendered font size is identical between the two songs

#### Scenario: Manual font scale control still works
- **WHEN** a user increases or decreases the font scale control
- **THEN** the rendered font size changes accordingly, within the existing 80%-150% range, in every rendering context (song page, playlist mode, editor preview)

### Requirement: Word-boundary wrapping for overflowing lines
The system SHALL wrap a chord sheet line onto additional visual rows when its content exceeds the available display width, breaking at whitespace between words whenever whitespace is available. The system SHALL NOT break in the middle of a word or in the middle of a `[Chord]` token.

#### Scenario: Long line with words wraps at a word boundary
- **WHEN** a lyric line with interspersed chords exceeds the available width and contains whitespace
- **THEN** the line is split into multiple visual rows, each split point falling on a whitespace boundary between words

#### Scenario: A chord token is never split across rows
- **WHEN** a line wraps
- **THEN** no `[Chord]` token's characters are divided between two visual rows; each chord token appears whole on exactly one visual row

### Requirement: Chord-boundary fallback wrapping
The system SHALL wrap between two adjacent `[Chord]` tokens that have no intervening whitespace (e.g. an instrumental run such as `[Am][C][G][F]`) when such a line exceeds the available width and contains no whitespace to break on.

#### Scenario: Chord-only line with no whitespace wraps between chords
- **WHEN** a line consists only of consecutive `[Chord]` tokens with no whitespace between them and exceeds the available width
- **THEN** the line is split into multiple visual rows at boundaries between adjacent chord tokens, with no chord token split

### Requirement: Chord alignment is preserved across wrapped rows
The system SHALL keep each chord visually aligned above its associated lyric position (or, for chord-only runs, in its original left-to-right order) after a line has been wrapped into multiple visual rows.

#### Scenario: Chord stays aligned with its word after wrapping
- **WHEN** a line wraps and a chord's associated word ends up on a particular visual row
- **THEN** that chord is rendered on the same visual row, positioned above its associated word

### Requirement: No horizontal scrolling for chord sheets
The system SHALL NOT rely on horizontal scrolling to display chord sheet content in any rendering context. All content SHALL fit within the available width via wrapping.

#### Scenario: Viewing a song on the song page
- **WHEN** a user views a song's chord sheet on the song page
- **THEN** no horizontal scrollbar or side-scroll gesture is needed to read any line

#### Scenario: Viewing a song during playlist playback
- **WHEN** a song is displayed during playlist playback
- **THEN** no horizontal scrolling is needed to read any line

#### Scenario: Viewing a song in the editor preview
- **WHEN** a user previews a song in the manage/editor panel
- **THEN** no horizontal scrolling is needed to read any line
