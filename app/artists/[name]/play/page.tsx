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
    name: encodeURIComponent(artist.name),
  }));
}

export async function generateMetadata({
  params,
}: ArtistPlaylistPageProps): Promise<Metadata> {
  const { name } = await params;
  const artistName = decodeURIComponent(name);

  return {
    title: `${artistName} · Playlist · Guitar Chords Library`,
  };
}

export default async function ArtistPlaylistPage({
  params,
}: ArtistPlaylistPageProps) {
  const { name } = await params;
  const artistName = decodeURIComponent(name);

  const [songs, chordDefinitions] = await Promise.all([
    getSongsByArtist(artistName),
    getChordDefinitions(),
  ]);

  if (songs.length === 0) {
    notFound();
  }

  return (
    <PlaylistPlayer
      artistName={artistName}
      chordDefinitions={chordDefinitions}
      songs={songs}
    />
  );
}
