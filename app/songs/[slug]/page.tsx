import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AutoScrollReader } from "@/components/auto-scroll-reader";
import { getSongBySlug, getSongs } from "@/lib/data";

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
    description: song.summary,
  };
}

export default async function SongDetailPage({
  params,
}: SongDetailPageProps) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);

  if (!song) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          {song.artist}
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
          {song.title}
        </h1>
      </section>

      <AutoScrollReader
        defaultSpeed={song.scrollSpeed}
        sections={song.sections}
        videoLinks={song.videoLinks}
        documentLabel={song.documentLabel}
        documentUrl={song.documentUrl}
      />
    </div>
  );
}
