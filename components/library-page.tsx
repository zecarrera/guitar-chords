"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import {
  createSongFromModalAction,
  deleteSongAction,
  updateSongFromModalAction,
} from "@/app/manage/actions";
import { autoFormatChordSheet } from "@/lib/auto-format";

/* ─── Types ─────────────────────────────────────────── */

type VideoLink = { url: string };

type SongDocument = {
  id: string;
  title: string;
  sourceType: string;
  sourceUrl: string | null;
  fileUrl: string | null;
  extractedText: string | null;
  scrollSpeed: number | null;
};

type SongRow = {
  id: string;
  title: string;
  slug: string;
  artistId: string;
  artist: { name: string };
  capo: number | null;
  difficulty: string | null;
  notes: string | null;
  status: string;
  genres: { id: string }[];
  customLists: { id: string }[];
  documents: SongDocument[];
  videoLinks: VideoLink[];
};

type ArtistRow = {
  id: string;
  name: string;
  _count: { songs: number };
};

type GenreRow = { id: string; name: string };
type ListRow = { id: string; name: string };

type LibraryPageProps = {
  songs: SongRow[];
  artists: ArtistRow[];
  genres: GenreRow[];
  customLists: ListRow[];
};

/* ─── Icons ──────────────────────────────────────────── */
function PencilIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

