import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AutoScrollReader } from "@/components/auto-scroll-reader";
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

  const hasCapo = song.capo > 0;
  const hasStrummingPattern =
    song.difficulty.trim().length > 0 && song.difficulty !== "Unspecified";

  return (
    <div className="space-y-6">
      <SongViewChrome />
      <SongPlaybackTracker
        artist={song.artist}
        slug={song.slug}
        title={song.title}
      />
      <section className="song-page-summary rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-4 sm:rounded-[2rem] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              {song.artist}
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
              {song.title}
            </h1>
            {hasCapo || hasStrummingPattern ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {hasCapo ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200">
                    Capo {song.capo}
                  </span>
                ) : null}
                {hasStrummingPattern ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200">
                    Strumming pattern: {song.difficulty}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <Link
            href={`/manage/songs/${song.slug}`}
            className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
          >
            Edit song
          </Link>
        </div>
      </section>

      <AutoScrollReader
        chordDefinitions={chordDefinitions}
        controlsPageChrome
        defaultSpeed={song.scrollSpeed}
        sections={song.sections}
        videoLinks={song.videoLinks}
        documentLabel={song.documentLabel}
        documentUrl={song.documentUrl}
      />
    </div>
  );
}
