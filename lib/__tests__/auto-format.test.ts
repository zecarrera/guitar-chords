import { describe, expect, it } from "vitest";

import { autoFormatChordSheet } from "@/lib/auto-format";

describe("autoFormatChordSheet", () => {
  it("preserves bare paired notation and exact source columns", () => {
    const input = "Verse\nAm         G      D\nSome lyrics here";
    const result = autoFormatChordSheet(input);

    expect(result.formattedText).toBe(input);
    expect(result.recognizedPairs).toEqual([
      {
        chords: [
          { name: "Am", start: 0 },
          { name: "G", start: 11 },
          { name: "D", start: 18 },
        ],
        line: 2,
        lyricLine: 3,
        notation: "bare",
      },
    ]);
  });

  it("recognizes bracketed pairs and inline notation without rewriting them", () => {
    const input = "Verse\n[Am]    [G]\nSing it\n[G]Hello [D]world";
    const result = autoFormatChordSheet(input);

    expect(result.formattedText).toBe(input);
    expect(result.recognizedPairs).toEqual([
      expect.objectContaining({ line: 2, lyricLine: 3, notation: "bracketed" }),
    ]);
    expect(result.inlineLines).toEqual([4]);
  });

  it("reports standalone chord rows as instrumental", () => {
    const result = autoFormatChordSheet("Intro\nAm G\nC F");

    expect(result.instrumentalRows.map((row) => row.line)).toEqual([2, 3]);
    expect(result.recognizedPairs).toEqual([]);
  });

  it("reports unknown diagrams without rejecting valid syntax", () => {
    const result = autoFormatChordSheet("Verse\nG13 Cmaj9\nJazz words");

    expect(result.recognizedPairs[0].chords.map((chord) => chord.name)).toEqual([
      "G13",
      "Cmaj9",
    ]);
    expect(result.missingDiagrams).toEqual([
      { line: 2, name: "G13" },
      { line: 2, name: "Cmaj9" },
    ]);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "missing-chord-diagram",
        severity: "info",
      }),
      expect.objectContaining({
        code: "missing-chord-diagram",
        severity: "info",
      }),
    ]);
  });

  it.each([
    ["Verse\nAm G x2\nSing it", "ambiguous-mixed-row"],
    ["Intro\n| Am | G |", "bar-delimited-row"],
    ["Verse\n[Am G\nSing it", "malformed-brackets"],
    ["Verse\nAm\tG\nSing it", "tab-alignment"],
  ])("preserves ambiguous input and reports %s", (input, code) => {
    const result = autoFormatChordSheet(input);

    expect(result.formattedText).toBe(input);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code, line: 2, severity: "warning" }),
    );
  });

  it("preserves section boundaries while normalizing outer whitespace", () => {
    const result = autoFormatChordSheet("\nVerse\nLine\n\n\nChorus\nLine\n");

    expect(result.formattedText).toBe("Verse\nLine\n\nChorus\nLine");
  });

  it("is idempotent", () => {
    const input = "Verse\nAm         G\nSome lyrics\n\nChorus\n[C]More";
    const once = autoFormatChordSheet(input);
    const twice = autoFormatChordSheet(once.formattedText);

    expect(twice).toEqual(once);
  });

  it("does not warn for ordinary lyrics beginning with a chord-like word", () => {
    const result = autoFormatChordSheet("Am I dreaming of you tonight");

    expect(result.diagnostics).toEqual([]);
    expect(result.recognizedPairs).toEqual([]);
    expect(result.instrumentalRows).toEqual([]);
  });
});
