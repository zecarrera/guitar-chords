import type {
  AnchoredChordLine,
  ChordAnnotation,
  ChordSection,
} from "@/lib/types";

const chordTokenPattern = /\[([^[\]]+)\]/g;

function parseChordOnlyLine(line: string): ChordAnnotation[] | null {
  const matches = Array.from(line.matchAll(chordTokenPattern));

  if (
    matches.length === 0 ||
    line.replace(chordTokenPattern, "").trim().length > 0
  ) {
    return null;
  }

  return matches.map((match) => ({
    anchorColumn: match.index ?? 0,
    label: match[0],
    name: match[1]?.trim(),
  }));
}

function buildLogicalLines(lines: string[]): ChordSection["lines"] {
  const logicalLines: ChordSection["lines"] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const chords = parseChordOnlyLine(line);
    const nextLine = lines[index + 1];
    const nextLineChords =
      nextLine === undefined ? null : parseChordOnlyLine(nextLine);
    const canPair =
      chords !== null &&
      nextLine !== undefined &&
      nextLineChords === null &&
      !nextLine.includes("[") &&
      nextLine.trim().length > 0;

    if (canPair) {
      const anchoredLine: AnchoredChordLine = {
        chords: chords.map((chord) => ({
          ...chord,
          anchorColumn: Math.min(chord.anchorColumn, nextLine.length),
        })),
        kind: "anchored",
        lyricText: nextLine,
      };

      logicalLines.push(anchoredLine);
      index += 1;
    } else {
      logicalLines.push(line);
    }
  }

  return logicalLines;
}

export function parseChordSections(extractedText?: string | null): ChordSection[] {
  if (!extractedText) {
    return [
      {
        title: "Chord sheet",
        lines: ["Chord content will appear here after the document is imported."],
      },
    ];
  }

  const blocks = extractedText
    .split(/\n\s*\n/g)
    .map((block) =>
      block
        .split("\n")
        .filter((line) => line.trim().length > 0),
    )
    .filter((block) => block.length > 0);

  if (blocks.length === 0) {
    return [
      {
        title: "Chord sheet",
        lines: [extractedText],
      },
    ];
  }

  return blocks.map((block, index) => {
    const [firstLine, ...rest] = block;
    const trimmedFirstLine = firstLine.trim();
    const useFirstLineAsTitle =
      rest.length > 0 &&
      !trimmedFirstLine.includes("[") &&
      trimmedFirstLine.length <= 40;

    return {
      title: useFirstLineAsTitle ? trimmedFirstLine : `Section ${index + 1}`,
      lines: buildLogicalLines(useFirstLineAsTitle ? rest : block),
    };
  });
}
