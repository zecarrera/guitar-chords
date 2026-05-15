# UX Expert Brief

This file is the authoritative UX reference for the **Guitar Chords Library** app.
All AI agents (cloud and CLI) working on UI/UX tasks must read this before implementing
any changes.

---

## Project purpose

A personal, single-user guitar chord library for organising songs and running live
play-along sessions. The app is used while playing guitar — one hand on the instrument,
glancing at the screen.

---

## Primary target device

**iPhone 13 in portrait orientation**

| Property | Value |
|---|---|
| CSS viewport | 390 × 844 px |
| Safe-area top | ~47 px (notch) |
| Safe-area bottom | ~34 px (home indicator) |
| Pixel ratio | 3× |

All mobile breakpoint decisions should be validated at this size first.
Tablet and desktop must continue to work but are secondary concerns.

---

## Priority screen ranking

1. **Song play mode** — the `AutoScrollReader` component (`components/auto-scroll-reader.tsx`).
   This is the screen used most during an actual practice session. It must be flawless on
   iPhone 13 before any other screen is optimised.

2. **Song list / browsing** — finding a song quickly before picking up the guitar.

3. **Song detail** — the static summary page before entering play mode.

4. **All other pages** — manage, genres, artists, lists, chords library.

---

## Viewport maximisation goal

Every pixel of vertical height is precious on a 390 × 844 px screen, especially in play
mode where the chord sheet must be readable while playing. Design decisions must default to
**showing more content**, not more chrome.

Guidelines derived from this goal:

- Controls and navigation chrome should be **collapsed or hidden by default** in play mode,
  accessible on demand (tap to reveal, auto-hide on play start)
- Avoid fixed headers or footers that permanently consume vertical space in play mode
- Prefer `height: 100dvh` over `100vh` to account for browser UI on iOS Safari
- The chord-sheet reader area should target **≥ 72 % of `dvh`** when collapsed controls
  are in place

---

## UX principles

### Touch targets
- Minimum touch target size: **44 × 44 px** (Apple Human Interface Guidelines)
- Prefer 48–56 px for primary actions (play/pause, settings toggle)
- Never rely on hover states — every interaction must be reachable by tap alone

### Safe area insets
Always account for iPhone notch and home indicator:
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```
Use Tailwind's `pb-safe` / `pt-safe` utilities if the plugin is configured, otherwise
apply inline or use `[padding-bottom:env(safe-area-inset-bottom)]`.

### Scroll behaviour
- Use `overflow-y: auto` with `-webkit-overflow-scrolling: touch` (or `touch-action: pan-y`)
  on scrollable regions to preserve native iOS momentum scrolling
- Add `overscroll-behavior: contain` to prevent pull-to-refresh interfering with the reader

### Typography
- Minimum body font size: **14 px** on mobile (12 px only for secondary labels)
- The chord-sheet monospace font must be large enough that chord tokens above lyrics are
  visually distinct without zooming — default to `14 px` on mobile (`15 px` on sm+)
- Allow the user to scale up via the lyrics-size control; never scale below the 14 px floor

### Colour and contrast
- Maintain WCAG AA contrast ratios (≥ 4.5:1 for normal text) on the dark background
- Do not rely on colour alone to convey state (use icons or labels too)

### Motion
- Respect `prefers-reduced-motion` for any animation or transition
- The auto-scroll animation should pause when the tab is backgrounded (already handled via
  `visibilitychange`)

---

## Controls pattern for play mode (mobile)

The agreed prototype pattern for the reader controls on mobile:

- **Collapsed state (default on < 640 px):** single bar ≤ 56 px tall, containing the
  ▶ / ⏸ play button and a ⚙ settings icon
- **Expanded state:** tapping ⚙ reveals an inline panel directly below the bar (not a
  modal or overlay) with the speed slider, lyrics-size control, and show-chords toggle
- **Auto-collapse:** the panel closes automatically when playback starts
- **Desktop (≥ 640 px):** the current always-visible layout is unchanged

---

## Chord tooltip on mobile

The current fixed-position chord diagram tooltip clips off-screen when a chord token is
near an edge. On mobile, replace it with a **bottom-anchored popup** that always renders
inside the viewport, regardless of where the triggering chord token sits on screen.

---

## Prototyping workflow

Each UX improvement follows this loop:

1. File a GitHub issue with acceptance criteria referencing this file
2. Assign to `@copilot` (cloud coding agent)
3. Agent creates a branch and opens a PR
4. Vercel generates a preview deployment — test the URL on iPhone 13
5. Approve or leave feedback in the PR
6. Merge when satisfied

Branch naming: `feat/mobile-<area>` (e.g. `feat/mobile-reader-controls`)
