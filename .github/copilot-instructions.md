# Copilot Instructions

## Build, test, and lint commands

- `npm run dev` starts the Next.js development server
- `npm run build` builds the production app
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript without emitting files
- `npm run test` runs Vitest (e.g., `npm run test -- lib/__tests__/auto-format.test.ts` for a single test file)
- `npm run db:generate` generates the Prisma client
- `npm run db:migrate` applies Prisma migrations
- `npm run db:seed` seeds the baseline guitar library data
- `npm run db:push` pushes the Prisma schema to PostgreSQL
- `npm run db:studio` opens Prisma Studio

Node.js **22.13+** is required. Dependencies must be installed with `npm install` before running any commands.

## High-level architecture

- This is a single-codebase `Next.js` App Router application deployed on Vercel
- **Next.js breaking changes warning**: Read `AGENTS.md` and check `node_modules/next/dist/docs/` before writing code—this is Next.js 16.2.1 with APIs that may differ from your training data
- `vercel.json` configures the build command so migrations and seeding run on every deploy
- For Neon, use a pooled `DATABASE_URL` for runtime reads and a direct `DIRECT_URL` for Prisma migrations
- **Data loading pattern**: UI routes live in `app/` and load through `lib/data.ts`, which reads PostgreSQL only when `ENABLE_DATABASE_READS=true` and otherwise falls back to `lib/demo-data.ts`. This keeps the app deployable even when the database is unavailable
- The long-term relational model is defined in `prisma/schema.prisma` with separate models for songs, artists, genres, custom lists, chord documents, video links, and import sources
- Imported PDFs and external links are source assets, while normalized metadata lives separately so filtering and browsing do not depend on raw import output
- The play-along reader is implemented in `components/auto-scroll-reader.tsx` as a client component because scroll speed and playback state are browser-driven
- Test files use Vitest and live in `lib/__tests__/` (e.g., `lib/__tests__/auto-format.test.ts`)

## Key conventions

- **Single-user model**: Treat this project as a personal library unless requirements change; do not introduce multi-user ownership assumptions
- **Review-first imports**: New PDFs and external links should create draft or reviewable records rather than publishing immediately. The import flow tracks `ImportStatus` (QUEUED, PROCESSING, READY_FOR_REVIEW, FAILED, COMPLETED) to support this pattern
- **Schema over JSON**: Prefer extending the relational schema instead of storing core browsing metadata inside unstructured JSON. Filtering and browsing depend on normalized columns, not raw import output
- **Demo data alignment**: Keep `lib/demo-data.ts` aligned with the Prisma-backed shapes because it doubles as both the seed source and the fallback dataset when database reads are disabled
- **Database provider**: Prefer Neon as the free persistent Postgres provider for this project type. Always set both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) as Vercel environment variables
- **Next.js guidance**: When changing Next.js behavior, check the version-specific guidance in `AGENTS.md` and the relevant docs under `node_modules/next/dist/docs/`
- **API routes and data access**: API routes are minimized; most data access goes through `lib/data.ts`, which abstracts the fallback logic. Always check whether you're reading or writing before choosing server-side vs. client-side code

## Branch and pull request workflow

- **Never commit directly to `main`**. Always create a feature branch for every change, no matter how small.
- Branch names should follow `type/short-description` (e.g. `feat/add-capo-filter`, `fix/pdf-timeout`, `chore/update-deps`).
- Push the branch and open a pull request against `main` so changes can be reviewed before merging.
- When a task is complete, remind the user to open a PR rather than pushing to `main` directly.
