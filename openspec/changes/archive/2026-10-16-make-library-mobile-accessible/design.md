## Context

See `proposal.md` for the motivation and `specs/mobile-song-library/spec.md` for the behavior contract. `LibraryPage` currently hides the library below the `sm` breakpoint and displays a desktop-only message. The desktop view already owns song filtering by title and artist, along with separate song and artist management actions.

## Goals / Non-Goals

**Goals:**
- Add a compact, touch-friendly song list below the existing `sm` breakpoint.
- Reuse the page's query and filtered-song data so mobile and desktop search have consistent matching behavior.
- Make mobile song-management controls natively disabled while preserving the desktop interactions.

**Non-Goals:**
- Change song routes, data loading, persistence, or playback behavior.
- Expose artist browsing or artist management in the mobile library.
- Redesign the desktop library.

## Decisions

- Keep the mobile and desktop presentations as responsive sections in the existing library page. This replaces the current mobile guard without changing the desktop view or route structure; a separate page would duplicate routing and state for the same library.
- Use the existing query state and `filteredSongs` result for the mobile search and list. This keeps title/artist matching and empty-result behavior aligned with desktop without introducing a second filter implementation.
- Render add, edit, and delete song controls in the mobile presentation with native disabled semantics and a visibly disabled treatment. Hiding them would not match the requested disabled-control behavior, while a visual-only treatment could leave actions operable.
- Keep mobile focused on songs and their play links; retain the artist tab and its management controls exclusively in the existing desktop presentation.

## Risks / Trade-offs

- Maintaining two responsive presentations can allow visual or behavioral drift → share the existing filtering state and add focused rendering assertions for mobile actions and desktop regressions.
- Disabled controls remain visible but unavailable → communicate their disabled state through both native semantics and visual styling.

## Migration Plan

No migration is required. The change affects only the library presentation and its tests; rollback is a code revert.
