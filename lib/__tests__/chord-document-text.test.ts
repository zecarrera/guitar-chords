import { describe, expect, it } from "vitest";

import {
  normalizeChordDocumentText,
  normalizeOptionalChordDocumentText,
  resolveUpdatedChordDocumentText,
} from "@/lib/chord-document-text";

describe("normalizeChordDocumentText", () => {
  it("normalizes line endings and non-breaking spaces without shifting columns", () => {
    expect(
      normalizeChordDocumentText("\r\nAm\u00a0        G\r\nSome lyrics\r\n"),
    ).toBe("Am         G\nSome lyrics");
  });

  it("preserves content-line whitespace and one boundary per blank run", () => {
    expect(
      normalizeChordDocumentText("\n  Am         G  \nLyrics\n\n \nChorus\n  C\n"),
    ).toBe("  Am         G  \nLyrics\n\nChorus\n  C");
  });

  it.each([
    "Am         G\nSome lyrics",
    "G13 Cmaj9\nJazz words",
    "Am G x2\nSing it",
    "| Am | G |",
    "[Am]         [G]\nSome lyrics",
  ])("does not add or remove chord notation in %s", (input) => {
    expect(normalizeChordDocumentText(input)).toBe(input);
  });

  it("normalizes optional manual content consistently", () => {
    expect(normalizeOptionalChordDocumentText("\nAm G\nLyrics\n")).toBe(
      "Am G\nLyrics",
    );
    expect(normalizeOptionalChordDocumentText(null)).toBeNull();
  });

  it("uses refreshed PDF text only when submitted text was not edited", () => {
    expect(
      resolveUpdatedChordDocumentText({
        existingText: "Old",
        extractedFromPdf: "\nAm G\nLyrics\n",
        submittedText: "Old",
      }),
    ).toBe("Am G\nLyrics");
    expect(
      resolveUpdatedChordDocumentText({
        existingText: "Old",
        extractedFromPdf: "PDF",
        submittedText: "\nEdited\n",
      }),
    ).toBe("Edited");
  });
});
