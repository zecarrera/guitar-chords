# Guitar Chords Library

A responsive Next.js application for storing guitar chord sheets, organizing them by artist, genre, and custom lists, and opening songs in a play-along reader with adjustable auto-scroll.

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

Create a free Neon project, then set `DATABASE_URL` in `.env` to your Neon Postgres connection string.

Run the database setup flow:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Keep `ENABLE_DATABASE_READS=true` when you want the UI to read from PostgreSQL. If reads are disabled or the database is temporarily unavailable, the app falls back to `lib/demo-data.ts` so the UI remains deployable.

## Architecture overview

- `app/` holds the App Router pages for overview, songs, artists, genres, lists, import review, and reader mode
- `components/auto-scroll-reader.tsx` contains the browser-side play-along experience
- `lib/demo-data.ts` provides build-safe sample content that mirrors the intended domain model
- `prisma/schema.prisma` defines songs, artists, genres, custom lists, chord documents, video links, and import sources

## Render deployment direction

- A ready-to-sync `render.yaml` blueprint is included at the repo root
- The recommended free persistent setup is: Render free web service + external Neon Postgres
- Deploy builds with `npm run db:generate && npm run build`
- Pre-deploy runs `npm run db:migrate && npm run db:seed`
- Health checks use `/api/health`
- During the initial Blueprint sync, Render will prompt you for `DATABASE_URL` because it is marked with `sync: false`
- Set that value to your Neon connection string
- `ENABLE_DATABASE_READS=true` in the deployment so the app uses Neon-backed persistence
- `SEED_DEMO_DATA=true` lets the first deploy populate baseline content if the database is empty

## Neon setup notes

1. Create a free Neon project.
2. Copy the Postgres connection string from Neon.
3. Use that value for local `.env` and for Render's `DATABASE_URL` prompt during Blueprint creation.
4. After the first deploy and initial seed, you can keep `SEED_DEMO_DATA=true` safely because the seed script skips when songs already exist, or set it to `false` once you no longer want automatic baseline seeding.
