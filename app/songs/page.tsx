import { SongList } from "@/components/song-list";
import { getSongs } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SongsPage() {
  const songs = await getSongs();
  const sorted = [...songs].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Song library
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Browse stored chord sheets
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Each song keeps normalized metadata alongside its source material so
          future filters can stay fast even when imported PDFs or external links
          need manual cleanup.
        </p>
      </section>

      <SongList songs={sorted} />
    </div>
  );
}
