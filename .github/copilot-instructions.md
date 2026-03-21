# Copilot Instructions

## Build, test, and lint commands

- `npm run dev` starts the Next.js development server
- `npm run build` builds the production app
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript without emitting files
- `npm run db:generate` generates the Prisma client
- `npm run db:migrate` applies Prisma migrations
- `npm run db:seed` seeds the baseline guitar library data
- `npm run db:push` pushes the Prisma schema to PostgreSQL
- `npm run db:studio` opens Prisma Studio

There is no automated test runner configured yet, so there is no single-test command at this stage.

## High-level architecture

- This is a single-codebase `Next.js` App Router application intended for Render deployment
- `render.yaml` defines the recommended free deployment: Render web service plus an externally supplied `DATABASE_URL`
- UI routes live in `app/` and load through `lib/data.ts`, which reads PostgreSQL only when `ENABLE_DATABASE_READS=true` and otherwise falls back to `lib/demo-data.ts`
- The long-term relational model is defined in `prisma/schema.prisma` with separate models for songs, artists, genres, custom lists, chord documents, video links, and import sources
- Imported PDFs and external links are source assets, while normalized metadata lives separately so filtering and browsing do not depend on raw import output
- The play-along reader is implemented in `components/auto-scroll-reader.tsx` as a client component because scroll speed and playback state are browser-driven

## Key conventions

- Treat this project as a single-user personal library unless requirements change; do not introduce multi-user ownership assumptions
- Keep import flows review-first: new PDFs and external links should create draft or reviewable records rather than publishing immediately
- Prefer extending the relational schema instead of storing core browsing metadata inside unstructured JSON
- Keep `lib/demo-data.ts` aligned with the Prisma-backed shapes because it doubles as the seed source and the fallback dataset
- Prefer Neon as the free persistent Postgres provider for this project type; Render should receive its connection string through the `DATABASE_URL` secret prompt in the Blueprint flow
- When changing Next.js behavior, check the version-specific guidance in `AGENTS.md` and the relevant docs under `node_modules/next/dist/docs/`
