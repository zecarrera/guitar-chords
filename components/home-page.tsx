"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import {
  getPlaybackHistoryStorageSnapshot,
  parsePlaybackHistory,
} from "@/lib/playback-history";
import type { Song } from "@/lib/types";

function formatTimeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 0) {
    if (diffHours === 0) {
      if (diffMins < 2) return "Just now";
      return `${diffMins} minutes ago`;
    }
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function subscribeToPlaybackHistory(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("guitar-chords:playback-history", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("guitar-chords:playback-history", onStoreChange);
  };
}

function SongCard({
  song,
  timeAgo,
}: {
  song: Song;
  timeAgo?: string;
}) {
  return (
    <Link
      href={`/songs/${song.slug}`}
      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#131f35] px-4 py-3.5 transition hover:border-white/15 hover:bg-[#182440]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-white">{song.title}</p>
        <p className="mt-0.5 truncate text-sm text-slate-400">{song.artist}</p>
        <div className="mt-1.5 flex items-center gap-2">
          {timeAgo ? (
            <span className="text-xs text-slate-500">{timeAgo}</span>
          ) : null}
          <span className="rounded-md bg-amber-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            Capo {song.capo}
          </span>
        </div>
      </div>

      {/* Play button */}
      <div
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"
      >
        <svg className="h-5 w-5 translate-x-0.5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
        </svg>
      </div>
    </Link>
  );
}

type HomePageProps = {
  songs: Song[];
};

export function HomePage({ songs }: HomePageProps) {
  const [query, setQuery] = useState("");

  const playbackHistorySnapshot = useSyncExternalStore(
    subscribeToPlaybackHistory,
    getPlaybackHistoryStorageSnapshot,
    () => "",
  );

  const playbackHistory = useMemo(
    () => parsePlaybackHistory(playbackHistorySnapshot),
    [playbackHistorySnapshot],
  );

  const recentlyPlayed = useMemo(() => {
    const songsBySlug = new Map(songs.map((s) => [s.slug, s]));
    return playbackHistory
      .map((entry) => {
        const song = songsBySlug.get(entry.slug);
        if (!song) return null;
        return { song, timeAgo: formatTimeAgo(entry.lastPlayedAt) };
      })
      .filter((item): item is { song: Song; timeAgo: string } => item !== null);
  }, [songs, playbackHistory]);

  const fallbackSongs = useMemo(
    () =>
      [...songs]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6),
    [songs],
  );

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q),
    );
  }, [songs, query]);

  const listToRender = searchResults ?? (recentlyPlayed.length > 0 ? null : fallbackSongs);

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs or artists..."
          className="w-full rounded-2xl border border-white/10 bg-[#131f35] py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-white/20 focus:ring-0"
        />
      </div>

      {/* Search results */}
      {searchResults !== null ? (
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {searchResults.length === 0
              ? "No results"
              : `${searchResults.length} result${searchResults.length === 1 ? "" : "s"}`}
          </p>
          <div className="space-y-2.5">
            {searchResults.map((song) => (
              <SongCard key={song.slug} song={song} />
            ))}
          </div>
        </section>
      ) : recentlyPlayed.length > 0 ? (
        /* Recently played */
        <section>
          <div className="mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-base font-bold text-white">Recently Played</h2>
          </div>
          <div className="space-y-2.5">
            {recentlyPlayed.map(({ song, timeAgo }) => (
              <SongCard key={song.slug} song={song} timeAgo={timeAgo} />
            ))}
          </div>
        </section>
      ) : (
        /* Fallback: recently added */
        <section>
          <div className="mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            <h2 className="text-base font-bold text-white">Recently Added</h2>
          </div>
          <div className="space-y-2.5">
            {listToRender!.map((song) => (
              <SongCard key={song.slug} song={song} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
