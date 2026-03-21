import { genres } from "@/lib/demo-data";

export default function GenresPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Genres
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Keep browsing fast with normalized tags
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Genres are stored separately from the raw source file so PDF extraction
          mistakes never become the only place where filtering metadata lives.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {genres.map((genre) => (
          <div
            key={genre.name}
            className="rounded-3xl border border-white/10 bg-slate-900/80 p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">{genre.name}</h2>
              <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100">
                {genre.songCount}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {genre.summary}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
