"use client";

import { useEffect } from "react";

import { recordSongPlayback } from "@/lib/playback-history";

type SongPlaybackTrackerProps = {
  artist: string;
  slug: string;
  title: string;
};

export function SongPlaybackTracker({
  artist,
  slug,
  title,
}: SongPlaybackTrackerProps) {
  useEffect(() => {
    recordSongPlayback({
      artist,
      slug,
      title,
    });
  }, [artist, slug, title]);

  return null;
}
