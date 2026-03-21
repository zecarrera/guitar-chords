import { getImportQueue } from "@/lib/data";

const importSteps = [
  "Upload a PDF or paste a canonical source link.",
  "Store the source asset in object storage and create an import record.",
  "Extract candidate metadata and chord text into a draft document.",
  "Review and edit the draft before marking it as published.",
];

export default async function ImportPage() {
  const importQueue = await getImportQueue();

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/85 p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Import workflow
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Bring in PDFs and external links without losing control.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            This first implementation documents the ingestion UX and data model.
            The next backend step is wiring these actions to object storage and
            database persistence.
          </p>

          <ol className="mt-6 space-y-3">
            {importSteps.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-semibold text-slate-950">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-200">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Planned fields
          </p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl bg-slate-950/40 p-4">
              <p className="font-semibold text-white">PDF upload</p>
              <p className="mt-1">
                Original file, optional song title, artist hint, genre tags, and
                custom list assignment.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/40 p-4">
              <p className="font-semibold text-white">External link</p>
              <p className="mt-1">
                Canonical source URL plus optional notes about formatting or key
                changes that should be preserved.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/40 p-4">
              <p className="font-semibold text-white">Related videos</p>
              <p className="mt-1">
                Tutorial and original-song links are managed separately so they
                can be updated without replacing the chord document.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Draft import queue
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Sample ingestion states
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {importQueue.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{item.source}</p>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
