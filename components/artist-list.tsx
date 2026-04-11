"use client";

import Link from "next/link";
import { useState } from "react";

import type { ArtistSummary } from "@/lib/types";

type ArtistListProps = {
  artists: ArtistSummary[];
};

export function ArtistList({ artists }: ArtistListProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? artists.filter((artist) =>
        artist.name.toLowerCase().includes(query.toLowerCase()),
      )
    : artists;

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search artists…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-300/40 focus:bg-white/8"
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No artists found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((artist) => (
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
        </div>
      )}
    </div>
  );
}
