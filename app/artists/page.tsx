import Link from "next/link";

import { getArtists } from "@/lib/data";

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Artists
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Group songs by who you play most
        </h1>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {artists.map((artist) => (
          <div
            key={artist.name}
            className="rounded-3xl border border-white/10 bg-slate-900/80 p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/artists/${encodeURIComponent(artist.name)}/play`}
                  className="text-xl font-semibold text-white transition hover:text-amber-300"
                >
                  {artist.name}
                </Link>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                {artist.songCount} songs
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {artist.songSlugs.map((slug) => (
                <Link
                  key={slug}
                  href={`/songs/${slug}`}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-amber-300/40"
                >
                  {slug.replaceAll("-", " ")}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
