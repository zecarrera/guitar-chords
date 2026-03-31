import Link from "next/link";

import { SongDocumentFields } from "@/components/song-document-fields";
import { getManageDashboardData } from "@/lib/admin-data";
import { isDatabaseConfigured } from "@/lib/data";

import {
  createArtistAction,
  createCustomListAction,
  createGenreAction,
  createSongAction,
  deleteArtistAction,
  deleteCustomListAction,
  deleteGenreAction,
  deleteSongAction,
  updateArtistAction,
  updateCustomListAction,
  updateGenreAction,
} from "./actions";

export const dynamic = "force-dynamic";

function sectionCardClass() {
  return "rounded-3xl border border-white/10 bg-slate-900/80 p-6";
}

export default async function ManagePage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-3xl border border-amber-300/30 bg-amber-300/10 p-6 text-sm leading-6 text-amber-100">
        The management UI requires a live database connection. Set
        `DATABASE_URL`, `DIRECT_URL`, and `ENABLE_DATABASE_READS=true` to use
        CRUD tools.
      </div>
    );
  }

  const { artists, customLists, genres, songs } = await getManageDashboardData();

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Manage library
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Create and maintain real chord library records
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-300">
          This admin surface handles the core relational content first: songs,
          artists, genres, custom lists, chord document content, and related
          videos. Import automation can build on top of this later.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className={sectionCardClass()}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Songs
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Library records
              </h2>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="#manage-artists"
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:border-amber-300/40"
            >
              Manage: artists
            </a>
            <a
              href="#manage-lists"
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:border-amber-300/40"
            >
              Manage: lists
            </a>
            <a
              href="#manage-genres"
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:border-amber-300/40"
            >
              Manage: genres
            </a>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr] gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span>Song</span>
              <span>Artist</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-white/10">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr] gap-4 px-4 py-4 text-sm text-slate-200"
                >
                  <div>
                    <p className="font-semibold text-white">{song.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{song.slug}</p>
                  </div>
                  <p>{song.artist.name}</p>
                  <p>{song.status}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/manage/songs/${song.slug}`}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:border-amber-300/40"
                    >
                      Edit
                    </Link>
                    <form action={deleteSongAction}>
                      <input type="hidden" name="songId" value={song.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-rose-400/30 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/10"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={sectionCardClass()}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Create song
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Start a new chord record
          </h2>

          <form
            action={createSongAction}
            className="mt-6 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Title</span>
                <input
                  name="title"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">
                  Slug override
                </span>
                <input
                  name="slug"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  placeholder="optional-custom-slug"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Artist</span>
              <select
                name="artistId"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                defaultValue={artists[0]?.id}
                required
              >
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </label>

            <SongDocumentFields />

            <button
              type="submit"
              className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Create song
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-6">
        <div id="manage-artists" className={sectionCardClass()}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Artists
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[1fr_0.45fr_0.8fr] gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span>Name</span>
              <span>Songs</span>
              <span>Actions</span>
            </div>
            <form
              action={createArtistAction}
              className="grid grid-cols-[1fr_0.45fr_0.8fr] gap-4 border-b border-white/10 bg-amber-300/5 px-4 py-4"
            >
              <input
                name="name"
                placeholder="New artist"
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                required
              />
              <div className="flex items-center text-sm text-slate-400">New</div>
              <div className="flex items-start justify-start">
                <button
                  type="submit"
                  className="rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-950"
                >
                  Add row
                </button>
              </div>
            </form>
            <div className="divide-y divide-white/10">
              {artists.map((artist) => (
                <form
                  key={artist.id}
                  action={updateArtistAction}
                  className="grid grid-cols-[1fr_0.45fr_0.8fr] gap-4 px-4 py-4"
                >
                  <input type="hidden" name="id" value={artist.id} />
                  <input
                    name="name"
                    defaultValue={artist.name}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                    required
                  />
                  <div className="flex items-center text-sm text-slate-300">
                    {artist._count.songs}
                  </div>
                  <div className="flex items-start justify-start gap-2">
                    <button
                      type="submit"
                      className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-100"
                    >
                      Save
                    </button>
                    <button
                      type="submit"
                      formAction={deleteArtistAction}
                      disabled={artist._count.songs > 0}
                      className="rounded-full border border-rose-400/30 px-3 py-2 text-xs font-semibold text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </div>
        </div>

        <div id="manage-genres" className={sectionCardClass()}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Genres
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[1fr_0.45fr_0.8fr] gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span>Name</span>
              <span>Songs</span>
              <span>Actions</span>
            </div>
            <form
              action={createGenreAction}
              className="grid grid-cols-[1fr_0.45fr_0.8fr] gap-4 border-b border-white/10 bg-amber-300/5 px-4 py-4"
            >
              <input
                name="name"
                placeholder="New genre"
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                required
              />
              <div className="flex items-center text-sm text-slate-400">New</div>
              <div className="flex items-start justify-start">
                <button
                  type="submit"
                  className="rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-950"
                >
                  Add row
                </button>
              </div>
            </form>
            <div className="divide-y divide-white/10">
              {genres.map((genre) => (
                <form
                  key={genre.id}
                  action={updateGenreAction}
                  className="grid grid-cols-[1fr_0.45fr_0.8fr] gap-4 px-4 py-4"
                >
                  <input type="hidden" name="id" value={genre.id} />
                  <input
                    name="name"
                    defaultValue={genre.name}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                    required
                  />
                  <div className="flex items-center text-sm text-slate-300">
                    {genre._count.songs}
                  </div>
                  <div className="flex items-start justify-start gap-2">
                    <button
                      type="submit"
                      className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-100"
                    >
                      Save
                    </button>
                    <button
                      type="submit"
                      formAction={deleteGenreAction}
                      className="rounded-full border border-rose-400/30 px-3 py-2 text-xs font-semibold text-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </div>
        </div>

        <div id="manage-lists" className={sectionCardClass()}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Custom lists
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[1fr_0.5fr_0.45fr_0.8fr] gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span>Name</span>
              <span>Pinned</span>
              <span>Songs</span>
              <span>Actions</span>
            </div>
            <form
              action={createCustomListAction}
              className="grid grid-cols-[1fr_0.5fr_0.45fr_0.8fr] gap-4 border-b border-white/10 bg-amber-300/5 px-4 py-4"
            >
              <input
                name="name"
                placeholder="New list"
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                required
              />
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input type="checkbox" name="isPinned" />
                Pin
              </label>
              <div className="flex items-center text-sm text-slate-400">New</div>
              <div className="flex items-start justify-start">
                <button
                  type="submit"
                  className="rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-950"
                >
                  Add row
                </button>
              </div>
            </form>
            <div className="divide-y divide-white/10">
              {customLists.map((list) => (
                <form
                  key={list.id}
                  action={updateCustomListAction}
                  className="grid grid-cols-[1fr_0.5fr_0.45fr_0.8fr] gap-4 px-4 py-4"
                >
                  <input type="hidden" name="id" value={list.id} />
                  <input
                    name="name"
                    defaultValue={list.name}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                    required
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-200">
                    <input type="checkbox" name="isPinned" defaultChecked={list.isPinned} />
                    Pin
                  </label>
                  <div className="flex items-center text-sm text-slate-300">
                    {list._count.songs}
                  </div>
                  <div className="flex items-start justify-start gap-2">
                    <button
                      type="submit"
                      className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-100"
                    >
                      Save
                    </button>
                    <button
                      type="submit"
                      formAction={deleteCustomListAction}
                      className="rounded-full border border-rose-400/30 px-3 py-2 text-xs font-semibold text-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
