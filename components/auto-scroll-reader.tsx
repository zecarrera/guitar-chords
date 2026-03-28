"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ChordSection, VideoLink } from "@/lib/types";

type AutoScrollReaderProps = {
  defaultSpeed: number;
  sections: ChordSection[];
  videoLinks?: VideoLink[];
  documentLabel?: string | null;
  documentUrl?: string | null;
};

const storageKey = "guitar-chords:auto-scroll-speed";

function getEmbeddedVideoUrl(url: string) {
  if (!URL.canParse(url)) {
    return null;
  }

  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname.replace(/^www\./, "");

  if (hostname === "youtu.be") {
    const videoId = parsedUrl.pathname.slice(1);

    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null;
  }

  if (hostname === "youtube.com" || hostname === "m.youtube.com") {
    if (parsedUrl.pathname === "/watch") {
      const videoId = parsedUrl.searchParams.get("v");

      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null;
    }

    if (parsedUrl.pathname.startsWith("/embed/")) {
      return parsedUrl.toString();
    }
  }

  if (hostname === "vimeo.com") {
    const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];

    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  }

  if (hostname === "player.vimeo.com") {
    return parsedUrl.toString();
  }

  return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:"
    ? parsedUrl.toString()
    : null;
}

export function AutoScrollReader({
  defaultSpeed,
  sections,
  videoLinks = [],
  documentLabel,
  documentUrl,
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
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

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
  const videoItems = useMemo(
    () =>
      videoLinks.map((video) => ({
        ...video,
        embedUrl: getEmbeddedVideoUrl(video.url),
      })),
    [videoLinks],
  );
  const activeVideo =
    videoItems.find((video) => video.url === activeVideoUrl) ?? null;

  return (
    <section
      className={`grid gap-6 ${
        videoItems.length > 0 || documentUrl
          ? "xl:grid-cols-[minmax(0,1fr)_22rem]"
          : ""
      }`}
    >
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((playing) => !playing)}
              className="inline-flex min-w-32 cursor-pointer items-center justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              {isPlaying ? "Pause auto-scroll" : "Play auto-scroll"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex min-w-24 cursor-pointer items-center justify-center rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Stop
            </button>
            <div className="rounded-full bg-white/5 px-4 py-3 text-sm font-medium text-slate-200">
              {speed} px/s
            </div>
            <div className="rounded-full bg-white/5 px-4 py-3 text-sm text-slate-300">
              About {estimatedMinutes} minute{estimatedMinutes === 1 ? "" : "s"}
            </div>
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Scroll speed
            </span>
            <input
              className="mt-3 w-full cursor-pointer accent-amber-300"
              type="range"
              min={12}
              max={84}
              step={3}
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
          </label>
        </div>

        <div
          ref={containerRef}
          className="h-[70vh] space-y-6 overflow-y-auto px-4 py-5 sm:h-[74vh] sm:px-6 sm:py-6 lg:h-[78vh]"
        >
          {sections.map((section, index) => (
            <div
              key={`${section.title}-${index}`}
              className="rounded-3xl border border-white/8 bg-slate-950/70 p-5 sm:p-6"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                {section.title}
              </h3>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-mono text-base leading-8 text-slate-100">
                {section.lines.join("\n")}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {videoItems.length > 0 || documentUrl ? (
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          {videoItems.length > 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Video player
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Tutorial and reference
                  </h2>
                </div>
                {activeVideo ? (
                  <button
                    type="button"
                    onClick={() => setActiveVideoUrl(null)}
                    className="cursor-pointer rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5"
                  >
                    Close
                  </button>
                ) : null}
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
                {activeVideo?.embedUrl ? (
                  <iframe
                    key={activeVideo.embedUrl}
                    src={activeVideo.embedUrl}
                    title={activeVideo.label}
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="aspect-video p-5 text-sm leading-6 text-slate-300">
                    <p className="font-semibold text-white">
                      Play a video without leaving the song page.
                    </p>
                    <p className="mt-2">
                      Select a tutorial or reference link below. If the provider
                      blocks embedding, you can still open it in a new tab.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {videoItems.map((video) => (
                  <div
                    key={video.url}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <p className="text-sm font-semibold text-white">{video.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                      {video.type === "tutorial" ? "Tutorial" : "Song reference"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveVideoUrl(video.url)}
                        className="cursor-pointer rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-200"
                      >
                        Play here
                      </button>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="cursor-pointer rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
                      >
                        Open link
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {documentUrl ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Source document
              </p>
              <a
                href={documentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex cursor-pointer rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:border-amber-300/40"
              >
                Open {documentLabel ?? "source document"}
              </a>
            </div>
          ) : null}
        </aside>
      ) : null}
    </section>
  );
}
