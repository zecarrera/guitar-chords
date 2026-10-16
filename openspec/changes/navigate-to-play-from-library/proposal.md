## Why

The library's Songs table only offers Edit and Delete in its Actions column. To play a song, the user has to find it through another route. A direct action from each library row to the song view, where playback starts, makes practice faster.

## What Changes

- Add a play action icon to each song row's Actions column in the library, placed before Edit and Delete.
- The icon links to the song's existing detail page (`/songs/<slug>`), where the user starts playback with the existing play control.
- The icon has an accessible label (for example "Play song") and a hover/focus style consistent with the other action icons.

Non-goals: auto-starting playback on arrival, changes to the song view or reader, the Artists tab actions, new routes, data, or API changes. No security, authorization, deployment, or telemetry impact; the link uses the stored slug and sends no chord-sheet content anywhere.

Assumption: "take the user to the song view where he can start playing" means opening the song page without auto-starting; auto-play can be a later change.

## Capabilities

### New Capabilities
- `library-song-play-link`: Library song rows expose an action that navigates to the song view.

### Modified Capabilities

## Impact

- `components/library-page.tsx`: new icon component and link in the songs table Actions cell.
- Tests: a focused Vitest/React test for the rendered link, if the component can be rendered in isolation.
- No schema, API, or dependency changes; compatible with existing routes.
