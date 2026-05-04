import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlaylistPlayer } from "@/components/playlist-player";
import { getArtists, getChordDefinitions, getSongsByArtist } from "@/lib/data";

type ArtistPlaylistPageProps = {
  params: Promise<{ name: string }>;
};

export async function generateStaticParams() {
  const artists = await getArtists();

  return artists.map((artist) => ({
    name: artist.name,
  }));
}

export async function generateMetadata({
  params,
}: ArtistPlaylistPageProps): Promise<Metadata> {
  const { name } = await params;

  return {
    title: `${name} · Playlist · Guitar Chords Library`,
  };
}

export default async function ArtistPlaylistPage({
  params,
}: ArtistPlaylistPageProps) {
  const { name } = await params;

  const [songs, chordDefinitions] = await Promise.all([
    getSongsByArtist(name),
    getChordDefinitions(),
  ]);

  if (songs.length === 0) {
    notFound();
  }

  return (
    <PlaylistPlayer
      artistName={name}
      chordDefinitions={chordDefinitions}
      songs={songs}
    />
  );
}
