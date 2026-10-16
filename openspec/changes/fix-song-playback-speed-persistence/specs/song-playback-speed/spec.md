## Purpose

Defines how playback speed is selected, restored, and saved independently for each song in the play-along reader.

## ADDED Requirements

### Requirement: Playback speed is initialized independently for each song
The system SHALL initialize a song's reader with that song's persisted playback speed when available, without allowing a browser-wide speed preference from another song to override it. When no per-song speed is available, the reader SHALL use its defined default.

#### Scenario: Open a song with a saved speed
- **WHEN** a user opens a song that has a persisted playback speed
- **THEN** the reader starts with that song's persisted speed

#### Scenario: Switch between songs with different speeds
- **WHEN** a user opens one song with a saved speed and then opens another song with a different saved speed or no saved speed
- **THEN** each reader uses only its own song's persisted speed or the defined default

### Requirement: Playback speed changes are persisted for the current song
The system SHALL persist the final changed playback speed for the current song once when playback ends, whether the user stops playback or the song reaches its end. It SHALL NOT issue a persistence request for each individual speed adjustment during playback, and SHALL restore the persisted speed when the same song is opened again.

#### Scenario: Persist the final speed when playback ends
- **WHEN** a user changes a song's playback speed one or more times and playback ends by user stop or natural completion
- **THEN** the final selected speed is persisted for that song in a single save

#### Scenario: Do not persist each speed adjustment
- **WHEN** a user adjusts playback speed multiple times while playback continues
- **THEN** no per-adjustment persistence requests are issued before playback ends

#### Scenario: Restore a song's newly saved speed
- **WHEN** a user reopens a song after its changed speed has been persisted
- **THEN** the reader starts with the newly saved speed

### Requirement: Playback speed is saved with the primary playback document
The system SHALL persist the speed to the same primary chord document whose content and speed supply that song's reader.

#### Scenario: Song has multiple chord documents
- **WHEN** a song has multiple chord documents and its playback speed is changed
- **THEN** the speed is saved to the primary playback document and that same document supplies the speed on the next load
