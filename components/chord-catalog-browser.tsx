"use client";

import { useMemo, useState } from "react";

import { ChordDiagram } from "@/components/chord-diagram";
import { chordFamilies, chordRoots, filterChordCatalog } from "@/lib/chord-library";

const pageSize = 24;
const controlClass = "min-h-11 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-base text-white";

export function ChordCatalogBrowser() {
  const [search, setSearch] = useState("");
  const [root, setRoot] = useState("");
  const [family, setFamily] = useState("");
  const [page, setPage] = useState(0);
  const results = useMemo(() => filterChordCatalog(search, root, family), [search, root, family]);
  const visible = results.slice(page * pageSize, (page + 1) * pageSize);
  const pageCount = Math.ceil(results.length / pageSize);

  function clearFilters() {
    setSearch("");
    setRoot("");
    setFamily("");
    setPage(0);
  }

  return (
    <section className="space-y-5" aria-label="Chord reference">
      <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <label className="space-y-2 text-sm text-slate-200">
          <span>Search chords</span>
          <input type="search" value={search} placeholder="Cmaj7, F#m, Bb..." className={controlClass}
            onChange={(event) => { setSearch(event.target.value); setPage(0); }} />
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          <span>Root</span>
          <select value={root} className={controlClass} onChange={(event) => { setRoot(event.target.value); setPage(0); }}>
            <option value="">All roots</option>
            {chordRoots.map((name, index) => <option key={name} value={index}>{name}</option>)}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          <span>Family</span>
          <select value={family} className={controlClass} onChange={(event) => { setFamily(event.target.value); setPage(0); }}>
            <option value="">All families</option>
            {chordFamilies.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <button type="button" onClick={clearFilters} className="min-h-11 rounded-full border border-white/15 px-4 text-sm text-slate-200 hover:bg-white/5">Clear filters</button>
      </div>

      <p role="status" className="text-sm text-slate-300">
        {results.length} matching {results.length === 1 ? "chord" : "chords"}
        {results.length > 0 ? ` · Showing ${page * pageSize + 1}-${Math.min((page + 1) * pageSize, results.length)}` : ""}
      </p>
      {results.length === 0 ? (
        <p className="rounded-2xl border border-white/10 p-6 text-slate-300">No chords match. Change your search or clear the filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((chord) => <ChordDiagram key={chord.name} chordName={chord.name} />)}
        </div>
      )}
      {pageCount > 1 ? (
        <nav aria-label="Chord result pages" className="flex items-center justify-center gap-4 text-sm text-slate-200">
          <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className="min-h-11 rounded-full border border-white/15 px-4 disabled:opacity-40">Previous</button>
          <span>Page {page + 1} of {pageCount}</span>
          <button type="button" disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)} className="min-h-11 rounded-full border border-white/15 px-4 disabled:opacity-40">Next</button>
        </nav>
      ) : null}
    </section>
  );
}
