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

Set `DATABASE_URL` in `.env` to a PostgreSQL database.

Run the database setup flow:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Set `ENABLE_DATABASE_READS=true` when you want the UI to read from PostgreSQL. This is enabled in `render.yaml` for production. If reads are disabled or the database is temporarily unavailable, the app falls back to `lib/demo-data.ts` so the UI remains deployable.

## Architecture overview

- `app/` holds the App Router pages for overview, songs, artists, genres, lists, import review, and reader mode
- `components/auto-scroll-reader.tsx` contains the browser-side play-along experience
- `lib/demo-data.ts` provides build-safe sample content that mirrors the intended domain model
- `prisma/schema.prisma` defines songs, artists, genres, custom lists, chord documents, video links, and import sources

## Render deployment direction

- A ready-to-sync `render.yaml` blueprint is included at the repo root
- The blueprint provisions a Node web service plus a PostgreSQL database
- Deploy builds with `npm run db:generate && npm run build`
- Pre-deploy runs `npm run db:migrate && npm run db:seed`
- Health checks use `/api/health`
- Keep `SEED_DEMO_DATA=true` for the first baseline deploy, then turn it off after real content is added
