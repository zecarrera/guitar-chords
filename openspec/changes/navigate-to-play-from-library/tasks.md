## 1. Library UI

- [x] 1.1 Add a `PlayIcon` component in `components/library-page.tsx` matching the existing icon style
- [x] 1.2 Add a `Link` to `/songs/${song.slug}` with `aria-label="Play song"` as the first item in each song row's Actions cell, adjusting the Actions column width if needed

## 2. Tests and validation

- [x] 2.1 Add a focused test that each song row renders a play link with the correct `href` and accessible name, and that Edit and Delete remain
- [x] 2.2 Manually verify navigation to the song view and that the layout holds at narrow widths
- [x] 2.3 Run `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `openspec validate "navigate-to-play-from-library" --strict`
