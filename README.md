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
npm run db:push
npm run db:studio
```

## Database setup

Set `DATABASE_URL` in `.env` to a PostgreSQL database.

The current UI renders from `lib/demo-data.ts` so the app can build before a database is connected. The Prisma schema is already defined in `prisma/schema.prisma` for the next phase of wiring live persistence.

## Architecture overview

- `app/` holds the App Router pages for overview, songs, artists, genres, lists, import review, and reader mode
- `components/auto-scroll-reader.tsx` contains the browser-side play-along experience
- `lib/demo-data.ts` provides build-safe sample content that mirrors the intended domain model
- `prisma/schema.prisma` defines songs, artists, genres, custom lists, chord documents, video links, and import sources

## Render deployment direction

- Deploy as a Render web service
- Provision PostgreSQL and set `DATABASE_URL`
- Use S3-compatible storage or Cloudinary for uploaded PDFs
- Keep PDF and external-link imports reviewable before publishing songs
