import Link from "next/link";
import { notFound } from "next/navigation";

import { getSongEditorData } from "@/lib/admin-data";
import { isDatabaseConfigured } from "@/lib/data";

import {
  createVideoLinkAction,
  deleteVideoLinkAction,
  updateSongAction,
  updateVideoLinkAction,
} from "../../actions";

export const dynamic = "force-dynamic";

type ManageSongPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ManageSongPage({ params }: ManageSongPageProps) {
  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-3xl border border-amber-300/30 bg-amber-300/10 p-6 text-sm leading-6 text-amber-100">
        The management editor requires a live database connection.
      </div>
    );
  }

  const { slug } = await params;
  const { artists, customLists, genres, song } = await getSongEditorData(slug);

  if (!song) {
    notFound();
  }

  const primaryDocument = song.documents[0];
  const selectedGenreIds = new Set(song.genres.map((genre) => genre.id));
  const selectedListIds = new Set(song.customLists.map((list) => list.id));

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Manage song
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{song.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Update song metadata, chord sheet content, related tags, and video
            links from a single place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/songs/${song.slug}`}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100"
          >
            View public page
          </Link>
          <Link
            href="/manage"
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100"
          >
            Back to manage
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <h2 className="text-2xl font-semibold text-white">Song editor</h2>

          <form
            action={updateSongAction}
            className="mt-6 space-y-6"
          >
            <input type="hidden" name="songId" value={song.id} />
            <input type="hidden" name="documentId" value={primaryDocument?.id ?? ""} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Title</span>
                <input
                  name="title"
                  defaultValue={song.title}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Slug</span>
                <input
                  name="slug"
                  defaultValue={song.slug}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Artist</span>
                <select
                  name="artistId"
                  defaultValue={song.artistId}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                >
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Status</span>
                <select
                  name="status"
                  defaultValue={song.status}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Key</span>
                <input
                  name="keySignature"
                  defaultValue={song.keySignature ?? ""}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Capo</span>
                <input
                  type="number"
                  min="0"
                  name="capo"
                  defaultValue={song.capo ?? ""}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Tuning</span>
                <input
                  name="tuning"
                  defaultValue={song.tuning ?? ""}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">
                  Difficulty
                </span>
                <input
                  name="difficulty"
                  defaultValue={song.difficulty ?? ""}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">
                Description
              </span>
              <textarea
                name="description"
                rows={4}
                defaultValue={song.description ?? ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">
                Notes / summary
              </span>
              <textarea
                name="notes"
                rows={3}
                defaultValue={song.notes ?? ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
              />
            </label>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Genres</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {genres.map((genre) => (
                    <label
                      key={genre.id}
                      className="flex items-center gap-2 text-sm text-slate-200"
                    >
                      <input
                        type="checkbox"
                        name="genreIds"
                        value={genre.id}
                        defaultChecked={selectedGenreIds.has(genre.id)}
                      />
                      {genre.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Custom lists</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {customLists.map((list) => (
                    <label
                      key={list.id}
                      className="flex items-center gap-2 text-sm text-slate-200"
                    >
                      <input
                        type="checkbox"
                        name="listIds"
                        value={list.id}
                        defaultChecked={selectedListIds.has(list.id)}
                      />
                      {list.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Chord document</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">
                    Document title
                  </span>
                  <input
                    name="documentTitle"
                    defaultValue={primaryDocument?.title ?? `${song.title} chord sheet`}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">
                    Source type
                  </span>
                  <select
                    name="sourceType"
                    defaultValue={primaryDocument?.sourceType ?? "PDF"}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  >
                    <option value="PDF">PDF</option>
                    <option value="EXTERNAL_LINK">External link</option>
                  </select>
                </label>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">
                    Source URL
                  </span>
                  <input
                    name="sourceUrl"
                    defaultValue={primaryDocument?.sourceUrl ?? ""}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">
                    File URL
                  </span>
                  <input
                    name="fileUrl"
                    defaultValue={primaryDocument?.fileUrl ?? ""}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-2">
                <span className="text-sm font-medium text-slate-200">
                  Reader content
                </span>
                <textarea
                  name="extractedText"
                  rows={18}
                  defaultValue={primaryDocument?.extractedText ?? ""}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 font-mono text-sm text-white"
                />
                <p className="text-xs leading-5 text-slate-400">
                  Leave the existing text untouched when replacing a PDF and the
                  new file will refresh this chord sheet automatically.
                </p>
              </label>

              <label className="mt-4 block space-y-2">
                <span className="text-sm font-medium text-slate-200">
                  Scroll speed
                </span>
                <input
                  type="number"
                  min="1"
                  name="scrollSpeed"
                  defaultValue={primaryDocument?.scrollSpeed ?? 24}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                />
              </label>

              <label className="mt-4 block space-y-2">
                <span className="text-sm font-medium text-slate-200">
                  Replace PDF file
                </span>
                <input
                  type="file"
                  name="pdfFile"
                  accept="application/pdf"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-amber-300 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-950"
                />
                {primaryDocument?.fileName ? (
                  <a
                    href={`/api/documents/${primaryDocument.id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-xs font-semibold text-amber-300"
                  >
                    Current uploaded PDF: {primaryDocument.fileName}
                  </a>
                ) : null}
                <p className="text-xs leading-5 text-slate-400">
                  A newly uploaded PDF is parsed server-side and can update the
                  reader content for auto-scroll playback.
                </p>
              </label>
            </div>

            <button
              type="submit"
              className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Save song
            </button>
          </form>
        </div>

        <aside className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Video links
            </p>
            <div className="mt-4 space-y-4">
              {song.videoLinks.map((video) => (
                <div
                  key={video.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <form action={updateVideoLinkAction} className="space-y-3">
                    <input type="hidden" name="id" value={video.id} />
                    <input type="hidden" name="songSlug" value={song.slug} />
                    <select
                      name="type"
                      defaultValue={video.type}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                    >
                      <option value="TUTORIAL">Tutorial</option>
                      <option value="SONG">Song</option>
                    </select>
                    <input
                      name="label"
                      defaultValue={video.label}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                    />
                    <input
                      name="url"
                      defaultValue={video.url}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-100"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                  <form action={deleteVideoLinkAction} className="mt-3">
                    <input type="hidden" name="id" value={video.id} />
                    <input type="hidden" name="songSlug" value={song.slug} />
                    <button
                      type="submit"
                      className="rounded-full border border-rose-400/30 px-3 py-1 text-xs font-semibold text-rose-200"
                    >
                      Delete video
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm font-semibold text-white">Add video link</p>
            <form action={createVideoLinkAction} className="mt-4 space-y-3">
              <input type="hidden" name="songId" value={song.id} />
              <input type="hidden" name="songSlug" value={song.slug} />
              <select
                name="type"
                defaultValue="TUTORIAL"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
              >
                <option value="TUTORIAL">Tutorial</option>
                <option value="SONG">Song</option>
              </select>
              <input
                name="label"
                placeholder="Lesson or reference title"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                required
              />
              <input
                name="url"
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                required
              />
              <button
                type="submit"
                className="rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-950"
              >
                Add video
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-300">
            <p className="font-semibold text-white">Current import source</p>
            <p className="mt-2">
              {primaryDocument?.importSource
                ? `Import status: ${primaryDocument.importSource.status}`
                : "This song is currently managed directly rather than through an import workflow."}
            </p>
            {primaryDocument?.fileName ? (
              <a
                href={`/api/documents/${primaryDocument.id}/file`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-xs font-semibold text-amber-300"
              >
                Open uploaded PDF
              </a>
            ) : null}
          </div>
        </aside>
      </section>
    </div>
  );
}
