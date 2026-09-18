import type { AnchoredChordLine, ChordAnnotation } from "@/lib/types";

export type PositionedChord = ChordAnnotation;

export type PositionedChordLine = {
  chords: PositionedChord[];
  contentWidth: number;
  kind: "instrumental" | "lyrics";
  lyricText: string;
};

export type LaidOutChord = PositionedChord & {
  column: number;
  lane: number;
};

export type ChordLineRow = {
  chords: LaidOutChord[];
  laneCount: number;
  lyricText: string;
};

const chordTokenPattern = /\[([^[\]]+)\]/g;

/**
 * Parses a raw chord sheet line (e.g. "[G] Harbor lights are [D] drifting
 * slow") into a lyric-only string plus a list of chord annotations, where
 * each chord's `anchorColumn` is an immutable character offset into the lyric
 * string. Returns `null` when the line has no `[Chord]` tokens at all.
 */
export function buildPositionedChordLine(
  line: string | AnchoredChordLine,
): PositionedChordLine | null {
  if (typeof line !== "string") {
    return {
      chords: line.chords,
      contentWidth: Math.max(
        line.lyricText.length,
        ...line.chords.map(
          (chord) => chord.anchorColumn + chord.label.length,
        ),
      ),
      kind: line.lyricText.trim().length > 0 ? "lyrics" : "instrumental",
      lyricText: line.lyricText,
    };
  }

  const matches = Array.from(line.matchAll(chordTokenPattern));

  if (matches.length === 0) {
    return null;
  }

  let lastIndex = 0;
  let lyricText = "";
  let lyricCursor = 0;
  const chords: PositionedChord[] = [];

  for (const match of matches) {
    const startIndex = match.index ?? 0;
    const before = line.slice(lastIndex, startIndex);
    const chordLabel = match[0];
    const chordName = match[1]?.trim();

    lyricText += before;
    lyricCursor += before.length;
    chords.push({
      anchorColumn: lyricCursor,
      label: chordLabel,
      name: chordName,
    });
    lastIndex = startIndex + chordLabel.length;
  }

  lyricText += line.slice(lastIndex);
  const kind = lyricText.trim().length > 0 ? "lyrics" : "instrumental";
  const positionedChords =
    kind === "instrumental"
      ? chords.reduce<PositionedChord[]>((result, chord) => {
          const previous = result.at(-1);
          const anchorColumn = previous
            ? Math.max(
                chord.anchorColumn,
                previous.anchorColumn + previous.label.length + 1,
              )
            : chord.anchorColumn;

          result.push({ ...chord, anchorColumn });
          return result;
        }, [])
      : chords;

  const contentWidth = Math.max(
    lyricText.length,
    ...positionedChords.map((chord) => chord.anchorColumn + chord.label.length),
  );

  return {
    chords: positionedChords,
    contentWidth,
    kind,
    lyricText,
  };
}

type Span = {
  end: number;
  start: number;
};

