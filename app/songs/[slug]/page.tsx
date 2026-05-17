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

  const firstTutorialVideo = song.videoLinks.find((v) => v.type === "tutorial") ?? song.videoLinks[0] ?? null;

  return (
    <div className="flex flex-col">
      <SongViewChrome />
      <SongPlaybackTracker
        artist={song.artist}
        slug={song.slug}
        title={song.title}
      />

      {/* Compact song header */}
      <section className="song-page-summary px-1 pb-3 pt-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Link
              href="/songs"
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-slate-300 transition hover:border-white/30 hover:text-white"
              aria-label="Back to songs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight text-white">
                {song.title}
              </h1>
              <Link
                href={`/artists/${encodeURIComponent(song.artist)}`}
                className="mt-0.5 text-sm text-slate-400 transition hover:text-slate-200"
              >
                {song.artist}
              </Link>
              {firstTutorialVideo ? (
                <a
                  href={firstTutorialVideo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z" />
                  </svg>
                  Watch tutorial video
                </a>
              ) : null}
            </div>
          </div>

          {/* Badges */}
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {hasCapo ? (
              <span className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">
                Capo {song.capo}
              </span>
            ) : null}
            {hasStrummingPattern ? (
              <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium tracking-wide text-slate-300">
                {song.difficulty}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <AutoScrollReader
        chordDefinitions={chordDefinitions}
        controlsPageChrome
        defaultSpeed={song.scrollSpeed}
        sections={song.sections}
        songSlug={song.slug}
        videoLinks={song.videoLinks}
        documentLabel={song.documentLabel}
        documentUrl={song.documentUrl}
      />
    </div>
  );
}
