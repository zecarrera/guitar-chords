"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AutoScrollReader } from "@/components/auto-scroll-reader";
import type { ChordDefinition, Song } from "@/lib/types";

type PlaylistPlayerProps = {
  artistName: string;
  chordDefinitions: ChordDefinition[];
  songs: Song[];
};

const AUTO_ADVANCE_DELAY_MS = 3000;

export function PlaylistPlayer({
  artistName,
  chordDefinitions,
  songs,
}: PlaylistPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const song = songs[currentIndex];
  const isLast = currentIndex === songs.length - 1;

  function clearCountdown() {
    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  }

  function goToSong(index: number) {
    clearCountdown();
    setCurrentIndex(index);
  }

  const handlePlaybackComplete = useCallback(() => {
    setHasStartedPlayback(true);
    if (isLast) {
      return;
    }

    let remaining = Math.ceil(AUTO_ADVANCE_DELAY_MS / 1000);
    setCountdown(remaining);

    countdownRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        setCountdown(null);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, [isLast]);

  useEffect(() => {
    return () => clearCountdown();
  }, []);

  if (!song) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-4 sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              {artistName} · Playlist
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              {song.title}
            </h1>
            {song.capo > 0 ? (
              <span className="mt-3 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200">
                Capo {song.capo}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
              {currentIndex + 1} / {songs.length}
            </span>
            {countdown !== null ? (
              <div className="flex items-center gap-2 rounded-full bg-amber-300/15 px-4 py-2 text-sm font-semibold text-amber-200">
                <span>Next song in {countdown}s</span>
                <button
                  type="button"
                  onClick={clearCountdown}
                  className="ml-1 text-amber-300/70 transition hover:text-amber-200"
                  aria-label="Cancel auto-advance"
                >
                  ✕
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {songs.map((s, index) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => goToSong(index)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                index === currentIndex
                  ? "border-amber-300/50 bg-amber-300/15 text-amber-200"
                  : "border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </section>

      <AutoScrollReader
        key={song.slug}
        autoPlay={hasStartedPlayback && currentIndex > 0}
        chordDefinitions={chordDefinitions}
        controlsPageChrome
        defaultSpeed={song.scrollSpeed}
        onPlaybackComplete={handlePlaybackComplete}
        sections={song.sections}
        songSlug={song.slug}
        videoLinks={song.videoLinks}
        documentLabel={song.documentLabel}
        documentUrl={song.documentUrl}
      />
    </div>
  );
}
