## Purpose

Provides mobile users with a compact way to find songs in their library and open them for playback, without enabling song-management actions on small screens.

## ADDED Requirements

### Requirement: Mobile users can search and play library songs
The system SHALL provide a mobile library view that allows users to search songs by title or artist and open a song's play page.

#### Scenario: Search the mobile song library
- **WHEN** a mobile user enters a query matching a song title or artist
- **THEN** the library displays matching songs and excludes non-matching songs

#### Scenario: No songs match the query
- **WHEN** a mobile user's search query matches no songs
- **THEN** the library displays an empty-results message

#### Scenario: Play a song from mobile
- **WHEN** a mobile user activates a song's play action
- **THEN** the corresponding song play page opens

### Requirement: Song management actions are disabled on mobile
The system SHALL present add, edit, and delete song controls as disabled on mobile, and SHALL NOT allow those controls to initiate song-management actions.

#### Scenario: Add song is unavailable on mobile
- **WHEN** a mobile user views the library
- **THEN** the add-song control is disabled and cannot open song creation

#### Scenario: Edit and delete are unavailable on mobile
- **WHEN** a mobile user views a song in the library
- **THEN** that song's edit and delete controls are disabled and cannot initiate those actions

### Requirement: Desktop library management remains available
The system SHALL preserve the existing desktop library search, song playback, song management, and artist management interactions.

#### Scenario: Manage songs on desktop
- **WHEN** a user views the library on a desktop-sized viewport
- **THEN** the existing add, edit, delete, search, and play interactions remain available

#### Scenario: Manage artists on desktop
- **WHEN** a user selects the artists view on a desktop-sized viewport
- **THEN** the existing artist search, add, edit, and delete interactions remain available
