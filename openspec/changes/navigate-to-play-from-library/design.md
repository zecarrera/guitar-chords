## Context

`components/library-page.tsx` renders the Songs table. Each row's Actions cell holds an Edit button (`PencilIcon`) and a Delete button (`TrashIcon`), using inline SVG icon components and Tailwind classes. Rows already carry `song.slug`, and the song view lives at `app/songs/[slug]/page.tsx`, which renders the reader with its own play control.

## Goals / Non-Goals

**Goals:**
- One-click navigation from a library row to the song view.

**Non-Goals:**
- Auto-start playback, reader changes, Artists tab actions, new routes.

## Decisions

1. **Use a `next/link` `Link` to `/songs/${song.slug}`** rather than a button with `router.push`, so it is a real anchor (keyboard, middle-click, prefetch). Check `node_modules/next/dist/docs/` for the current `Link` API before implementing.
2. **Add a `PlayIcon`** inline SVG next to `PencilIcon`/`TrashIcon`, same `h-4 w-4` size and stroke style, with `aria-label="Play song"` on the link and a hover color distinct from edit/delete.
3. **Placement**: first in the Actions cell; the `0.6fr` column may need a slightly wider fraction to fit three icons without wrapping.
4. **No auto-start**: arrival does not pass an autoplay flag; the user presses play in the reader.

## Risks / Trade-offs

- Narrow actions column could wrap on small widths → adjust the grid fraction and verify visually.
- Slug containing special characters → use the stored slug as-is, matching how other pages link to songs.

## Migration Plan

Front-end only; roll back by reverting the commit.
