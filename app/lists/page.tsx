import { getCustomLists } from "@/lib/data";

export default async function ListsPage() {
  const customLists = await getCustomLists();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Custom lists
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Organize songs around practice goals
        </h1>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {customLists.map((list) => (
          <div
            key={list.name}
            className="rounded-3xl border border-white/10 bg-slate-900/80 p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">{list.name}</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                {list.songCount} songs
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {list.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {list.songs.map((song) => (
                <span
                  key={song}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-200"
                >
                  {song}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
