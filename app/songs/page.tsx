import Link from "next/link";

import { getSongs } from "@/lib/data";

export default async function SongsPage() {
  const songs = await getSongs();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Song library
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Browse stored chord sheets
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Each song keeps normalized metadata alongside its source material so
          future filters can stay fast even when imported PDFs or external links
          need manual cleanup.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {songs.map((song) => (
          <Link
            key={song.slug}
            href={`/songs/${song.slug}`}
            className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:border-amber-300/40 hover:bg-slate-900"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{song.title}</h2>
                <p className="mt-1 text-sm text-slate-300">{song.artist}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                {song.sourceType === "pdf" ? "PDF import" : "External link"}
              </span>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  Key
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  {song.keySignature}
                </dd>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  Capo
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  {song.capo}
                </dd>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  Reader preset
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  {song.scrollSpeed} px/s
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              {song.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-200"
                >
                  {genre}
                </span>
              ))}
              {song.lists.map((list) => (
                <span
                  key={list}
                  className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-medium text-amber-100"
                >
                  {list}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
