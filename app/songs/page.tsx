import Link from "next/link";

import { getSongs } from "@/lib/data";

export const dynamic = "force-dynamic";

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
            <h2 className="text-xl font-semibold text-white">{song.title}</h2>
            <p className="mt-1 text-sm text-slate-300">
              {song.artist}{song.capo ? ` · capo ${song.capo}` : ""}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
