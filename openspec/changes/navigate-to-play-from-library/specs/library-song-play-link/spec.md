## ADDED Requirements

### Requirement: Library song rows link to the song view
Each song row in the library's Songs table SHALL provide a play action that navigates to that song's detail view, where the user can start playback. The action SHALL be an accessible link with a descriptive label and SHALL NOT start playback itself.

#### Scenario: Play action navigates to the song
- **WHEN** a user activates the play action on a song row
- **THEN** the system navigates to that song's detail page and does not open the edit or delete flows

#### Scenario: Action is accessible
- **WHEN** the library renders a song row
- **THEN** the play action is keyboard focusable and exposes an accessible name identifying it as the play action

#### Scenario: Other row actions unchanged
- **WHEN** the library renders a song row
- **THEN** the existing Edit and Delete actions remain available and behave as before

#### Scenario: Each row targets its own song
- **WHEN** the library lists multiple songs
- **THEN** each row's play action points to the detail page of that row's song
