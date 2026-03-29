"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import {
  getPlaybackHistoryStorageSnapshot,
  parsePlaybackHistory,
} from "@/lib/playback-history";
import type { Song } from "@/lib/types";

type RecentSongAccessProps = {
  limit?: number;
  songs: Song[];
};

const emptyPlaybackHistorySnapshot = "";

function subscribeToPlaybackHistory(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener("guitar-chords:playback-history", handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener("guitar-chords:playback-history", handleChange);
  };
}

function getPlaybackHistorySnapshot() {
  return getPlaybackHistoryStorageSnapshot();
}

function getPlaybackHistoryServerSnapshot() {
  return emptyPlaybackHistorySnapshot;
}

function buildFallbackSongs(songs: Song[], limit: number) {
  return [...songs]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit)
    .map((song) => ({
      ...song,
      accessLabel: "Recently added" as const,
    }));
}

export function RecentSongAccess({
  limit = 4,
  songs,
}: RecentSongAccessProps) {
  const fallbackSongs = useMemo(() => buildFallbackSongs(songs, limit), [limit, songs]);
  const playbackHistorySnapshot = useSyncExternalStore(
    subscribeToPlaybackHistory,
    getPlaybackHistorySnapshot,
    getPlaybackHistoryServerSnapshot,
  );
  const playbackHistory = useMemo(
    () => parsePlaybackHistory(playbackHistorySnapshot),
    [playbackHistorySnapshot],
  );
  const quickAccessSongs = useMemo(() => {
    const songsBySlug = new Map(songs.map((song) => [song.slug, song]));
    const playedSongs = playbackHistory
      .map((entry) => songsBySlug.get(entry.slug))
      .filter((song): song is Song => Boolean(song))
      .map((song) => ({
        ...song,
        accessLabel: "Last played" as const,
      }));
    const fallbackBySlug = fallbackSongs.filter(
      (song) => !playedSongs.some((playedSong) => playedSong.slug === song.slug),
    );

    return [...playedSongs, ...fallbackBySlug].slice(0, limit);
  }, [fallbackSongs, limit, playbackHistory, songs]);

  return (
    <div className="space-y-4">
      {quickAccessSongs.map((song) => (
        <Link
          key={song.slug}
          href={`/songs/${song.slug}`}
          className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-amber-300/40 hover:bg-white/10"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">{song.title}</h2>
              <p className="mt-1 text-sm text-slate-300">
                {song.artist} · {song.keySignature} · capo {song.capo}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                song.accessLabel === "Last played"
                  ? "bg-amber-300/15 text-amber-200"
                  : "bg-sky-400/15 text-sky-200"
              }`}
            >
              {song.accessLabel}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
