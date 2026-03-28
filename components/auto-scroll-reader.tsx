"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { buildChordShapeLookup, getChordShape } from "@/lib/chord-library";
import type { ChordDefinition, ChordSection, VideoLink } from "@/lib/types";

type AutoScrollReaderProps = {
  chordDefinitions?: ChordDefinition[];
  defaultSpeed: number;
  sections: ChordSection[];
  videoLinks?: VideoLink[];
  documentLabel?: string | null;
  documentUrl?: string | null;
};

const storageKey = "guitar-chords:auto-scroll-speed";
const chordTokenPattern = /\[([^[\]]+)\]/g;
const guitarStrings = ["E", "A", "D", "G", "B", "e"];

function subscribeToSpeedStore() {
  return () => {};
}

function getStoredSpeedSnapshot() {
  const storedSpeed = window.localStorage.getItem(storageKey);

  if (!storedSpeed) {
    return null;
  }

  const parsedSpeed = Number(storedSpeed);

  return Number.isFinite(parsedSpeed) && parsedSpeed > 0 ? parsedSpeed : null;
}

function getServerSpeedSnapshot() {
  return null;
}

type ChordDiagramProps = {
  chordName: string;
  chordLookup: Record<string, ChordDefinition>;
};

function ChordDiagram({ chordName, chordLookup }: ChordDiagramProps) {
  const chordShape = getChordShape(chordName, chordLookup);

  if (!chordShape) {
    return (
      <div className="w-52 rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40">
        <p className="text-sm font-semibold text-white">{chordName}</p>
        <p className="mt-2 text-xs leading-5 text-slate-300">
          Chord diagram not in the built-in library yet.
        </p>
      </div>
    );
  }

  const firstDisplayedFret =
    chordShape.baseFret && chordShape.baseFret > 1 ? chordShape.baseFret : 1;
  const stringSpacing = 30;
  const fretSpacing = 24;
  const gridLeft = 34;
  const gridTop = 44;
  const indicatorY = 24;
  const fretCount = 5;
  const stringsWidth = stringSpacing * (guitarStrings.length - 1);
  const gridHeight = fretSpacing * fretCount;

  return (
    <div className="w-72 rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{chordShape.name}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Chord diagram
          </p>
        </div>
        {chordShape.baseFret && chordShape.baseFret > 1 ? (
          <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-200">
            Fret {chordShape.baseFret}
          </span>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <svg
          viewBox="0 0 230 180"
          role="img"
          aria-label={`${chordShape.name} chord diagram`}
          className="h-auto w-full"
        >
          {guitarStrings.map((stringName, index) => {
            const x = gridLeft + index * stringSpacing;

            return (
              <g key={`${chordShape.name}-${stringName}-string`}>
                <text
                  x={x}
                  y={12}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-semibold"
                >
                  {stringName}
                </text>
                <line
                  x1={x}
                  y1={gridTop}
                  x2={x}
                  y2={gridTop + gridHeight}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {Array.from({ length: fretCount + 1 }).map((_, index) => {
            const y = gridTop + index * fretSpacing;

            return (
              <line
                key={`fret-line-${index}`}
                x1={gridLeft}
                y1={y}
                x2={gridLeft + stringsWidth}
                y2={y}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={firstDisplayedFret === 1 && index === 0 ? 3 : 1.5}
              />
            );
          })}

          {Array.from({ length: fretCount }).map((_, index) => (
            <text
              key={`fret-label-${index}`}
              x={10}
              y={gridTop + index * fretSpacing + fretSpacing / 2 + 4}
              className="fill-slate-500 text-[10px] font-semibold"
            >
              {firstDisplayedFret + index}
            </text>
          ))}

          {guitarStrings.map((stringName, index) => {
            const x = gridLeft + index * stringSpacing;
            const fret = chordShape.frets[index];

            if (fret === "x") {
              return (
                <text
                  key={`${chordShape.name}-${stringName}-mute`}
                  x={x}
                  y={indicatorY}
                  textAnchor="middle"
                  className="fill-rose-300 text-[12px] font-semibold"
                >
                  x
                </text>
              );
            }

            if (fret === 0) {
              return (
                <circle
                  key={`${chordShape.name}-${stringName}-open`}
                  cx={x}
                  cy={indicatorY - 2}
                  r={6}
                  fill="none"
                  stroke="rgba(251,191,36,0.9)"
                  strokeWidth="2"
                />
              );
            }

            const displayFret = fret - firstDisplayedFret + 1;

            if (displayFret < 1 || displayFret > fretCount) {
              return null;
            }

            const finger = chordShape.fingers[index];
            const y = gridTop + (displayFret - 0.5) * fretSpacing;

            return (
              <g key={`${chordShape.name}-${stringName}-dot`}>
                <circle cx={x} cy={y} r={9} fill="rgba(251,191,36,0.95)" />
                {finger ? (
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    className="fill-slate-950 text-[10px] font-bold"
                  >
                    {finger}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

type ChordLineProps = {
  line: string;
  onHideChordTooltip: () => void;
  onShowChordTooltip: (chordName: string, target: HTMLElement) => void;
};

function ChordLine({
  line,
  onHideChordTooltip,
  onShowChordTooltip,
}: ChordLineProps) {
  const matches = Array.from(line.matchAll(chordTokenPattern));

  if (matches.length === 0) {
    return <div className="whitespace-pre-wrap">{line}</div>;
  }

  let lastIndex = 0;

  return (
    <div className="whitespace-pre-wrap">
      {matches.map((match, index) => {
        const chordName = match[1]?.trim();
        const startIndex = match.index ?? 0;
        const before = line.slice(lastIndex, startIndex);
        lastIndex = startIndex + match[0].length;

        return (
          <Fragment key={`${chordName}-${startIndex}-${index}`}>
            {before}
            <span className="inline-block align-baseline">
              <button
                type="button"
                className="cursor-help rounded-md bg-amber-300/15 px-1.5 py-0.5 font-semibold text-amber-200 underline decoration-dotted underline-offset-4 transition hover:bg-amber-300/25 focus-visible:bg-amber-300/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
                onBlur={onHideChordTooltip}
                onMouseEnter={(event) =>
                  onShowChordTooltip(chordName, event.currentTarget)
                }
                onMouseLeave={onHideChordTooltip}
                onFocus={(event) =>
                  onShowChordTooltip(chordName, event.currentTarget)
                }
              >
                {match[0]}
              </button>
            </span>
          </Fragment>
        );
      })}
      {line.slice(lastIndex)}
    </div>
  );
}

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
  chordDefinitions = [],
  defaultSpeed,
  sections,
  videoLinks = [],
  documentLabel,
  documentUrl,
}: AutoScrollReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const savedSpeed = useSyncExternalStore(
    subscribeToSpeedStore,
    getStoredSpeedSnapshot,
    getServerSpeedSnapshot,
  );
  const [manualSpeed, setManualSpeed] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeChordTooltip, setActiveChordTooltip] = useState<{
    chordName: string;
    left: number;
    top: number;
  } | null>(null);
  const speed = manualSpeed ?? savedSpeed ?? defaultSpeed;

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
  const chordLookup = useMemo(
    () => buildChordShapeLookup(chordDefinitions),
    [chordDefinitions],
  );

  function hideChordTooltip() {
    setActiveChordTooltip(null);
  }

  function showChordTooltip(chordName: string, target: HTMLElement) {
    const rect = target.getBoundingClientRect();

    setActiveChordTooltip({
      chordName,
      left: rect.left + rect.width / 2,
      top: rect.top - 12,
    });
  }

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
              onChange={(event) => setManualSpeed(Number(event.target.value))}
            />
          </label>
        </div>

        <div
          ref={containerRef}
          onScroll={hideChordTooltip}
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
              <div className="mt-4 space-y-1 overflow-x-auto font-mono text-base leading-8 text-slate-100">
                {section.lines.map((line, lineIndex) => (
                  <ChordLine
                    key={`${section.title}-${index}-line-${lineIndex}`}
                    line={line}
                    onHideChordTooltip={hideChordTooltip}
                    onShowChordTooltip={showChordTooltip}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeChordTooltip ? (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full"
          style={{
            left: activeChordTooltip.left,
            top: activeChordTooltip.top,
          }}
        >
          <ChordDiagram
            chordName={activeChordTooltip.chordName}
            chordLookup={chordLookup}
          />
        </div>
      ) : null}

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
