import Link from "next/link";

import { getLibrarySnapshot } from "@/lib/data";

export default async function Home() {
  const { songs, source, stats } = await getLibrarySnapshot();
  const recentSongs = songs.slice(0, 3);
  const quickLinks = [
    {
      title: "Import new chord sheets",
      href: "/import",
      description:
        "Review PDF uploads and external links before they become part of your library.",
    },
    {
      title: "Browse song library",
      href: "/songs",
      description:
        "Filter songs by artist, genre, custom list membership, and ingestion source.",
    },
    {
      title: "Play along in reader mode",
      href: songs[0] ? `/songs/${songs[0].slug}` : "/songs",
      description:
        "Open a chord sheet, tune the auto-scroll speed, and keep tutorial links close by.",
    },
    {
      title: "Manage live library",
      href: "/manage",
      description:
        "Create songs, edit chord content, and maintain artists, genres, lists, and video links.",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Personal guitar library
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Keep chord sheets, practice links, and play-along tools in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            This MVP is designed as a single-user library optimized for Render
            deployment. It keeps the UI responsive, treats imported content as
            reviewable drafts, and gives every song a dedicated reader view with
            adjustable auto-scroll.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
            Data source: {source === "database" ? "PostgreSQL" : "demo seed"}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              href="/songs"
            >
              Explore songs
            </Link>
            <Link
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              href="/import"
            >
              Review import flow
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"
            >
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {item.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className="rounded-2xl border border-white/10 bg-slate-900/75 p-6 transition hover:border-amber-300/40 hover:bg-slate-900"
          >
            <h2 className="text-lg font-semibold text-white">{link.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {link.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Recently updated songs
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Ready for rehearsal
              </h2>
            </div>
            <Link
              href="/songs"
              className="text-sm font-semibold text-amber-300 transition hover:text-amber-200"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {recentSongs.map((song) => (
              <Link
                key={song.slug}
                href={`/songs/${song.slug}`}
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {song.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {song.artist} · {song.keySignature} · capo {song.capo}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                    {song.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {song.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Architecture snapshot
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            How this MVP is organized
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
            <li>
              <span className="font-semibold text-white">App Router UI:</span>{" "}
              dashboard, library pages, and reader views are in `app/`.
            </li>
            <li>
              <span className="font-semibold text-white">Domain model:</span>{" "}
              Prisma models cover songs, artists, genres, custom lists, chord
              documents, videos, and import tracking.
            </li>
            <li>
              <span className="font-semibold text-white">Import pipeline:</span>{" "}
              PDFs and external links are treated as source material that should
              be reviewed before publishing.
            </li>
            <li>
              <span className="font-semibold text-white">Reader mode:</span>{" "}
              auto-scroll lives in a client component so users can tune speed in
              the browser without a round trip.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
