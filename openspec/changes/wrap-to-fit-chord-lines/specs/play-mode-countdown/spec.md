## Purpose

Defines the pre-playback countdown that plays before auto-scroll starts, ensuring the reader's layout is fully stable before the user commits to playing, since they cannot interact with the screen once playback begins.

## ADDED Requirements

### Requirement: Get-ready countdown before playback starts
The system SHALL display a "Get ready" countdown (3, 2, 1) after the user initiates play and before auto-scroll begins moving.

#### Scenario: Countdown appears when play is pressed
- **WHEN** a user presses play
- **THEN** the system displays a "Get ready" countdown sequence before auto-scroll starts moving

#### Scenario: Auto-scroll does not move during the countdown
- **WHEN** the countdown is in progress
- **THEN** the chord sheet does not auto-scroll until the countdown finishes

### Requirement: Layout is stable before the countdown begins
The system SHALL complete all line wrapping and layout calculations for the current song before starting the countdown, so no layout shift occurs during or immediately after the countdown.

#### Scenario: No layout shift during countdown
- **WHEN** the countdown is displayed
- **THEN** the chord sheet's wrapped layout does not change or shift during the countdown or at the moment auto-scroll begins

### Requirement: Countdown runs to completion once started
The system SHALL run the countdown to completion once it starts; the system SHALL NOT provide a way to cancel or interrupt the countdown before auto-scroll begins.

#### Scenario: Countdown cannot be canceled mid-sequence
- **WHEN** a user interacts with the play control while the countdown is in progress
- **THEN** the countdown continues uninterrupted to completion and auto-scroll then begins