/* ─── Shared modal shell ─────────────────────────────── */
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-white/10 bg-[#131f35] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 text-slate-400 transition hover:border-white/30 hover:text-white">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ─── Shared content editor panel ───────────────────── */
function ContentEditor({ defaultText }: { defaultText?: string | null }) {
  const [contentType, setContentType] = useState<"text" | "pdf">("text");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [formatDone, setFormatDone] = useState(false);

  function handleAutoFormat() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.value = autoFormatChordSheet(ta.value);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    setFormatDone(true);
    setTimeout(() => setFormatDone(false), 2000);
  }

  return (
    <div className="flex flex-col space-y-3">
      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-300">Content Input</p>
        <div className="flex rounded-xl border border-white/10 bg-[#0d1421] p-1">
          {(["text", "pdf"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setContentType(t)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${contentType === t ? "bg-blue-500 text-white shadow" : "text-slate-400 hover:text-white"}`}>
              {t === "text" ? "Text Input" : "PDF Upload"}
            </button>
          ))}
        </div>
      </div>

      {contentType === "pdf" && (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-[#0d1421] py-6 transition hover:border-white/30">
          <svg className="h-7 w-7 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-sm text-slate-400">Click to upload PDF</span>
          <input type="file" name="pdfFile" accept="application/pdf" className="hidden" />
        </label>
      )}

      <div className="flex flex-1 flex-col">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {contentType === "pdf" ? "Parsed PDF content (editable)" : "Format: [Chord]lyrics"}
          </span>
          <button type="button" onClick={handleAutoFormat}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${formatDone ? "bg-emerald-500/20 text-emerald-300" : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"}`}>
            {formatDone ? "Done!" : "Auto Format"}
          </button>
        </div>
        <textarea ref={textareaRef} name="extractedText" rows={contentType === "pdf" ? 10 : 14}
          defaultValue={defaultText ?? ""}
          placeholder={contentType === "pdf" ? "Parsed text will appear here after upload…" : "[Em7]Today is gonna be the day..."}
          className="w-full resize-none rounded-xl border border-white/10 bg-[#0d1421] px-3.5 py-3 font-mono text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50" />
      </div>
    </div>
  );
}

/* ─── Add Song Modal ─────────────────────────────────── */
function AddSongModal({ artistNames, onClose }: { artistNames: string[]; onClose: () => void }) {
  return (
    <ModalShell title="Add New Song" onClose={onClose}>
      <form action={createSongFromModalAction}>
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {/* Left */}
          <div className="space-y-4">
            <Field label="Title"><input name="title" required placeholder="Song title" className={inputCls} /></Field>
            <Field label="Artist">
              <input name="artistName" required list="artist-suggestions" placeholder="Artist name" className={inputCls} />
              <datalist id="artist-suggestions">{artistNames.map((n) => <option key={n} value={n} />)}</datalist>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Capo"><input name="capo" type="number" min="0" max="11" defaultValue="0" className={inputCls} /></Field>
              <Field label="Strumming Pattern"><input name="difficulty" placeholder="D DU UDU" className={inputCls} /></Field>
            </div>
            <Field label={<>Video URL <span className="text-slate-500">(optional)</span></>}>
              <input name="videoUrl" type="url" placeholder="https://youtube.com/..." className={inputCls} />
            </Field>
          </div>
          {/* Right */}
          <ContentEditor />
        </div>
        <ModalFooter onClose={onClose} submitLabel="Add Song" />
      </form>
    </ModalShell>
  );
}

/* ─── Edit Song Modal ────────────────────────────────── */
function EditSongModal({
  song,
  artists,
  genres,
  customLists,
  onClose,
}: {
  song: SongRow;
  artists: ArtistRow[];
  genres: GenreRow[];
  customLists: ListRow[];
  onClose: () => void;
}) {
  const doc = song.documents[0];
  const selectedGenreIds = new Set(song.genres.map((g) => g.id));
  const selectedListIds = new Set(song.customLists.map((l) => l.id));

  return (
    <ModalShell title={`Edit: ${song.title}`} onClose={onClose}>
      <form action={updateSongFromModalAction}>
        <input type="hidden" name="songId" value={song.id} />
        <input type="hidden" name="documentId" value={doc?.id ?? ""} />
        <input type="hidden" name="documentTitle" value={doc?.title ?? `${song.title} chord sheet`} />
        <input type="hidden" name="sourceType" value={doc?.sourceType ?? "PDF"} />

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {/* Left */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title">
                <input name="title" required defaultValue={song.title} className={inputCls} />
              </Field>
              <Field label="Slug">
                <input name="slug" required defaultValue={song.slug} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Artist">
                <select name="artistId" defaultValue={song.artistId} className={inputCls}>
                  {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={song.status} className={inputCls}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Capo"><input name="capo" type="number" min="0" max="11" defaultValue={song.capo ?? 0} className={inputCls} /></Field>
              <Field label="Strumming Pattern"><input name="difficulty" defaultValue={song.difficulty ?? ""} className={inputCls} /></Field>
            </div>
            <Field label="Scroll Speed">
              <input name="scrollSpeed" type="number" min="1" defaultValue={doc?.scrollSpeed ?? 24} className={inputCls} />
            </Field>
            {genres.length > 0 && (
              <Field label="Genres">
                <select name="genreIds" multiple defaultValue={Array.from(selectedGenreIds)} size={Math.min(genres.length, 5)} className={inputCls}>
                  {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <p className="mt-1 text-xs text-slate-500">Hold Ctrl/Cmd for multiple</p>
              </Field>
            )}
            {customLists.length > 0 && (
              <Field label="Custom Lists">
                <select name="listIds" multiple defaultValue={Array.from(selectedListIds)} size={Math.min(customLists.length, 5)} className={inputCls}>
                  {customLists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <p className="mt-1 text-xs text-slate-500">Hold Ctrl/Cmd for multiple</p>
              </Field>
            )}
          </div>
          {/* Right */}
          <ContentEditor defaultText={doc?.extractedText} />
        </div>
        <ModalFooter onClose={onClose} submitLabel="Save Changes" />
      </form>
    </ModalShell>
  );
}

/* ─── Helpers ────────────────────────────────────────── */
const inputCls =
  "w-full rounded-xl border border-white/10 bg-[#0d1421] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50";

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function ModalFooter({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
      <button type="button" onClick={onClose} className="cursor-pointer rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/30 hover:text-white">
        Cancel
      </button>
      <button type="submit" className="cursor-pointer rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400">
        {submitLabel}
      </button>
    </div>
  );
}

/* ─── Main Library Page ──────────────────────────────── */
export function LibraryPage({ songs, artists, genres, customLists }: LibraryPageProps) {
  const [activeTab, setActiveTab] = useState<"songs" | "artists">("songs");
  const [query, setQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<SongRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SongRow | null>(null);

  const filteredSongs = songs.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.artist.name.toLowerCase().includes(q);
  });

  const filteredArtists = artists.filter(
    (a) => !query.trim() || a.name.toLowerCase().includes(query.toLowerCase()),
  );

  const artistNames = artists.map((a) => a.name);

  return (
    <>
      {/* Mobile guard */}
      <div className="flex flex-col items-center justify-center py-20 text-center sm:hidden">
        <svg className="mb-4 h-12 w-12 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
        </svg>
        <h2 className="text-lg font-semibold text-white">Desktop only</h2>
        <p className="mt-2 max-w-xs text-sm text-slate-400">
          The Library is only available on desktop. Please open it on a larger screen to manage your songs.
        </p>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:block">
        {/* Page header */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Library</h1>
          <button type="button" onClick={() => setAddModalOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Song
          </button>
        </div>

        {/* Tabs + search */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex gap-1.5">
            {(["songs", "artists"] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${activeTab === tab ? "bg-blue-500 text-white" : "border border-white/10 text-slate-400 hover:text-white"}`}>
                {tab === "songs" ? `Songs (${songs.length})` : `Artists (${artists.length})`}
              </button>
            ))}
          </div>
          <div className="relative ml-auto w-64">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..."
              className="w-full rounded-xl border border-white/10 bg-[#131f35] py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-white/20" />
          </div>
        </div>

        {/* Songs table */}
        {activeTab === "songs" ? (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[2fr_1.5fr_0.5fr_1fr_0.7fr_0.6fr] gap-4 border-b border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Title</span><span>Artist</span><span>Capo</span><span>Strumming</span><span>Video</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-white/8">
              {filteredSongs.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500">No songs found.</p>
              ) : filteredSongs.map((song) => (
                <div key={song.id} className="grid grid-cols-[2fr_1.5fr_0.5fr_1fr_0.7fr_0.6fr] gap-4 px-5 py-3.5 text-sm text-slate-300 transition hover:bg-white/[0.03]">
                  <span className="font-semibold text-white">{song.title}</span>
                  <span>{song.artist.name}</span>
                  <span>{song.capo ?? 0}</span>
                  <span className="text-slate-400">{song.difficulty || "—"}</span>
                  <span>
                    {song.videoLinks.length > 0 ? (
                      <a href={song.videoLinks[0].url} target="_blank" rel="noreferrer" className="text-cyan-400 transition hover:text-cyan-300">Link</a>
                    ) : <span className="text-slate-600">—</span>}
                  </span>
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setEditingSong(song)} aria-label="Edit song"
                      className="cursor-pointer text-slate-500 transition hover:text-white">
                      <PencilIcon />
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(song)} aria-label="Delete song" className="cursor-pointer text-slate-600 transition hover:text-rose-400">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Artists table */
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[2fr_0.5fr] gap-4 border-b border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Artist</span><span>Songs</span>
            </div>
            <div className="divide-y divide-white/8">
              {filteredArtists.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500">No artists found.</p>
              ) : filteredArtists.map((artist) => (
                <div key={artist.id} className="grid grid-cols-[2fr_0.5fr] gap-4 px-5 py-3.5 text-sm text-slate-300 transition hover:bg-white/[0.03]">
                  <Link href={`/artists/${encodeURIComponent(artist.name)}`} className="font-semibold text-white transition hover:text-blue-400">
                    {artist.name}
                  </Link>
                  <span>{artist._count.songs}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {addModalOpen && (
        <AddSongModal artistNames={artistNames} onClose={() => setAddModalOpen(false)} />
      )}
      {editingSong && (
        <EditSongModal
          song={editingSong}
          artists={artists}
          genres={genres}
          customLists={customLists}
          onClose={() => setEditingSong(null)}
        />
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} aria-hidden />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#131f35] p-6 shadow-2xl">
            <h2 className="mb-2 text-lg font-semibold text-white">Delete song?</h2>
            <p className="mb-6 text-sm text-slate-400">
              <span className="font-medium text-white">{confirmDelete.title}</span> will be permanently deleted and cannot be recovered.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)}
                className="cursor-pointer rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/30 hover:text-white">
                Cancel
              </button>
              <form action={deleteSongAction} onSubmit={() => setConfirmDelete(null)}>
                <input type="hidden" name="songId" value={confirmDelete.id} />
                <button type="submit"
                  className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500">
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
