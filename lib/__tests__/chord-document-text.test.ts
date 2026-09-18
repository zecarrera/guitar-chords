import { describe, expect, it } from "vitest";

import {
  chordDocumentTabSize,
  normalizeChordDocumentText,
  normalizeOptionalChordDocumentText,
  planChordDocumentFixes,
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
    ).toBe("  Am         G\nLyrics\n\nChorus\n  C");
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

  it("reports each deterministic fix category and occurrence count", () => {
    const plan = planChordDocumentFixes(
      "\r\nVerse\u00a0\r\n\tAm\tG  \r\n\r\n \r\nLyrics\r\n",
    );

    expect(plan.fixes).toEqual([
      expect.objectContaining({ code: "line-endings", count: 6 }),
      expect.objectContaining({ code: "non-breaking-spaces", count: 1 }),
      expect.objectContaining({ code: "tabs", count: 2 }),
      expect.objectContaining({ code: "trailing-whitespace", count: 3 }),
      expect.objectContaining({ code: "outer-blank-space", count: 2 }),
      expect.objectContaining({ code: "blank-line-runs", count: 1 }),
    ]);
    expect(plan.projectedText).toBe(
      `Verse\n${" ".repeat(chordDocumentTabSize)}Am${" ".repeat(6)}G\n\nLyrics`,
    );
  });

  it("expands tabs to shared tab stops without changing existing inner spaces", () => {
    const plan = planChordDocumentFixes("  Am\tG\n  C         D");

    expect(plan.projectedText).toBe("  Am    G\n  C         D");
    expect(plan.fixes).toEqual([
      expect.objectContaining({ code: "tabs", count: 1 }),
    ]);
  });

  it("produces an empty plan for canonical text", () => {
    const input = "Verse\nAm         G\nSome lyrics";
    expect(planChordDocumentFixes(input)).toEqual({
      fixes: [],
      projectedText: input,
      sourceText: input,
    });
  });
});
