import { createRequire } from "node:module";

import { normalizeChordDocumentText } from "@/lib/chord-document-text";

export { normalizeChordDocumentText } from "@/lib/chord-document-text";

type PdfParseResult = {
  text: string;
};

export async function extractChordTextFromPdf(fileData: Buffer) {
  const require = createRequire(import.meta.url);
  const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
    dataBuffer: Buffer,
  ) => Promise<PdfParseResult>;
  const result = await pdfParse(fileData);
  const normalizedText = normalizeChordDocumentText(result.text);

  return normalizedText || null;
}
