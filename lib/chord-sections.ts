import type {
  AnchoredChordLine,
  ChordSection,
} from "@/lib/types";

import { classifyChordRow } from "@/lib/chord-syntax";

function buildAnchoredLine(
  line: string,
  lyricText: string,
): AnchoredChordLine | null {
  const classification = classifyChordRow(line);

  if (classification.kind !== "chord-row") {
    return null;
  }

  return {
    chords: classification.tokens.map((token) => ({
      anchorColumn:
        lyricText.length > 0
          ? Math.min(token.start, lyricText.length)
          : token.start,
      label: token.label,
      name: token.name,
    })),
    kind: "anchored",
    lyricText,
  };
}

function buildLogicalLines(lines: string[]): ChordSection["lines"] {
  const logicalLines: ChordSection["lines"] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineClassification = classifyChordRow(line);
    const nextLine = lines[index + 1];
    const nextLineClassification =
      nextLine === undefined ? null : classifyChordRow(nextLine);
    const canPair =
      lineClassification.kind === "chord-row" &&
      nextLine !== undefined &&
      nextLineClassification?.kind === "other" &&
      !nextLine.includes("[") &&
      nextLine.trim().length > 0;

    if (canPair) {
      logicalLines.push(buildAnchoredLine(line, nextLine)!);
      index += 1;
    } else if (lineClassification.kind === "chord-row") {
      logicalLines.push(buildAnchoredLine(line, "")!);
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
    const firstLineClassification = classifyChordRow(firstLine);
    const useFirstLineAsTitle =
      rest.length > 0 &&
      firstLineClassification.kind === "other" &&
      !trimmedFirstLine.includes("[") &&
      trimmedFirstLine.length <= 40;

    return {
      title: useFirstLineAsTitle ? trimmedFirstLine : `Section ${index + 1}`,
      lines: buildLogicalLines(useFirstLineAsTitle ? rest : block),
    };
  });
}
