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

    expect(section.lines).toEqual(["[Am] [G]", "[C] [F]"]);
  });

  it("preserves a terminal chord-only row", () => {
    const [section] = parseChordSections("Outro\n[Am] [G]");

    expect(section.lines).toEqual(["[Am] [G]"]);
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
});
