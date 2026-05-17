"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { updateScrollSpeedAction } from "@/app/manage/actions";
import { buildChordShapeLookup, getChordShape } from "@/lib/chord-library";
import type { ChordDefinition, ChordSection, VideoLink } from "@/lib/types";

type AutoScrollReaderProps = {
  autoPlay?: boolean;
  chordDefinitions?: ChordDefinition[];
  controlsPageChrome?: boolean;
  defaultSpeed: number;
  onPlaybackComplete?: () => void;
  sections: ChordSection[];
  songSlug?: string;
  videoLinks?: VideoLink[];
  documentLabel?: string | null;
  documentUrl?: string | null;
};

const speedStorageKey = "guitar-chords:auto-scroll-speed";
const fontScaleStorageKey = "guitar-chords:reader-font-scale";
const chordTokenPattern = /\[([^[\]]+)\]/g;
const guitarStrings = ["E", "A", "D", "G", "B", "e"];
const minimumScrollSpeed = 6;
const maximumScrollSpeed = 120;
const speedSliderStep = 1;
const speedButtonStep = 1;
const defaultFontScale = 100;
const minimumFontScale = 80;
const maximumFontScale = 150;
const fontScaleStep = 5;

function clampScrollSpeed(value: number) {
  return Math.min(maximumScrollSpeed, Math.max(minimumScrollSpeed, Math.round(value)));
}

function clampFontScale(value: number) {
  return Math.min(maximumFontScale, Math.max(minimumFontScale, Math.round(value)));
}

function subscribeToSpeedStore() {
  return () => {};
}

function getStoredSpeedSnapshot() {
  const storedSpeed = window.localStorage.getItem(speedStorageKey);

  if (!storedSpeed) {
    return null;
  }

  const parsedSpeed = Number(storedSpeed);

  return Number.isFinite(parsedSpeed) && parsedSpeed > 0 ? parsedSpeed : null;
}

function getServerSpeedSnapshot() {
  return null;
}

function getStoredFontScaleSnapshot() {
  const storedFontScale = window.localStorage.getItem(fontScaleStorageKey);

  if (!storedFontScale) {
    return null;
  }

  const parsedFontScale = Number(storedFontScale);

  return Number.isFinite(parsedFontScale) ? clampFontScale(parsedFontScale) : null;
}

function getServerFontScaleSnapshot() {
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
  showChords: boolean;
};

function buildPositionedChordLine(line: string) {
  const matches = Array.from(line.matchAll(chordTokenPattern));

  if (matches.length === 0) {
    return null;
  }

  let lastIndex = 0;
  let lyricText = "";
  let lyricCursor = 0;
  let minimumChordColumn = 0;
  const chords: Array<{
    column: number;
    label: string;
    name: string;
  }> = [];

  for (const match of matches) {
    const startIndex = match.index ?? 0;
    const before = line.slice(lastIndex, startIndex);
    const chordLabel = match[0];
    const chordName = match[1]?.trim();

    lyricText += before;
    lyricCursor += before.length;
    chords.push({
      column: Math.max(lyricCursor, minimumChordColumn),
      label: chordLabel,
      name: chordName,
    });
    minimumChordColumn = Math.max(lyricCursor, minimumChordColumn) + chordLabel.length + 1;
    lastIndex = startIndex + chordLabel.length;
  }

  lyricText += line.slice(lastIndex);

  const contentWidth = Math.max(
    lyricText.length,
    ...chords.map((chord) => chord.column + chord.label.length),
  );

  return {
    chords,
    contentWidth,
    lyricText,
  };
}

