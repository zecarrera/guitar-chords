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
    | "malformed-brackets"
    | "missing-chord-diagram"
    | "tab-alignment";
  line: number;
  message: string;
  severity: "info" | "warning";
};

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

      if (canPair) {
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
