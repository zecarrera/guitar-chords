## REMOVED Requirements

### Requirement: Get-ready countdown before playback starts
**Reason**: The timed 3-2-1 delay is no longer wanted; playback should begin immediately once ready.
**Migration**: None. Pressing play starts auto-scroll as soon as layout is stable.

### Requirement: Countdown runs to completion once started
**Reason**: With no countdown there is nothing to run to completion or protect from interruption.
**Migration**: None. The play control follows normal play/stop behavior once scrolling is active.

## MODIFIED Requirements

### Requirement: Layout is stable before the countdown begins
The system SHALL complete all line wrapping and layout calculations for the current song before auto-scroll begins, so no layout shift occurs when scrolling starts. The system SHALL NOT impose a timed delay between layout readiness and the start of auto-scroll.

#### Scenario: No layout shift during countdown
- **WHEN** a user presses play and playback is being prepared
- **THEN** the chord sheet's wrapped layout does not change or shift before or at the moment auto-scroll begins, and no countdown is shown

#### Scenario: Playback starts without a countdown
- **WHEN** a user presses play, or the reader opens in auto-play mode
- **THEN** no "Get ready" countdown or numeric counter is displayed and auto-scroll begins as soon as layout is ready

#### Scenario: Play control during preparation
- **WHEN** a user presses the play control while layout preparation is still in progress
- **THEN** playback still begins once preparation finishes and the control does not start a second playback