function mergeSpans(spans: Span[]): Span[] {
  if (spans.length === 0) {
    return [];
  }

  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const merged: Span[] = [{ ...sorted[0] }];

  for (let index = 1; index < sorted.length; index += 1) {
    const last = merged[merged.length - 1];
    const current = sorted[index];

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

function computeRowBoundaries(
  candidates: number[],
  contentWidth: number,
  maxColumns: number,
): number[] {
  const boundaries = [0];
  let rowStart = 0;

  while (rowStart < contentWidth) {
    const limit = rowStart + maxColumns;
    let chosen: number | null = null;

    for (const candidate of candidates) {
      if (candidate > rowStart && candidate <= limit) {
        chosen = candidate;
      }
    }

    // No valid break point fits within the budget (a single word or chord
    // token is wider than maxColumns) - force a break at the next valid
    // point anyway rather than looping forever or splitting mid-token.
    if (chosen === null) {
      chosen = candidates.find((candidate) => candidate > rowStart) ?? contentWidth;
    }

    boundaries.push(chosen);
    rowStart = chosen;
  }

  return boundaries;
}

function computeLyricRowBoundaries(
  chords: PositionedChord[],
  wordSpans: Span[],
  lyricText: string,
  maxColumns: number,
): number[] {
  const boundaries = [0];
  let rowStart = 0;

  while (rowStart < lyricText.length) {
    let contentStart = rowStart;

    if (rowStart > 0) {
      while (contentStart < lyricText.length && /\s/.test(lyricText[contentStart])) {
        contentStart += 1;
      }
    }

    if (contentStart >= lyricText.length) {
      boundaries.push(lyricText.length);
      break;
    }

    const remainingWords = wordSpans.filter((span) => span.end > contentStart);
    let rowEnd = remainingWords[0]?.end ?? lyricText.length;

    for (const word of remainingWords) {
      const textFits = word.end - contentStart <= maxColumns;
      const chordLabelsFit = chords
        .filter((chord) => {
          const ownershipColumn = getChordOwnershipColumn(
            lyricText,
            chord.anchorColumn,
          );

          return ownershipColumn >= contentStart && ownershipColumn < word.end;
        })
        .every(
          (chord) =>
            Math.max(0, chord.anchorColumn - contentStart) +
              chord.label.length <=
            maxColumns,
        );

      if ((!textFits || !chordLabelsFit) && rowEnd > contentStart) {
        break;
      }

      rowEnd = word.end;
    }

    boundaries.push(rowEnd);
    rowStart = rowEnd;
  }

  return boundaries;
}

function getChordOwnershipColumn(lyricText: string, anchorColumn: number) {
  let column = Math.min(anchorColumn, lyricText.length);

  while (column < lyricText.length && /\s/.test(lyricText[column])) {
    column += 1;
  }

  return column;
}

export function layoutChordLanes(chords: PositionedChord[]): {
  chords: LaidOutChord[];
  laneCount: number;
} {
  const laneEnds: number[] = [];
  const laidOutChords = chords.map((chord) => {
    let lane = laneEnds.findIndex((end) => chord.anchorColumn >= end + 1);

    if (lane === -1) {
      lane = laneEnds.length;
    }

    laneEnds[lane] = chord.anchorColumn + chord.label.length;

    return {
      ...chord,
      column: chord.anchorColumn,
      lane,
    };
  });

  return {
    chords: laidOutChords,
    laneCount: Math.max(1, laneEnds.length),
  };
}

/**
 * Splits a positioned chord line into visual rows so its content never
 * exceeds `maxColumns` characters wide. Wraps at whitespace between words
 * whenever whitespace is available; falls back to breaking directly between
 * adjacent `[Chord]` tokens when a stretch of the line has no whitespace to
 * break on (e.g. an instrumental run like "[Am][C][G][F]"). Never splits a
 * word or a chord token across two rows, and keeps each chord aligned with
 * its associated word on whichever row that word lands on.
 */
export function wrapPositionedChordLine(
  positioned: PositionedChordLine,
  maxColumns: number,
): ChordLineRow[] {
  const { chords, contentWidth, kind, lyricText } = positioned;

  if (maxColumns <= 0 || contentWidth <= maxColumns) {
    const laidOut = layoutChordLanes(chords);
    return [{ ...laidOut, lyricText }];
  }

  const wordSpans: Span[] = Array.from(lyricText.matchAll(/\S+/g)).map((match) => {
    const start = match.index ?? 0;

    return { end: start + match[0].length, start };
  });
  const boundaries =
    kind === "lyrics"
      ? (() => {
          const lyricBoundaries = computeLyricRowBoundaries(
            chords,
            wordSpans,
            lyricText,
            maxColumns,
          );

          if (contentWidth > lyricText.length) {
            lyricBoundaries.push(contentWidth);
          }

          return lyricBoundaries;
        })()
      : (() => {
          const chordSpans: Span[] = chords.map((chord) => ({
            end: chord.anchorColumn + chord.label.length,
            start: chord.anchorColumn,
          }));
          const merged = mergeSpans(chordSpans);
          const candidates = Array.from(
            new Set([
              0,
              contentWidth,
              ...merged.flatMap((span) => [span.start, span.end]),
            ]),
          ).sort((a, b) => a - b);

          return computeRowBoundaries(candidates, contentWidth, maxColumns);
        })();

  return boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries[index + 1];
    let rowLyricText = lyricText.slice(start, end);
    let trimOffset = 0;

    // Continuation rows drop any leading whitespace left over from the
    // wrap point so wrapped lines don't render with stray indentation.
    if (index > 0) {
      const leadingWhitespace = rowLyricText.match(/^\s+/);

      if (leadingWhitespace) {
        trimOffset = leadingWhitespace[0].length;
        rowLyricText = rowLyricText.slice(trimOffset);
      }
    }

    const isLastRow = index === boundaries.length - 2;
    const rowChords = chords
      .filter((chord) => {
        const ownershipColumn =
          kind === "lyrics"
            ? getChordOwnershipColumn(lyricText, chord.anchorColumn)
            : chord.anchorColumn;

        return (
          ownershipColumn >= start &&
          (ownershipColumn < end ||
            (isLastRow && ownershipColumn === end))
        );
      })
      .map((chord) => ({
        ...chord,
        anchorColumn: Math.max(0, chord.anchorColumn - start - trimOffset),
      }));
    const laidOut = layoutChordLanes(rowChords);

    return { ...laidOut, lyricText: rowLyricText };
  });
}

/**
 * Derives how many monospace characters fit in `containerWidthPx`, given the
 * pixel width of a single character (`characterWidthPx`). Biased down by one
 * character as a safety margin against sub-pixel measurement error.
 */
export function computeMaxColumns(containerWidthPx: number, characterWidthPx: number): number {
  if (containerWidthPx <= 0 || characterWidthPx <= 0) {
    return 0;
  }

  return Math.max(1, Math.floor(containerWidthPx / characterWidthPx) - 1);
}
