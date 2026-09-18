import { describe, expect, it } from "vitest";

import {
  classifyChordRow,
  isChordName,
  parseInlineChordTokens,
} from "@/lib/chord-syntax";

describe("isChordName", () => {
  it.each([
    "A",
    "C#",
    "Bb",
    "F#m",
    "Cmaj7",
    "Bdim",
    "Daug",
    "Asus4",
    "Cadd9",
    "G13",
    "Am7b5",
    "Fmaj7#11",
    "D/F#",
  ])("recognizes %s", (name) => {
    expect(isChordName(name)).toBe(true);
  });

  it.each(["H", "Verse", "x2", "Chello", "C/Em", "Cmaj99"])(
    "rejects %s",
    (name) => {
      expect(isChordName(name)).toBe(false);
    },
  );
});

describe("classifyChordRow", () => {
  it("returns exact source ranges for bare chord rows", () => {
    expect(classifyChordRow("  Am         G13")).toEqual({
      kind: "chord-row",
      notation: "bare",
      tokens: [
        {
          end: 4,
          label: "[Am]",
          name: "Am",
          notation: "bare",
          raw: "Am",
          start: 2,
        },
        {
          end: 16,
          label: "[G13]",
          name: "G13",
          notation: "bare",
          raw: "G13",
          start: 13,
        },
      ],
    });
  });

  it("returns exact source ranges for bracketed chord rows", () => {
    const result = classifyChordRow("[Am]    [G]");
    expect(result.kind).toBe("chord-row");
    expect(result.kind === "chord-row" && result.tokens.map((token) => token.start))
      .toEqual([0, 8]);
  });

  it.each([
    ["Am G x2", "ambiguous-mixed-row"],
    ["| Am | G |", "bar-delimited-row"],
    ["[Am G", "malformed-brackets"],
    ["Am\tG", "tab-alignment"],
  ])("classifies %s as %s", (line, code) => {
    expect(classifyChordRow(line)).toEqual(
      expect.objectContaining({ code, kind: "ambiguous" }),
    );
  });

  it("does not mistake a lyric beginning with a chord-like word for a row", () => {
    expect(classifyChordRow("Am I dreaming of you tonight")).toEqual({
      kind: "other",
    });
  });
});

describe("parseInlineChordTokens", () => {
  it("recognizes valid inline chord notation", () => {
    expect(parseInlineChordTokens("[G]Hello [D]world").map((token) => token.name))
      .toEqual(["G", "D"]);
  });

  it("rejects malformed or non-chord brackets", () => {
    expect(parseInlineChordTokens("[Verse 1]")).toEqual([]);
    expect(parseInlineChordTokens("[G")).toEqual([]);
  });
});
