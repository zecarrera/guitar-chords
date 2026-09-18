export const chordDocumentTabSize = 8;

export type ChordDocumentFixCode =
  | "blank-line-runs"
  | "line-endings"
  | "non-breaking-spaces"
  | "outer-blank-space"
  | "tabs"
  | "trailing-whitespace";

export type ChordDocumentFixSummary = {
  code: ChordDocumentFixCode;
  count: number;
  description: string;
};

export type ChordDocumentFixPlan = {
  fixes: ChordDocumentFixSummary[];
  projectedText: string;
  sourceText: string;
};

const fixDescriptions: Record<ChordDocumentFixCode, string> = {
  "blank-line-runs": "Collapse repeated blank lines",
  "line-endings": "Normalize line endings",
  "non-breaking-spaces": "Replace non-breaking spaces",
  "outer-blank-space": "Remove blank space outside the document",
  tabs: `Expand tabs to ${chordDocumentTabSize}-column stops`,
  "trailing-whitespace": "Remove trailing line whitespace",
};

function countMatches(value: string, pattern: RegExp) {
  return Array.from(value.matchAll(pattern)).length;
}

function expandTabs(line: string) {
  let column = 0;
  let result = "";

  for (const character of line) {
    if (character === "\t") {
      const spaceCount = chordDocumentTabSize - (column % chordDocumentTabSize);
      result += " ".repeat(spaceCount);
      column += spaceCount;
    } else {
      result += character;
      column += 1;
    }
  }

  return result;
}

function summarizeFix(
  code: ChordDocumentFixCode,
  count: number,
): ChordDocumentFixSummary | null {
  return count > 0
    ? {
        code,
        count,
        description: fixDescriptions[code],
      }
    : null;
}

export function planChordDocumentFixes(value: string): ChordDocumentFixPlan {
  const fixes: ChordDocumentFixSummary[] = [];
  const lineEndingCount = countMatches(value, /\r\n|\r/g);
  const nonBreakingSpaceCount = countMatches(value, /\u00a0/g);
  const tabCount = countMatches(value, /\t/g);
  const canonicalText = value
    .replace(/\r\n?|\r/g, "\n")
    .replace(/\u00a0/g, " ");
  const sourceLines = canonicalText.split("\n");
  const trailingWhitespaceCount = sourceLines.filter(
    (line) => line.length > 0 && /[ \t]+$/.test(line),
  ).length;
  const normalizedLines = sourceLines.map((line) =>
    expandTabs(line).replace(/[ ]+$/, ""),
  );

  let outerBlankCount = 0;

  while (normalizedLines[0]?.trim().length === 0) {
    normalizedLines.shift();
    outerBlankCount += 1;
  }

  while (normalizedLines.at(-1)?.trim().length === 0) {
    normalizedLines.pop();
    outerBlankCount += 1;
  }

  const result: string[] = [];
  let previousWasBlank = false;
  let redundantBlankCount = 0;

  for (const line of normalizedLines) {
    const isBlank = line.trim().length === 0;

    if (isBlank) {
      if (!previousWasBlank) {
        result.push("");
      } else {
        redundantBlankCount += 1;
      }
    } else {
      result.push(line);
    }

    previousWasBlank = isBlank;
  }

  for (const fix of [
    summarizeFix("line-endings", lineEndingCount),
    summarizeFix("non-breaking-spaces", nonBreakingSpaceCount),
    summarizeFix("tabs", tabCount),
    summarizeFix("trailing-whitespace", trailingWhitespaceCount),
    summarizeFix("outer-blank-space", outerBlankCount),
    summarizeFix("blank-line-runs", redundantBlankCount),
  ]) {
    if (fix) {
      fixes.push(fix);
    }
  }

  return {
    fixes,
    projectedText: result.join("\n"),
    sourceText: value,
  };
}

export function normalizeChordDocumentText(value: string) {
  return planChordDocumentFixes(value).projectedText;
}

export function normalizeOptionalChordDocumentText(value: string | null) {
  return value === null ? null : normalizeChordDocumentText(value);
}

export function resolveUpdatedChordDocumentText({
  existingText,
  extractedFromPdf,
  submittedText,
}: {
  existingText: string | null;
  extractedFromPdf: string | null;
  submittedText: string | null;
}) {
  if (
    extractedFromPdf &&
    (!submittedText || submittedText === existingText)
  ) {
    return normalizeChordDocumentText(extractedFromPdf);
  }

  return normalizeOptionalChordDocumentText(submittedText);
}
