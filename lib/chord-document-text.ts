export function normalizeChordDocumentText(value: string) {
  const normalizedLines = value
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n");

  while (normalizedLines[0]?.trim().length === 0) {
    normalizedLines.shift();
  }

  while (normalizedLines.at(-1)?.trim().length === 0) {
    normalizedLines.pop();
  }

  const result: string[] = [];
  let previousWasBlank = false;

  for (const line of normalizedLines) {
    const isBlank = line.trim().length === 0;

    if (isBlank) {
      if (!previousWasBlank) {
        result.push("");
      }
    } else {
      result.push(line);
    }

    previousWasBlank = isBlank;
  }

  return result.join("\n");
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
