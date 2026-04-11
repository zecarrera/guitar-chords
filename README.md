# Guitar Chords Library

A responsive Next.js application for storing guitar chord sheets, organizing them by artist, genre, and custom lists, and opening songs in a play-along reader with adjustable auto-scroll.

## Features

- **Song library** — browse all songs alphabetically with instant search by title or artist
- **Play-along reader** — auto-scroll reader with adjustable speed and font size; screen wake lock keeps the display on while playing
- **Chord visibility toggle** — hide chord annotations during playback to practice by ear
- **Artist playlist mode** — tap an artist to queue all their songs; playback advances automatically between songs
- **Auto-save scroll speed** — preferred scroll speed is persisted back to the song after playback stops
- **Interactive chord diagrams** — hover or tap a chord annotation to see a fretboard diagram
- **Manage panel** — add songs via PDF upload or external link, edit metadata, manage video links
- **iPhone home screen icon** — Apple Touch Icon included for add-to-home-screen installs

## Stack

- `Next.js` App Router with `TypeScript`
- `Tailwind CSS`
- `Prisma` with a PostgreSQL schema
- Planned object storage for uploaded PDFs

## Local development

Use Node `22.13+` when possible.

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:push
npm run db:studio
```

## Database setup

Recommended free provider: `Neon`.

Create a free Neon project, then copy both of these from Neon:
- `DATABASE_URL`: the pooled connection string for the app runtime
- `DIRECT_URL`: the direct connection string for Prisma migrations

Run the database setup flow:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Keep `ENABLE_DATABASE_READS=true` when you want the UI to read from PostgreSQL. If reads are disabled or the database is temporarily unavailable, the app falls back to `lib/demo-data.ts` so the UI remains deployable.

## Architecture overview

- `app/` holds the App Router pages for overview, songs, artists, genres, lists, import review, and reader mode
- `app/artists/[name]/play/` — artist playlist page that queues all songs for an artist
- `components/auto-scroll-reader.tsx` — browser-side play-along experience with wake lock, chord toggle, and auto-save
- `components/playlist-player.tsx` — client component managing playlist state and auto-advance between songs
- `components/song-list.tsx` / `components/artist-list.tsx` — searchable list components used on the Songs and Artists pages
- `lib/demo-data.ts` provides build-safe sample content that mirrors the intended domain model
- `prisma/schema.prisma` defines songs, artists, genres, custom lists, chord documents, video links, and import sources

## Render deployment direction

- A ready-to-sync `render.yaml` blueprint is included at the repo root
- The recommended free persistent setup is: Render free web service + external Neon Postgres
- Render free does not support `preDeployCommand`, so the Blueprint build step runs `npm run db:generate && npm run db:migrate && npm run db:seed && npm run build`
- Health checks use `/api/health`
- During the initial Blueprint sync, Render will prompt you for both `DATABASE_URL` and `DIRECT_URL` because they are marked with `sync: false`
- Set `DATABASE_URL` to Neon's pooled URL
- Set `DIRECT_URL` to Neon's direct URL
- `ENABLE_DATABASE_READS=true` in the deployment so the app uses Neon-backed persistence
- `SEED_DEMO_DATA=true` lets the first deploy populate baseline content if the database is empty

## Neon setup notes

1. Create a free Neon project.
2. Copy both the pooled and direct Postgres connection strings from Neon.
3. Use those values for local `.env` and for Render's `DATABASE_URL` / `DIRECT_URL` prompts during Blueprint creation.
4. After the first deploy and initial seed, you can keep `SEED_DEMO_DATA=true` safely because the seed script skips when songs already exist, or set it to `false` once you no longer want automatic baseline seeding.