function ChordLine({
  line,
  onHideChordTooltip,
  onShowChordTooltip,
  showChords,
}: ChordLineProps) {
  const positionedChordLine = buildPositionedChordLine(line);

  if (!positionedChordLine) {
    return <div className="whitespace-pre-wrap">{line}</div>;
  }

  return (
    <div className="space-y-0">
      {showChords ? (
        <div
          className="relative whitespace-pre text-cyan-400 leading-[1.5]"
          style={{
            width: `${Math.max(positionedChordLine.contentWidth, 1)}ch`,
            height: "1.5em",
          }}
        >
          {positionedChordLine.chords.map((chord, index) => (
            <span
              key={`${chord.name}-${chord.column}-${index}`}
              tabIndex={0}
              className="absolute cursor-help underline decoration-dotted underline-offset-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
              style={{ left: `${chord.column}ch` }}
              onBlur={onHideChordTooltip}
              onMouseEnter={(event) =>
                onShowChordTooltip(chord.name, event.currentTarget)
              }
              onMouseLeave={onHideChordTooltip}
              onFocus={(event) =>
                onShowChordTooltip(chord.name, event.currentTarget)
              }
            >
              {chord.label}
            </span>
          ))}
        </div>
      ) : null}
      {positionedChordLine.lyricText.trim().length > 0 ? (
        <div className="-mt-[0.2em] whitespace-pre text-slate-100 leading-[1.5]">
          {positionedChordLine.lyricText}
        </div>
      ) : null}
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

  if (
    hostname === "youtube.com" ||
    hostname === "m.youtube.com" ||
    hostname === "music.youtube.com" ||
    hostname === "youtube-nocookie.com"
  ) {
    if (parsedUrl.pathname === "/watch") {
      const videoId = parsedUrl.searchParams.get("v");

      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null;
    }

    if (parsedUrl.pathname.startsWith("/shorts/")) {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[1];

      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null;
    }

    if (parsedUrl.pathname.startsWith("/live/")) {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[1];

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

  return null;
}

export function AutoScrollReader({
  autoPlay = false,
  chordDefinitions = [],
  controlsPageChrome = false,
  defaultSpeed,
  onPlaybackComplete,
  sections,
  songSlug,
  videoLinks = [],
  documentLabel,
  documentUrl,
}: AutoScrollReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const savedSpeed = useSyncExternalStore(
    subscribeToSpeedStore,
    getStoredSpeedSnapshot,
    getServerSpeedSnapshot,
  );
  const savedFontScale = useSyncExternalStore(
    subscribeToSpeedStore,
    getStoredFontScaleSnapshot,
    getServerFontScaleSnapshot,
  );
  const [manualSpeed, setManualSpeed] = useState<number | null>(null);
  const [manualFontScale, setManualFontScale] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayModeActive, setIsPlayModeActive] = useState(false);
  const [showChords, setShowChords] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [activeChordTooltip, setActiveChordTooltip] = useState<{
    chordName: string;
    left: number;
    top: number;
  } | null>(null);
  const speed = manualSpeed ?? savedSpeed ?? defaultSpeed;
  const fontScale = manualFontScale ?? savedFontScale ?? defaultFontScale;
  const readerViewportRatio =
    viewportSize && viewportSize.width >= 1024
      ? 0.85
      : viewportSize && viewportSize.width >= 640
        ? 0.82
        : isPlayModeActive
          ? 0.80
          : 0.72;
  const readerHeightStyle = viewportSize
    ? {
        height: `${Math.max(320, Math.round(viewportSize.height * readerViewportRatio))}px`,
      }
    : undefined;
  const readerTypographyStyle = {
    fontSize: `calc(var(--reader-font-size) * ${fontScale / 100})`,
    lineHeight: `calc(var(--reader-line-height) * ${fontScale / 100})`,
  };

  function updateSpeed(nextSpeed: number) {
    setManualSpeed(clampScrollSpeed(nextSpeed));
  }

  function updateFontScale(nextFontScale: number) {
    setManualFontScale(clampFontScale(nextFontScale));
  }

  useEffect(() => {
    window.localStorage.setItem(speedStorageKey, String(speed));
  }, [speed]);

  useEffect(() => {
    window.localStorage.setItem(fontScaleStorageKey, String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    if (autoPlay) {
      setIsPlayModeActive(true);
      setIsPlaying(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wasPlayingRef = useRef(false);
  useEffect(() => {
    if (wasPlayingRef.current && !isPlaying && songSlug && speed !== defaultSpeed) {
      updateScrollSpeedAction(songSlug, speed);
    }
    wasPlayingRef.current = isPlaying;
  }, [isPlaying, songSlug, speed, defaultSpeed]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let wakeLock: WakeLockSentinel | null = null;

    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then((lock) => {
        wakeLock = lock;
      }).catch(() => {
        // Wake lock unavailable or denied — silent fail
      });
    }

    return () => {
      wakeLock?.release();
    };
  }, [isPlaying]);

  useEffect(() => {
    function updateViewportSize() {
      const visualViewport = window.visualViewport;

      setViewportSize({
        width: Math.round(visualViewport?.width ?? window.innerWidth),
        height: Math.round(visualViewport?.height ?? window.innerHeight),
      });
      setActiveChordTooltip(null);
    }

    updateViewportSize();

    window.addEventListener("resize", updateViewportSize);
    window.addEventListener("orientationchange", updateViewportSize);
    window.visualViewport?.addEventListener("resize", updateViewportSize);

    return () => {
      window.removeEventListener("resize", updateViewportSize);
      window.removeEventListener("orientationchange", updateViewportSize);
      window.visualViewport?.removeEventListener("resize", updateViewportSize);
    };
  }, []);

  useEffect(() => {
    if (!controlsPageChrome) {
      return;
    }

    const root = document.documentElement;

    if (isPlayModeActive) {
      root.dataset.songPlayerActive = "true";
    } else {
      delete root.dataset.songPlayerActive;
    }

      return () => {
        delete root.dataset.songPlayerActive;
      };
  }, [controlsPageChrome, isPlayModeActive]);

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
    scrollPositionRef.current = container.scrollTop;

    const step = (timestamp: number) => {
      const elapsedSeconds = (timestamp - previousTimestamp) / 1000;
      previousTimestamp = timestamp;
      scrollPositionRef.current += speed * elapsedSeconds;
      container.scrollTop = scrollPositionRef.current;

      const reachedBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 8;

      if (reachedBottom) {
        setIsPlaying(false);
        onPlaybackComplete?.();
        return;
      }

      frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isPlaying, speed]);

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
    // The chord diagram is at most w-72 (288px). Clamp so the centered tooltip
    // never overflows the left or right viewport edge.
    const tooltipHalfWidth = 144; // half of 288px (w-72)
    const margin = 8;
    const rawLeft = rect.left + rect.width / 2;
    const clampedLeft = Math.max(
      tooltipHalfWidth + margin,
      Math.min(window.innerWidth - tooltipHalfWidth - margin, rawLeft),
    );

    setActiveChordTooltip({
      chordName,
      left: clampedLeft,
      top: rect.top - 12,
    });
  }

  function handleSelectVideo(url: string) {
    setActiveVideoUrl(url);

    window.requestAnimationFrame(() => {
      videoPlayerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <section
      className={`min-w-0 grid gap-6 ${
        videoItems.length > 0 || documentUrl
          ? isPlaying
            ? ""
            : "xl:grid-cols-[minmax(0,1fr)_22rem]"
          : ""
      }`}
    >
      <div className="relative min-w-0">
        {/* Chord sheet scroll area */}
        <div
          ref={containerRef}
          onScroll={(event) => {
            hideChordTooltip();
            scrollPositionRef.current = event.currentTarget.scrollTop;
          }}
          style={readerHeightStyle}
          className="min-w-0 h-[72vh] space-y-3 overflow-y-auto pb-24 pt-2 sm:h-[78vh] sm:space-y-4 sm:pb-28 lg:h-[82vh]"
        >
          {sections.map((section, index) => (
            <div
              key={`${section.title}-${index}`}
              className="min-w-0 px-1"
            >
              {section.title ? (
                <div className="mb-3">
                  <span className="inline-block rounded-full bg-slate-700/60 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-slate-200">
                    {section.title}
                  </span>
                </div>
              ) : null}
              <div
                className="min-w-0 max-w-full overflow-x-auto font-mono text-slate-100 [--reader-font-size:14px] [--reader-line-height:1.6rem] sm:[--reader-font-size:15px] sm:[--reader-line-height:1.75rem] lg:[--reader-font-size:16px] lg:[--reader-line-height:2rem]"
                style={readerTypographyStyle}
              >
                {section.lines.map((line, lineIndex) => (
                  <ChordLine
                    key={`${section.title}-${index}-line-${lineIndex}`}
                    line={line}
                    onHideChordTooltip={hideChordTooltip}
                    onShowChordTooltip={showChordTooltip}
                    showChords={showChords}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Fixed bottom control bar */}
        <div
          className="fixed bottom-0 inset-x-0 z-20 border-t border-white/10 bg-[#0d1421]/95 backdrop-blur-sm"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))", paddingTop: "0.75rem" }}
        >
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 px-4">
          {/* Play / Pause */}
          <button
            type="button"
            aria-label={isPlaying ? "Pause auto-scroll" : "Play auto-scroll"}
            onClick={() => {
              setIsPlayModeActive(true);
              setIsPlaying((playing) => !playing);
            }}
            className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition hover:bg-blue-400 active:scale-95"
          >
            {isPlaying ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Speed control */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateSpeed(speed - speedButtonStep)}
              aria-label="Decrease scroll speed"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 text-lg font-semibold text-white transition hover:border-white/30 hover:bg-white/5 active:scale-95"
            >
              −
            </button>
            <span className="min-w-[2.5rem] text-center text-sm font-semibold text-white">
              {+(speed / defaultSpeed).toFixed(1)}×
            </span>
            <button
              type="button"
              onClick={() => updateSpeed(speed + speedButtonStep)}
              aria-label="Increase scroll speed"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 text-lg font-semibold text-white transition hover:border-white/30 hover:bg-white/5 active:scale-95"
            >
              +
            </button>
          </div>

          {/* Font size + show chords */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateFontScale(fontScale - fontScaleStep)}
              aria-label="Decrease lyrics size"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/30 hover:bg-white/5 active:scale-95"
            >
              <span className="text-xs font-semibold">T</span>
            </button>
            <button
              type="button"
              onClick={() => updateFontScale(fontScale + fontScaleStep)}
              aria-label="Increase lyrics size"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/30 hover:bg-white/5 active:scale-95"
            >
              <span className="text-base font-bold">T</span>
            </button>
            <button
              type="button"
              onClick={() => setShowChords((v) => !v)}
              aria-label={showChords ? "Hide chords" : "Show chords"}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition active:scale-95 ${
                showChords
                  ? "border-blue-400/50 bg-blue-500/20 text-blue-400"
                  : "border-white/15 text-slate-500 hover:border-white/30 hover:bg-white/5"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {showChords ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                )}
              </svg>
            </button>
          </div>
          </div>
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

      {!isPlaying && (videoItems.length > 0 || documentUrl) ? (
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          {videoItems.length > 0 ? (
            <div
              ref={videoPlayerRef}
              className="rounded-3xl border border-white/10 bg-white/5 p-5"
            >
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
                ) : activeVideo ? (
                  <div className="aspect-video p-5 text-sm leading-6 text-slate-300">
                    <p className="font-semibold text-white">{activeVideo.label}</p>
                    <p className="mt-2">
                      This link cannot be embedded in the in-page player. Use{" "}
                      <span className="font-semibold text-white">Open link</span> to
                      watch it in a new tab.
                    </p>
                  </div>
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
                      className={`rounded-2xl border p-4 transition ${
                        activeVideoUrl === video.url
                          ? "border-amber-300/40 bg-amber-300/10"
                          : "border-white/10 bg-slate-950/40"
                      }`}
                    >
                    <p className="text-sm font-semibold text-white">{video.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                      {video.type === "tutorial" ? "Tutorial" : "Song reference"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectVideo(video.url)}
                        className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
                          activeVideoUrl === video.url
                            ? "bg-white/10 text-white"
                            : "bg-amber-300 text-slate-950 hover:bg-amber-200"
                        }`}
                      >
                        {activeVideoUrl === video.url ? "Selected" : "Play here"}
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
            <div className="song-source-document rounded-3xl border border-white/10 bg-white/5 p-5">
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
