## MODIFIED Requirements

### Requirement: Encoded artist links resolve to a playlist
The system SHALL generate artist links that target the available artist playlist route and SHALL decode an artist name from that route before using it to load songs or display playlist metadata.

#### Scenario: Artist name contains spaces
- **WHEN** a user follows a generated playlist link for an artist whose name contains spaces
- **THEN** the playlist page loads the matching songs instead of returning a not-found response

#### Scenario: Playlist displays the decoded artist name
- **WHEN** an encoded artist playlist route loads successfully
- **THEN** the page metadata and playlist heading display the decoded artist name

#### Scenario: User opens an artist link from a song page
- **WHEN** a user selects the artist name in a song page header
- **THEN** the browser navigates to the encoded artist playlist route and the matching playlist page loads instead of returning a not-found response
