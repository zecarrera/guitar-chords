import { isKnownChordName } from "@/lib/chord-library";
import {
  planChordDocumentFixes,
  type ChordDocumentFixSummary,
} from "@/lib/chord-document-text";
import {
  classifyChordRow,
  parseInlineChordTokens,
  type ParsedChordToken,
} from "@/lib/chord-syntax";

export type ChordSheetDiagnostic = {
  code:
    | "ambiguous-mixed-row"
    | "bar-delimited-row"
    | "chord-overflows-lyric"
    | "chords-too-close"
    | "consecutive-chord-rows"
    | "malformed-brackets"
    | "missing-chord-diagram"
    | "tab-alignment";
  line: number;
  message: string;
  severity: "info" | "warning";
};

export const chordLayoutRiskCodes: ReadonlyArray<ChordSheetDiagnostic["code"]> = [
  "chord-overflows-lyric",
  "chords-too-close",
  "consecutive-chord-rows",
];

export type RecognizedChordRow = {
  chords: Array<Pick<ParsedChordToken, "name" | "start">>;
  line: number;
  notation: "bare" | "bracketed";
};

export type RecognizedChordPair = RecognizedChordRow & {
  lyricLine: number;
};

export type AutoFormatResult = {
  analyzedText: string;
  diagnostics: ChordSheetDiagnostic[];
  formattedText: string;
  inlineLines: number[];
  instrumentalRows: RecognizedChordRow[];
  missingDiagrams: Array<{ line: number; name: string }>;
  projectedText: string;
  recognizedPairs: RecognizedChordPair[];
  safeFixes: ChordDocumentFixSummary[];
};

function rowSummary(
  line: number,
  classification: Extract<
    ReturnType<typeof classifyChordRow>,
    { kind: "chord-row" }
  >,
): RecognizedChordRow {
  return {
    chords: classification.tokens.map(({ name, start }) => ({ name, start })),
    line,
    notation: classification.notation,
  };
}

// Mirrors the reader: a chord renders its bracketed label, and the next chord
// needs at least one column after it or it is moved to another lane.
function findTightChord(
  tokens: ParsedChordToken[],
): [ParsedChordToken, ParsedChordToken] | null {
  for (let index = 1; index < tokens.length; index += 1) {
    const previous = tokens[index - 1];

    if (tokens[index].start < previous.start + previous.label.length + 1) {
      return [previous, tokens[index]];
    }
  }

  return null;
}

export function autoFormatChordSheet(text: string): AutoFormatResult {
  const fixPlan = planChordDocumentFixes(text);
  const lines = text ? text.split(/\r\n|\r|\n/) : [];
  const classifications = lines.map(classifyChordRow);
  const diagnostics: ChordSheetDiagnostic[] = [];
  const inlineLines: number[] = [];
  const instrumentalRows: RecognizedChordRow[] = [];
  const missingDiagrams: AutoFormatResult["missingDiagrams"] = [];
  const recognizedPairs: RecognizedChordPair[] = [];

  const recordMissingDiagrams = (
    line: number,
    tokens: ParsedChordToken[],
  ) => {
    for (const token of tokens) {
      if (!isKnownChordName(token.name)) {
        missingDiagrams.push({ line, name: token.name });
        diagnostics.push({
          code: "missing-chord-diagram",
          line,
          message: `${token.name} is valid chord syntax but has no available diagram.`,
          severity: "info",
        });
      }
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const classification = classifications[index];

    if (classification.kind === "ambiguous") {
      diagnostics.push({
        code: classification.code,
        line: lineNumber,
        message: classification.message,
        severity: "warning",
      });
      continue;
    }

    if (classification.kind === "chord-row") {
      const nextLine = lines[index + 1];
      const nextClassification = classifications[index + 1];
      const canPair =
        nextLine !== undefined &&
        nextLine.trim().length > 0 &&
        nextClassification?.kind === "other" &&
        !nextLine.includes("[");
      const summary = rowSummary(lineNumber, classification);

      recordMissingDiagrams(lineNumber, classification.tokens);

      const tightChords = findTightChord(classification.tokens);

      if (tightChords) {
        diagnostics.push({
          code: "chords-too-close",
          line: lineNumber,
          message: `${tightChords[0].name} and ${tightChords[1].name} are too close together and may overlap or stack. Add spaces between them.`,
          severity: "warning",
        });
      }

      if (canPair) {
        const lyricLength = nextLine.trimEnd().length;
        const overflowing = classification.tokens.filter(
          (token) => token.start >= lyricLength,
        );

        if (overflowing.length > 0) {
          diagnostics.push({
            code: "chord-overflows-lyric",
            line: lineNumber,
            message: `${overflowing.map((token) => token.name).join(", ")} start${overflowing.length === 1 ? "s" : ""} past the end of the lyric on line ${lineNumber + 1}. Extend the lyric line or move the chords closer.`,
            severity: "warning",
          });
        }

        recognizedPairs.push({ ...summary, lyricLine: lineNumber + 1 });
        index += 1;
      } else {
        instrumentalRows.push(summary);
      }

      continue;
    }

    const inlineTokens = parseInlineChordTokens(lines[index]);

    if (inlineTokens.length > 0) {
      inlineLines.push(lineNumber);
      recordMissingDiagrams(lineNumber, inlineTokens);
    }
  }

  let runStart = 0;

  for (let position = 0; position < instrumentalRows.length; position += 1) {
    const isRunEnd =
      position === instrumentalRows.length - 1 ||
      instrumentalRows[position + 1].line !== instrumentalRows[position].line + 1;

    if (isRunEnd) {
      if (position > runStart) {
        diagnostics.push({
          code: "consecutive-chord-rows",
          line: instrumentalRows[runStart].line,
          message: `${position - runStart + 1} consecutive chord-only rows each display as their own line. Add lyrics between them or merge them if they belong on one line.`,
          severity: "warning",
        });
      }

      runStart = position + 1;
    }
  }

  diagnostics.sort((a, b) => a.line - b.line);

  return {
    analyzedText: text,
    diagnostics,
    formattedText: text,
    inlineLines,
    instrumentalRows,
    missingDiagrams,
    projectedText: fixPlan.projectedText,
    recognizedPairs,
    safeFixes: fixPlan.fixes,
  };
}

export type ApplyAutoFormatFixesResult =
  | {
      status: "applied";
      text: string;
    }
  | {
      status: "no-fixes" | "stale";
    };

export function applyAutoFormatFixes(
  currentText: string,
  analysis: AutoFormatResult,
): ApplyAutoFormatFixesResult {
  if (currentText !== analysis.analyzedText) {
    return { status: "stale" };
  }

  if (analysis.safeFixes.length === 0) {
    return { status: "no-fixes" };
  }

  return {
    status: "applied",
    text: analysis.projectedText,
  };
}
