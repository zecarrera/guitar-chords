export type PositionedChord = {
  column: number;
  label: string;
  name: string;
};

export type PositionedChordLine = {
  chords: PositionedChord[];
  contentWidth: number;
  lyricText: string;
};

export type ChordLineRow = {
  chords: PositionedChord[];
  lyricText: string;
};

const chordTokenPattern = /\[([^[\]]+)\]/g;

/**
 * Parses a raw chord sheet line (e.g. "[G] Harbor lights are [D] drifting
 * slow") into a lyric-only string plus a list of chord annotations, where
 * each chord's `column` is a character offset into the lyric string. Returns
 * `null` when the line has no `[Chord]` tokens at all.
 */
export function buildPositionedChordLine(line: string): PositionedChordLine | null {
  const matches = Array.from(line.matchAll(chordTokenPattern));

  if (matches.length === 0) {
    return null;
  }

  let lastIndex = 0;
  let lyricText = "";
  let lyricCursor = 0;
  let minimumChordColumn = 0;
  const chords: PositionedChord[] = [];

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
  const { chords, contentWidth, lyricText } = positioned;

  if (maxColumns <= 0 || contentWidth <= maxColumns) {
    return [{ chords, lyricText }];
  }

  const wordSpans: Span[] = Array.from(lyricText.matchAll(/\S+/g)).map((match) => {
    const start = match.index ?? 0;

    return { end: start + match[0].length, start };
  });
  const chordSpans: Span[] = chords.map((chord) => ({
    end: chord.column + chord.label.length,
    start: chord.column,
  }));
  const merged = mergeSpans([...wordSpans, ...chordSpans]);
  const candidates = Array.from(
    new Set([0, contentWidth, ...merged.flatMap((span) => [span.start, span.end])]),
  ).sort((a, b) => a - b);

  const boundaries = computeRowBoundaries(candidates, contentWidth, maxColumns);

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

    const rowChords = chords
      .filter((chord) => chord.column >= start && chord.column < end)
      .map((chord) => ({
        ...chord,
        column: chord.column - start - trimOffset,
      }));

    return { chords: rowChords, lyricText: rowLyricText };
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
