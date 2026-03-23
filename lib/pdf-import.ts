import { createRequire } from "node:module";

type PdfParseResult = {
  text: string;
};

function normalizeExtractedPdfText(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractChordTextFromPdf(fileData: Buffer) {
  const require = createRequire(import.meta.url);
  const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
    dataBuffer: Buffer,
  ) => Promise<PdfParseResult>;
  const result = await pdfParse(fileData);
  const normalizedText = normalizeExtractedPdfText(result.text);

  return normalizedText || null;
}
