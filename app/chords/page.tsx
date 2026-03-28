import { prisma } from "@/lib/prisma";
import { defaultChordDefinitions, deserializeChordDefinition, formatChordFingers, formatChordFrets } from "@/lib/chord-library";
import { isDatabaseConfigured } from "@/lib/data";

import {
  createChordDefinitionAction,
  deleteChordDefinitionAction,
  updateChordDefinitionAction,
} from "./actions";

export const dynamic = "force-dynamic";

function sectionCardClass() {
  return "rounded-3xl border border-white/10 bg-slate-900/80 p-6";
}

export default async function ChordsPage() {
  const editable = isDatabaseConfigured();
  const chordDefinitions = editable
    ? (
        await prisma.chordDefinition.findMany({
          orderBy: {
            name: "asc",
          },
        })
      ).map((chord) =>
        deserializeChordDefinition({
          id: chord.id,
          name: chord.name,
          frets: chord.frets,
          fingers: chord.fingers,
          baseFret: chord.baseFret,
        }),
      )
    : defaultChordDefinitions;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Chord library
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Reference and maintain your chord shapes
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-300">
          Chord diagrams shown in the reader come from this library. Use string
          order `E, A, D, G, B, e`. For fingers, use `0` when a string is open or
          muted without a fretting finger.
        </p>
        {!editable ? (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            Database editing is unavailable, so this page is showing the built-in
            default chord library in read-only mode.
          </div>
        ) : null}
      </section>

      {editable ? (
        <section className={sectionCardClass()}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Add chord
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Create a new chord shape
          </h2>

          <form action={createChordDefinitionAction} className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1fr_1fr_0.5fr_auto]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Name</span>
              <input
                name="name"
                placeholder="Bm7"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Frets</span>
              <input
                name="frets"
                placeholder="x, 2, 4, 2, 3, 2"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 font-mono text-sm text-white"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Fingers</span>
              <input
                name="fingers"
                placeholder="0, 1, 3, 1, 2, 1"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 font-mono text-sm text-white"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Base fret</span>
              <input
                type="number"
                min="1"
                name="baseFret"
                placeholder="2"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Add chord
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        {chordDefinitions.map((chord) => (
          <div key={chord.id ?? chord.name} className={sectionCardClass()}>
            {editable && chord.id ? (
              <form action={updateChordDefinitionAction} className="space-y-4">
                <input type="hidden" name="id" value={chord.id} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-200">Name</span>
                    <input
                      name="name"
                      defaultValue={chord.name}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-200">
                      Base fret
                    </span>
                    <input
                      type="number"
                      min="1"
                      name="baseFret"
                      defaultValue={chord.baseFret ?? ""}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Frets</span>
                  <input
                    name="frets"
                    defaultValue={formatChordFrets(chord.frets)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 font-mono text-sm text-white"
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Fingers</span>
                  <input
                    name="fingers"
                    defaultValue={formatChordFingers(chord.fingers)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 font-mono text-sm text-white"
                    required
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                  >
                    Save chord
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-2xl font-semibold text-white">{chord.name}</p>
                <p className="mt-4 text-sm text-slate-300">
                  Frets:{" "}
                  <span className="font-mono text-slate-100">
                    {formatChordFrets(chord.frets)}
                  </span>
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Fingers:{" "}
                  <span className="font-mono text-slate-100">
                    {formatChordFingers(chord.fingers)}
                  </span>
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Base fret:{" "}
                  <span className="font-mono text-slate-100">
                    {chord.baseFret ?? "open"}
                  </span>
                </p>
              </div>
            )}

            {editable && chord.id ? (
              <form action={deleteChordDefinitionAction} className="mt-4">
                <input type="hidden" name="id" value={chord.id} />
                <button
                  type="submit"
                  className="rounded-full border border-rose-400/30 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/10"
                >
                  Delete chord
                </button>
              </form>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}
