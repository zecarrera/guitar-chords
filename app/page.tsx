import Link from "next/link";

import { RecentSongAccess } from "@/components/recent-song-access";
import { getLibrarySnapshot } from "@/lib/data";

export default async function Home() {
  const { artists, songs } = await getLibrarySnapshot();
  const recentSongs = [...songs]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 3);
  const topArtists = [...artists].sort((left, right) => right.songCount - left.songCount).slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Fresh in the library
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Recently added songs
            </h2>
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

                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <div>
            <RecentSongAccess songs={songs} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Artists in rotation
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Keep your regulars close
          </h2>
        </div>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {topArtists.map((artist) => (
            <div
              key={artist.name}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-white">{artist.name}</p>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                  {artist.songCount} song{artist.songCount === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {artist.summary}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
