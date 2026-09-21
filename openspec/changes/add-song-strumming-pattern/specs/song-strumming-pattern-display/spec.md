## Purpose

Defines how optional strumming patterns are managed and presented on standard song-detail pages for quick practice reference.

## ADDED Requirements

### Requirement: Song records support an optional strumming pattern
The system SHALL retain an optional strumming-pattern value for each song and SHALL make that value available to both management and song-detail views. Existing song records with a legacy strumming value SHALL preserve that value when the dedicated field is introduced.

#### Scenario: Saving a strumming pattern
- **WHEN** a user creates or updates a song with a strumming pattern
- **THEN** the saved song retains that exact pattern for subsequent viewing and editing

#### Scenario: Migrating an existing song
- **WHEN** a song has a legacy strumming value before the dedicated strumming-pattern field is introduced
- **THEN** its strumming pattern remains available after the change is deployed

### Requirement: Standard song view displays the strumming pattern
The system SHALL display a song's configured strumming pattern in the standard song-detail header with an explicit strumming-pattern label.

#### Scenario: Viewing a song with a pattern
- **WHEN** a user opens the standard detail view for a song that has a strumming pattern
- **THEN** the page displays the pattern and identifies it as the strumming pattern

#### Scenario: Viewing a song without a pattern
- **WHEN** a user opens the standard detail view for a song with no strumming pattern
- **THEN** the page does not display an empty, placeholder, or unlabeled strumming-pattern element

### Requirement: Play mode excludes song-detail strumming metadata
The system SHALL NOT add the strumming-pattern detail element to the play-mode reader or its playback controls.

#### Scenario: Starting play mode
- **WHEN** a user enters play mode for a song with a strumming pattern
- **THEN** the reader and playback controls remain unchanged by the song-detail strumming-pattern display
