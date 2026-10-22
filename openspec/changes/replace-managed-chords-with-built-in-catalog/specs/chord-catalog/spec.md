## Purpose

Provide a comprehensive, read-only guitar chord reference whose diagrams and lookup behavior are consistent across browsing, song playback, and editing.

## ADDED Requirements

### Requirement: Bundled reference catalog
The system SHALL supply the pinned upstream standard-tuning guitar catalog without runtime provider requests or database reads. It SHALL retain source revision information and the provider's license notice with the distribution.

#### Scenario: Database reads are unavailable
- **WHEN** database reads are disabled or the database cannot be reached
- **THEN** the chord reference and diagram lookup provide the same catalog as when database reads are enabled

#### Scenario: Provider is unreachable
- **WHEN** the upstream provider is unavailable at application runtime
- **THEN** chord browsing and lookup continue using the bundled catalog

### Requirement: First upstream position is the default
The system SHALL use the first position in each bundled upstream chord entry as its default shape on every surface. It SHALL NOT rank positions, merge legacy shapes, substitute another position, or offer personal overrides.

#### Scenario: Multiple positions are available
- **WHEN** a chord with multiple upstream positions appears in reference browsing, playback, or editor preview
- **THEN** each surface displays the frets and finger assignment of the first upstream position

#### Scenario: Default has an inversion or unusual fingering
- **WHEN** the first upstream position differs from a familiar shape or has a non-root bass note
- **THEN** the system still displays that first position without silently changing muted strings, notes, or finger assignments

### Requirement: Shared name and alias resolution
The system SHALL resolve supported chord names consistently across browsing, playback, and editor analysis, including major/minor suffix conventions, ASCII and Unicode accidentals, and enharmonic root and slash-bass aliases. It SHALL preserve authored labels and distinguish major from minor notation.

#### Scenario: Enharmonic aliases
- **WHEN** a user searches for or uses `A#` or `Bb`
- **THEN** both names resolve to the same catalog entry and default position
- **AND** a song's authored label is not rewritten

#### Scenario: Slash-bass aliases
- **WHEN** an otherwise supported slash chord uses an enharmonic spelling for its bass note
- **THEN** it resolves to the equivalent catalog entry without dropping the bass specification

#### Scenario: No matching entry
- **WHEN** a syntactically valid chord has no matching catalog entry
- **THEN** the system explicitly reports diagram unavailability rather than displaying a different chord

### Requirement: Visual reference browsing
The chord reference page SHALL display named chord diagrams, support chord-name search and root/family filtering, and remain read-only in every database configuration. Search and filters SHALL combine, and the page SHALL identify when no chords match.

#### Scenario: Search and filter
- **WHEN** a user enters a chord name or alias and selects a root or family filter
- **THEN** the page displays only entries matching the combined criteria

#### Scenario: Empty results
- **WHEN** no catalog entries match the active criteria
- **THEN** the page displays an explicit empty-result state and allows the criteria to be cleared

#### Scenario: Reference replaces management
- **WHEN** the user opens the chord reference with database reads enabled
- **THEN** diagram cards are shown without add, edit, save, or delete controls

### Requirement: Faithful accessible diagrams
The system SHALL render the default position's muted/open strings, relative fret positions, base fret, finger numbers, and barre metadata faithfully. Diagrams SHALL have an accessible chord-name label and SHALL NOT interpret provider labels as executable markup.

#### Scenario: Higher-neck barre position
- **WHEN** a default position uses a base fret above one and includes a barre
- **THEN** the diagram shows the correct neck position and barre without applying the base-fret offset twice

#### Scenario: Muted and open strings
- **WHEN** a position includes muted and open strings
- **THEN** those indicators remain distinct and neither is drawn as a fretted note

### Requirement: Catalog integrity failures are explicit
The system SHALL reject a bundled catalog revision with malformed positions, missing first positions, duplicate canonical identities, or invalid numerical rendering values during validation before release. It SHALL NOT silently replace rejected entries with legacy definitions.

#### Scenario: Invalid provider update
- **WHEN** a proposed catalog update contains an invalid default position
- **THEN** validation fails with the affected chord identified and the revision is not accepted for release

### Requirement: Legacy chord persistence is retired
The system SHALL remove chord mutation entry points, legacy built-in definitions, and chord-definition seeding and storage. Existing custom definitions SHALL NOT populate the new reference, and song documents SHALL remain unchanged. Release SHALL require a restorable backup of removed chord data, and rollback SHALL restore the previous schema/data before the previous application is resumed.

#### Scenario: Upgrade from managed definitions
- **WHEN** an existing installation upgrades after its chord-definition backup is confirmed
- **THEN** the reference uses only the new catalog and existing song labels and documents remain unchanged

#### Scenario: Fresh database seed
- **WHEN** the application seeds a fresh song database
- **THEN** seeding does not create chord-definition records and catalog availability does not depend on demo seeding

#### Scenario: Rollback
- **WHEN** an operator rolls back to the application version that reads managed chord definitions
- **THEN** the previous chord table and backed-up records are restored before that version serves requests
