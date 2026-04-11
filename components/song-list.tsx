"use client";

import Link from "next/link";
import { useState } from "react";

import type { Song } from "@/lib/types";

type SongListProps = {
  songs: Song[];
};

export function SongList({ songs }: SongListProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? songs.filter(
        (song) =>
          song.title.toLowerCase().includes(query.toLowerCase()) ||
          song.artist.toLowerCase().includes(query.toLowerCase()),
      )
    : songs;

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search songs or artists…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-300/40 focus:bg-white/8"
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No songs found.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((song) => (
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
        </div>
      )}
    </div>
  );
}
