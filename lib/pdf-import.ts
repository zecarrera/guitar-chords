import { createRequire } from "node:module";

import { isKnownChordName } from "@/lib/chord-library";

type PdfParseResult = {
  text: string;
};

const chordLinePattern =
  /(^|\s)([A-G](?:#|b)?(?:m|maj|min|sus|add|dim|aug)?(?:\d+)?(?:\/[A-G](?:#|b)?)?)(?=\s|$)/g;

function normalizeChordDocumentTextLayout(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function autoBracketChordLine(line: string) {
  if (!line.trim() || line.includes("[")) {
    return line;
  }

  const replaced = line.replace(chordLinePattern, (match, prefix, chordToken) => {
    return isKnownChordName(chordToken) ? `${prefix}[${chordToken}]` : match;
  });

  const bracketedCount = (replaced.match(/\[[^[\]]+\]/g) ?? []).length;
  const tokenCount = line
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return bracketedCount >= 2 || (bracketedCount >= 1 && tokenCount <= 3)
    ? replaced
    : line;
}

function autoBracketExtractedChords(value: string) {
  return value
    .split("\n")
    .map((line) => autoBracketChordLine(line))
    .join("\n");
}

export function normalizeChordDocumentText(value: string) {
  return autoBracketExtractedChords(normalizeChordDocumentTextLayout(value));
}

export async function extractChordTextFromPdf(fileData: Buffer) {
  const require = createRequire(import.meta.url);
  const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
    dataBuffer: Buffer,
  ) => Promise<PdfParseResult>;
  const result = await pdfParse(fileData);
  const normalizedText = normalizeChordDocumentText(result.text);

  return normalizedText || null;
}
