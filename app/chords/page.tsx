import { ChordCatalogBrowser } from "@/components/chord-catalog-browser";
import { getChordCatalog } from "@/lib/data";

export default function ChordsPage() {
  const catalog = getChordCatalog();
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Chord library</p>
        <h1 className="text-3xl font-semibold text-white">Find your chord shape</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-300">
          Browse {catalog.length} chords in standard tuning, from low E to high e.
          Each diagram uses the catalog&apos;s first position, just like the song reader.
          Default does not necessarily mean easiest.
        </p>
      </section>
      <ChordCatalogBrowser />
      <p className="text-xs leading-5 text-slate-400">
        Chord data by{" "}
        <a className="underline hover:text-white" href="https://github.com/tombatossals/chords-db">tombatossals/chords-db</a>
        {" "}(<a className="underline hover:text-white" href="/chord-data-LICENSE.txt">MIT license</a>).
        {" "}A bundled, read-only reference; some chords and fingerings have known limitations.
      </p>
    </div>
  );
}
