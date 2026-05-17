import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SongPageShell } from "@/components/song-page-shell";
import { SongPlaybackTracker } from "@/components/song-playback-tracker";
import { SongViewChrome } from "@/components/song-view-chrome";
import { getChordDefinitions, getSongBySlug, getSongs } from "@/lib/data";

type SongDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const songs = await getSongs();

  return songs.map((song) => ({
    slug: song.slug,
  }));
}

export async function generateMetadata({
  params,
}: SongDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const song = await getSongBySlug(slug);

  if (!song) {
    return {
      title: "Song not found",
    };
  }

  return {
    title: `${song.title} · Guitar Chords Library`,
    description: `${song.title} by ${song.artist} chord sheet with auto-scroll practice tools.`,
  };
}

export default async function SongDetailPage({
  params,
}: SongDetailPageProps) {
  const { slug } = await params;
  const [song, chordDefinitions] = await Promise.all([
    getSongBySlug(slug),
    getChordDefinitions(),
  ]);

  if (!song) {
    notFound();
  }

  return (
    <>
      <SongViewChrome />
      <SongPlaybackTracker
        artist={song.artist}
        slug={song.slug}
        title={song.title}
      />
      <SongPageShell song={song} chordDefinitions={chordDefinitions} />
    </>
  );
}
