"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ChordSection } from "@/lib/types";

type AutoScrollReaderProps = {
  defaultSpeed: number;
  sections: ChordSection[];
};

const storageKey = "guitar-chords:auto-scroll-speed";

export function AutoScrollReader({
  defaultSpeed,
  sections,
}: AutoScrollReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(() => {
    if (typeof window === "undefined") {
      return defaultSpeed;
    }

    const storedSpeed = window.localStorage.getItem(storageKey);

    if (!storedSpeed) {
      return defaultSpeed;
    }

    const parsedSpeed = Number(storedSpeed);

    if (Number.isFinite(parsedSpeed) && parsedSpeed > 0) {
      return parsedSpeed;
    }

    return defaultSpeed;
  });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(speed));
  }, [speed]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    let frameId = 0;
    let previousTimestamp = performance.now();

    const step = (timestamp: number) => {
      const elapsedSeconds = (timestamp - previousTimestamp) / 1000;
      previousTimestamp = timestamp;
      container.scrollTop += speed * elapsedSeconds;

      const reachedBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 8;

      if (reachedBottom) {
        setIsPlaying(false);
        return;
      }

      frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isPlaying, speed]);

  const estimatedMinutes = useMemo(() => {
    const readingUnits = sections.reduce(
      (total, section) => total + section.lines.length * 18,
      0,
    );

    return Math.max(1, Math.round(readingUnits / Math.max(speed, 1) / 6));
  }, [sections, speed]);

  return (
    <section className="grid gap-6 lg:grid-cols-[0.35fr_0.65fr]">
      <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Reader controls
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Auto-scroll play along
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Tune the scroll speed to match your rehearsal tempo. The chosen speed
          is saved in the browser for the next session.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Current speed
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{speed} px/s</p>
          </div>

          <label className="block rounded-2xl bg-slate-950/40 p-4">
            <span className="text-sm font-semibold text-white">
              Scroll speed
            </span>
            <input
              className="mt-4 w-full accent-amber-300"
              type="range"
              min={12}
              max={84}
              step={3}
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((playing) => !playing)}
              className="rounded-full bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Reset
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
            Estimated read-through at this speed: about {estimatedMinutes}{" "}
            minute{estimatedMinutes === 1 ? "" : "s"}.
          </div>
        </div>
      </aside>

      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-4 sm:p-6">
        <div
          ref={containerRef}
          className="max-h-[70vh] space-y-5 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/70 p-5"
        >
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                {section.title}
              </h3>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7 text-slate-100">
                {section.lines.join("\n")}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
