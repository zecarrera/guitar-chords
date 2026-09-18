## Purpose

Ensures artist playlist links resolve names containing spaces or other URL-encoded characters to the correct playable song collection.

## ADDED Requirements

### Requirement: Encoded artist links resolve to a playlist
The system SHALL decode an artist name from the playlist route before using it to load songs or display playlist metadata.

#### Scenario: Artist name contains spaces
- **WHEN** a user follows a generated playlist link for an artist whose name contains spaces
- **THEN** the playlist page loads the matching songs instead of returning a not-found response

#### Scenario: Playlist displays the decoded artist name
- **WHEN** an encoded artist playlist route loads successfully
- **THEN** the page metadata and playlist heading display the decoded artist name
