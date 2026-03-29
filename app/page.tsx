import Link from "next/link";

import { RecentSongAccess } from "@/components/recent-song-access";
import { getLibrarySnapshot } from "@/lib/data";

export default async function Home() {
  const { artists, customLists, genres, songs } = await getLibrarySnapshot();
  const recentSongs = [...songs]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 3);
  const topArtists = [...artists].sort((left, right) => right.songCount - left.songCount).slice(0, 4);
  const topLists = [...customLists].sort((left, right) => right.songCount - left.songCount).slice(0, 3);
  const quickLinks = [
    {
      title: "Browse songs",
      href: "/songs",
      description:
        "Open the full library and jump straight into reader mode for any song.",
    },
    {
      title: "Artists",
      href: "/artists",
      description:
        "Scan the artists you keep in rotation and move quickly to the right songs.",
    },
    {
      title: "Genres",
      href: "/genres",
      description:
        "Use genre groupings to match the mood of a rehearsal or casual session.",
    },
    {
      title: "Practice lists",
      href: "/lists",
      description:
        "Open saved sets for rehearsals, events, or focused practice blocks.",
    },
  ];
  const overviewStats = [
    {
      label: "Songs ready to play",
      value: String(songs.length),
      description: "Chord sheets you can open quickly from the library.",
    },
    {
      label: "Artists in rotation",
      value: String(artists.length),
      description: "Artists grouped for faster browsing during practice.",
    },
    {
      label: "Genres available",
      value: String(genres.length),
      description: "Styles you can use to narrow the library fast.",
    },
    {
      label: "Saved practice lists",
      value: String(customLists.length),
      description: "Reusable sets for rehearsals and personal sessions.",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Quick access
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Jump back into the songs you have been playing lately.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Songs you open in reader mode are remembered here. If you have not
            played enough songs yet, the remaining spots are filled with the
            most recently added entries in your library.
          </p>
          <div className="mt-8">
            <RecentSongAccess songs={songs} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {overviewStats.map((item) => (
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
                Fresh in the library
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Recently added songs
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
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Artists in rotation
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Keep your regulars close
                </h2>
              </div>
              <Link
                href="/artists"
                className="text-sm font-semibold text-amber-300 transition hover:text-amber-200"
              >
                Browse artists
              </Link>
            </div>
            <div className="mt-6 space-y-3">
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
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Practice lists
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Grab a prepared set fast
                </h2>
              </div>
              <Link
                href="/lists"
                className="text-sm font-semibold text-amber-300 transition hover:text-amber-200"
              >
                Open lists
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              {topLists.map((list) => (
                <div
                  key={list.name}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-white">{list.name}</p>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      {list.songCount} song{list.songCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {list.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
