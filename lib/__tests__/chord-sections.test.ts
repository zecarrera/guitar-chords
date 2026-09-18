import { describe, expect, it } from "vitest";

import { parseChordSections } from "@/lib/chord-sections";
import {
  buildPositionedChordLine,
  wrapPositionedChordLine,
} from "@/lib/chord-line-layout";

describe("parseChordSections", () => {
  it("pairs a strict chord-only row with its following lyric row", () => {
    const [section] = parseChordSections(
      "Verse\n[Am]         [G]\nSing it out tonight",
    );

    expect(section.lines).toEqual([
      {
        chords: [
          { anchorColumn: 0, label: "[Am]", name: "Am" },
          { anchorColumn: 13, label: "[G]", name: "G" },
        ],
        kind: "anchored",
        lyricText: "Sing it out tonight",
      },
    ]);
  });

  it("does not pair consecutive chord-only rows", () => {
    const [section] = parseChordSections("Intro\n[Am] [G]\n[C] [F]");

    expect(section.lines).toEqual([
      {
        chords: [
          { anchorColumn: 0, label: "[Am]", name: "Am" },
          { anchorColumn: 5, label: "[G]", name: "G" },
        ],
        kind: "anchored",
        lyricText: "",
      },
      {
        chords: [
          { anchorColumn: 0, label: "[C]", name: "C" },
          { anchorColumn: 4, label: "[F]", name: "F" },
        ],
        kind: "anchored",
        lyricText: "",
      },
    ]);
  });

  it("preserves a terminal chord-only row", () => {
    const [section] = parseChordSections("Outro\n[Am] [G]");

    expect(section.lines).toEqual([
      {
        chords: [
          { anchorColumn: 0, label: "[Am]", name: "Am" },
          { anchorColumn: 5, label: "[G]", name: "G" },
        ],
        kind: "anchored",
        lyricText: "",
      },
    ]);
  });

  it("pairs and clamps a trailing chord beyond the lyric text", () => {
    const [section] = parseChordSections("Verse\n[Am]          [G]\nSing");

    expect(section.lines).toEqual([
      {
        chords: [
          { anchorColumn: 0, label: "[Am]", name: "Am" },
          { anchorColumn: 4, label: "[G]", name: "G" },
        ],
        kind: "anchored",
        lyricText: "Sing",
      },
    ]);
  });

  it("preserves inline chord notation as a source string", () => {
    const [section] = parseChordSections("Verse\n[Am]I am [G]singing");

    expect(section.lines).toEqual(["[Am]I am [G]singing"]);
  });

  it("pairs a bare chord row without shifting source anchors", () => {
    const [section] = parseChordSections(
      "Verse\nAm         G      D\nSome lyrics here",
    );

    expect(section.lines).toEqual([
      {
        chords: [
          { anchorColumn: 0, label: "[Am]", name: "Am" },
          { anchorColumn: 11, label: "[G]", name: "G" },
          { anchorColumn: 16, label: "[D]", name: "D" },
        ],
        kind: "anchored",
        lyricText: "Some lyrics here",
      },
    ]);
  });

  it("does not treat a leading bare chord row as a section title", () => {
    const [section] = parseChordSections("Am G\nSing it");

    expect(section.title).toBe("Section 1");
    expect(section.lines[0]).toEqual(
      expect.objectContaining({ kind: "anchored", lyricText: "Sing it" }),
    );
  });

  it("preserves ambiguous and bracket-containing followers as source rows", () => {
    const [section] = parseChordSections(
      "Verse\nAm G x2\nSing it\nAm G\n[D]already inline",
    );

    expect(section.lines).toEqual([
      "Am G x2",
      "Sing it",
      {
        chords: [
          { anchorColumn: 0, label: "[Am]", name: "Am" },
          { anchorColumn: 3, label: "[G]", name: "G" },
        ],
        kind: "anchored",
        lyricText: "",
      },
      "[D]already inline",
    ]);
  });

  it("wraps paired chords with their anchored lyric positions", () => {
    const [section] = parseChordSections(
      "Verse\n[Am]         [G]\nSing it out tonight",
    );
    const positioned = buildPositionedChordLine(section.lines[0])!;
    const rows = wrapPositionedChordLine(positioned, 12);

    expect(rows.map((row) => row.lyricText.trim())).toEqual([
      "Sing it out",
      "tonight",
    ]);
    expect(rows.map((row) => row.chords.map((chord) => chord.name))).toEqual([
      ["Am"],
      ["G"],
    ]);
  });

  it("preserves bare chord ownership across responsive column budgets", () => {
    const [section] = parseChordSections(
      "Verse\nG                 D\nHarbor lights are drifting slowly tonight",
    );
    const positioned = buildPositionedChordLine(section.lines[0])!;

    for (const maxColumns of [12, 20, 40]) {
      const rows = wrapPositionedChordLine(positioned, maxColumns);
      const gRow = rows.find((row) =>
        row.chords.some((chord) => chord.name === "G"),
      );
      const dRow = rows.find((row) =>
        row.chords.some((chord) => chord.name === "D"),
      );

      expect(gRow?.lyricText).toContain("Harbor");
      expect(dRow?.lyricText).toContain("drifting");
    }
  });
});
