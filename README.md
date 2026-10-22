# Guitar Chords Library

A responsive Next.js application for storing guitar chord sheets, organizing them by artist, genre, and custom lists, and opening songs in a play-along reader with adjustable auto-scroll.

## Features

- **Song library** — browse all songs alphabetically with instant search by title or artist
- **Play-along reader** — auto-scroll reader with adjustable speed and font size; screen wake lock keeps the display on while playing
- **Chord visibility toggle** — hide chord annotations during playback to practice by ear
- **Artist playlist mode** — tap an artist to queue all their songs; playback advances automatically between songs
- **Auto-save scroll speed** — preferred scroll speed is persisted back to the song after playback stops
- **Interactive chord diagrams** — hover or tap a chord annotation to see a fretboard diagram
- **Built-in chord reference** — browse 828 standard-tuning chords at `/chords`, with name/alias search, root/family filters, and diagrams; no chord management or database setup needed
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
- `lib/chord-library.ts` resolves the bundled chord catalog for reference browsing, reader diagrams, and editor analysis; it never reads PostgreSQL
- `components/chord-diagram.tsx` shares the provider-native diagram renderer between reference cards and reader tooltips
- `prisma/schema.prisma` defines songs, artists, genres, custom lists, chord documents, video links, and import sources

## Built-in chord catalog

The reference uses the MIT-licensed guitar data from
[tombatossals/chords-db](https://github.com/tombatossals/chords-db), pinned and
vendored unchanged under `lib/vendor/chords-db/`. Its README records the exact
revision, checksum, format, and update procedure. The copyright/permission notice
is retained there and served at `/chord-data-LICENSE.txt`.

Every surface uses **the first upstream position**, with its original notes and
finger assignments. Other positions remain in the asset but there is no voicing
selector, ranking, legacy fallback, or personal override. Default does not mean
easiest: B and Bm, for example, include the upstream low F# bass. Known fingering
inaccuracies and missing entries remain possible; absent diagrams are reported
explicitly rather than replaced with a different chord.

Enharmonic aliases such as `A#`/`Bb`, Unicode accidentals, major/minor suffixes,
and slash-bass aliases share lookup without rewriting authored song labels or
their positions. Catalog availability is independent of `ENABLE_DATABASE_READS`
and `SEED_DEMO_DATA`. Neither builds nor application requests fetch provider data.

### Retiring managed chord definitions

Migration `20261022170000_remove_chord_definitions` **drops the old chord table**.
Custom definitions are intentionally not imported; song documents and their
relationships are unchanged. Historical migrations remain intact, but fresh
installs finish with no chord-definition table and the seed no longer writes it.

Before deploying this migration:

1. Pause library writes and prevent traffic to the old application during the
   migration/build switch. A preview deployment must use its own database, not
   migrate the database serving the production application.
2. Create a protected, restorable **full database snapshot/backup**, including
   `ChordDefinition`, songs/documents, and `_prisma_migrations`. With Neon, use an
   isolated pre-release branch/snapshot retained under operator access controls.
   Restore it into an isolated database and verify table data and migration
   history before approving the release. Never commit exports or connection
   values.
3. Deploy using the existing generate/migrate/seed/build order. Migrations run
   before the build succeeds, so keep traffic paused until all steps complete.
4. Verify `/chords` search/filters, aliases, song/playlist tooltips, editor format
   analysis, absent-diagram feedback, and unchanged song documents. Check
   deployment logs for failures; there is no new catalog telemetry. Resume
   traffic only after these checks.

For rollback, including a failure after migration but before a successful build,
keep traffic stopped and restore the **entire pre-release snapshot**, including
its migration history, into the recovery database. Point both protected runtime
and migration environment configuration to that restored database, redeploy the
previous application, and verify its managed chords and songs before resuming
traffic. Restore all managed chord rows, not just the old baseline shapes.

An application-only rollback is not sufficient. Do not mark a successfully
applied migration as failed or edit historical migration files: restoring the
snapshot restores the pre-release migration history too. This lets a later
catalog deployment apply the removal migration normally. If writes have resumed
since the snapshot, reconcile those newer changes before switching databases;
blind snapshot restoration would lose them.

The release rehearsal uses disposable PostgreSQL databases: migrate/seed an old
installation with an additional custom shape, snapshot it, apply the removal,
simulate a subsequent build failure, restore the snapshot, check old migration
status and unchanged songs/documents, and reapply the release. Also migrate/seed
a fresh database. This validates recovery without touching the configured
development or production database.

## Vercel deployment

- `vercel.json` configures the build command: `db:generate && db:migrate && db:seed && build`
- The recommended free persistent setup is: Vercel Hobby + external Neon Postgres
- Database migrations and seeding run as part of the Vercel build step on every deploy (seed is idempotent)
- Health checks are available at `/api/health` but are not required by Vercel
- Configure these environment variables in the Vercel project dashboard:
  - `DATABASE_URL`: Neon's pooled connection string (used at runtime)
  - `DIRECT_URL`: Neon's direct connection string (used by Prisma migrations)
  - `ENABLE_DATABASE_READS=true` so the app reads from Neon-backed persistence
  - `SEED_DEMO_DATA=true` to populate baseline content on the first deploy
- Node.js version is set to **22.x** in the Vercel project settings (Project Settings → General → Node.js Version)
- PDF uploads are capped at **4.5 MB** due to Vercel Hobby's infrastructure-level request body limit

## Security scanning

Every pull request targeting `main` (and every push to `main`) runs
`.github/workflows/security-scan.yml`, which checks for known-vulnerable
dependencies and vulnerable code patterns at no cost:

- **`npm audit --audit-level=high`** — fails the check only when a **high**
  or **critical** severity dependency advisory is found; low/moderate
  findings are reported by `npm audit` but do not fail the PR
- **CodeQL analysis** (`javascript-typescript`) — scans code for vulnerable
  patterns (e.g. injection); results appear as alerts under the repo's
  **Security → Code scanning alerts** tab, not in the job's pass/fail status
- **Dependabot** (`.github/dependabot.yml`) — opens a weekly PR for outdated
  npm dependencies; **Dependabot alerts** and **Dependabot security
  updates** must be enabled once, manually, under **Settings → Code
  security** (there is no committable file for that toggle)

If the `npm audit` check fails on a PR, run `npm audit` locally to see the
affected package and whether `npm audit fix` (or `npm audit fix --force` for
breaking upgrades) resolves it before merging.

## Neon setup notes

1. Create a free Neon project.
2. Copy both the pooled and direct Postgres connection strings from Neon.
3. Use those values for local `.env` and for the Vercel environment variable settings.
4. `SEED_DEMO_DATA=true` is safe to keep permanently — the seed script skips records that already exist.
