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
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/85 p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            {song.artist}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white">
            {song.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            {song.description}
          </p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white/5 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Key
              </dt>
              <dd className="mt-1 text-sm font-semibold text-white">
                {song.keySignature}
              </dd>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Capo
              </dt>
              <dd className="mt-1 text-sm font-semibold text-white">
                {song.capo}
              </dd>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Tuning
              </dt>
              <dd className="mt-1 text-sm font-semibold text-white">
                {song.tuning}
              </dd>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Source
              </dt>
              <dd className="mt-1 text-sm font-semibold text-white">
                {song.sourceType === "pdf" ? "Uploaded PDF" : "External link"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {song.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-200"
              >
                {genre}
              </span>
            ))}
            {song.lists.map((list) => (
              <span
                key={list}
                className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-medium text-amber-100"
              >
                {list}
              </span>
            ))}
          </div>

          {song.documentUrl ? (
            <a
              href={song.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:border-amber-300/40"
            >
              Open source document
            </a>
          ) : null}
        </div>

        <aside className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Video links
            </p>
            <div className="mt-4 space-y-3">
              {song.videoLinks.map((video) => (
                <a
                  key={video.url}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-amber-300/40"
                >
                  <p className="text-sm font-semibold text-white">
                    {video.label}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                    {video.type === "tutorial" ? "Tutorial" : "Song reference"}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm font-semibold text-white">Import notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {song.importNotes}
            </p>
          </div>
        </aside>
      </section>

      <AutoScrollReader
        defaultSpeed={song.scrollSpeed}
        sections={song.sections}
      />
    </div>
  );
}
