import { describe, expect, it } from "vitest";

import {
  buildPositionedChordLine,
  computeMaxColumns,
  layoutChordLanes,
  wrapPositionedChordLine,
} from "@/lib/chord-line-layout";

describe("buildPositionedChordLine", () => {
  it("preserves exact lyric anchors for dense inline chord changes", () => {
    const positioned = buildPositionedChordLine("[Am]I [G]am [F]here")!;

    expect(positioned.kind).toBe("lyrics");
    expect(positioned.lyricText).toBe("I am here");
    expect(positioned.chords.map((chord) => chord.anchorColumn)).toEqual([0, 2, 5]);
  });
});

describe("computeMaxColumns", () => {
  it("derives the number of characters that fit a container at a given character width", () => {
    // 400px container / 8px per character = 50 characters, minus 1 for safety margin.
    expect(computeMaxColumns(400, 8)).toBe(49);
  });

  it("applies the safety margin consistently across container sizes", () => {
    expect(computeMaxColumns(80, 8)).toBe(9);
    expect(computeMaxColumns(160, 8)).toBe(19);
  });

  it("never returns less than 1 column even for a tiny container", () => {
    expect(computeMaxColumns(2, 8)).toBe(1);
  });

  it("returns 0 for non-positive inputs", () => {
    expect(computeMaxColumns(0, 8)).toBe(0);
    expect(computeMaxColumns(400, 0)).toBe(0);
    expect(computeMaxColumns(-10, 8)).toBe(0);
  });
});

describe("wrapPositionedChordLine", () => {
  it("returns a single unchanged row when the line already fits maxColumns", () => {
    const positioned = buildPositionedChordLine("[G] Harbor lights")!;
    const rows = wrapPositionedChordLine(positioned, 100);

    expect(rows).toEqual([
      {
        chords: positioned.chords.map((chord) => ({
          ...chord,
          column: chord.anchorColumn,
          lane: 0,
        })),
        laneCount: 1,
        lyricText: positioned.lyricText,
      },
    ]);
  });

  it("wraps a long line with words at a word boundary", () => {
    const line =
      "[G] Harbor lights are drifting slow and [D] the tide keeps rolling in in the bay";
    const positioned = buildPositionedChordLine(line)!;
    const rows = wrapPositionedChordLine(positioned, 30);

    expect(rows.length).toBeGreaterThan(1);

    // Reassembling every row's lyric text (rows already drop consumed
    // whitespace) should reproduce the same words, in order, as the source.
    const rewrapped = rows.map((row) => row.lyricText.trim()).join(" ").trim();
    const originalWords = positioned.lyricText.trim().split(/\s+/).join(" ");

    expect(rewrapped.replace(/\s+/g, " ")).toBe(originalWords);

    for (const row of rows) {
      expect(row.lyricText.length).toBeLessThanOrEqual(30);
    }
  });

  it("wraps a chord-only line (no whitespace) between adjacent chord tokens", () => {
    const positioned = buildPositionedChordLine("[Am][C][G][F]")!;
    const rows = wrapPositionedChordLine(positioned, 10);

    expect(rows).toEqual([
      {
        chords: [
          { anchorColumn: 0, column: 0, label: "[Am]", lane: 0, name: "Am" },
          { anchorColumn: 5, column: 5, label: "[C]", lane: 0, name: "C" },
        ],
        laneCount: 1,
        lyricText: "",
      },
      {
        chords: [
          { anchorColumn: 0, column: 0, label: "[G]", lane: 0, name: "G" },
          { anchorColumn: 4, column: 4, label: "[F]", lane: 0, name: "F" },
        ],
        laneCount: 1,
        lyricText: "",
      },
    ]);
  });

  it("never splits a [Chord] token across two rows", () => {
    const positioned = buildPositionedChordLine("[Am][C][G][F][Dm][Bb][C7]")!;
    const rows = wrapPositionedChordLine(positioned, 6);

    for (const row of rows) {
      for (const chord of row.chords) {
        // Every chord kept its full label intact after re-basing to the row.
        expect(chord.label).toMatch(/^\[[^[\]]+\]$/);
      }
    }

    // Every original chord must appear in exactly one row.
    const totalChords = rows.reduce((sum, row) => sum + row.chords.length, 0);
    expect(totalChords).toBe(positioned.chords.length);
  });

  it("never splits a word across two rows", () => {
    const line =
      "[G] Supercalifragilisticexpialidocious keeps [D] rolling along the [Em] river bank";
    const positioned = buildPositionedChordLine(line)!;
    const rows = wrapPositionedChordLine(positioned, 20);

    const words = positioned.lyricText.trim().split(/\s+/);

    for (const word of words) {
      const rowsContainingWord = rows.filter((row) => row.lyricText.includes(word));
      expect(rowsContainingWord.length).toBe(1);
    }
  });

  it("keeps a chord aligned above its associated word after wrapping", () => {
    const line = "[G] Harbor lights are drifting slow and [D] the tide keeps rolling in";
    const positioned = buildPositionedChordLine(line)!;
    const rows = wrapPositionedChordLine(positioned, 30);

    const rowWithD = rows.find((row) =>
      row.chords.some((chord) => chord.name === "D"),
    )!;
    const dChord = rowWithD.chords.find((chord) => chord.name === "D")!;

    // "the" is the word D annotates; it must appear at or after D's column
    // on the same row.
    const wordIndex = rowWithD.lyricText.indexOf("the");
    expect(wordIndex).toBeGreaterThanOrEqual(0);
    expect(dChord.column).toBe(wordIndex - 1);
  });

  it("assigns a dense chord to the row containing its anchored word", () => {
    const positioned = buildPositionedChordLine("[Am]I [G]am [F]here")!;
    const rows = wrapPositionedChordLine(positioned, 4);

    expect(rows.map((row) => row.lyricText.trim())).toEqual(["I", "am", "here"]);
    expect(rows.map((row) => row.chords.map((chord) => chord.name))).toEqual([
      ["Am"],
      ["G"],
      ["F"],
    ]);
  });

  it("moves a word with its chord when the label would cross the right edge", () => {
    const positioned = buildPositionedChordLine(
      "Keep singing until [Asus4]tonight",
    )!;
    const rows = wrapPositionedChordLine(positioned, 20);

    expect(rows.map((row) => row.lyricText.trim())).toEqual([
      "Keep singing until",
      "tonight",
    ]);
    expect(rows[1].chords).toEqual([
      expect.objectContaining({
        anchorColumn: 0,
        column: 0,
        label: "[Asus4]",
      }),
    ]);
  });

  it("preserves chord ownership as available columns change", () => {
    const positioned = buildPositionedChordLine(
      "[G]Harbor lights are drifting [D]slowly tonight",
    )!;

    for (const maxColumns of [12, 20, 40]) {
      const rows = wrapPositionedChordLine(positioned, maxColumns);
      const rowWithD = rows.find((row) =>
        row.chords.some((chord) => chord.name === "D"),
      )!;

      expect(rowWithD.lyricText).toContain("slowly");
      expect(rowWithD.chords.find((chord) => chord.name === "D")?.column).toBe(
        rowWithD.lyricText.indexOf("slowly"),
      );
    }
  });

  it("preserves a trailing chord when a lyric line wraps", () => {
    const positioned = buildPositionedChordLine(
      "[C]Harbor lights are drifting slowly tonight[G]",
    )!;
    const rows = wrapPositionedChordLine(positioned, 20);

    expect(rows.flatMap((row) => row.chords.map((chord) => chord.name))).toEqual([
      "C",
      "G",
    ]);
    expect(rows.at(-1)?.chords[0]).toEqual(
      expect.objectContaining({
        anchorColumn: 0,
        column: 0,
        label: "[G]",
      }),
    );
  });

  it("includes full label width for an anchored two-line chord", () => {
    const positioned = buildPositionedChordLine({
      chords: [
        {
          anchorColumn: 24,
          label: "[Asus4/G#]",
          name: "Asus4/G#",
        },
      ],
      kind: "anchored",
      lyricText: "Keep singing softly tonight",
    })!;

    expect(positioned.contentWidth).toBe(34);
    const rows = wrapPositionedChordLine(positioned, 30);

    expect(rows.length).toBeGreaterThan(1);
    expect(
      rows.every((row) =>
        row.chords.every(
          (chord) => chord.column + chord.label.length <= 30,
        ),
      ),
    ).toBe(true);
  });

  it("does not infinite-loop when a single chord token is wider than maxColumns", () => {
    const positioned = buildPositionedChordLine("[Asus4/G#] hello")!;
    const rows = wrapPositionedChordLine(positioned, 3);

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].chords[0].label).toBe("[Asus4/G#]");
  });
});

describe("layoutChordLanes", () => {
  it("stacks overlapping labels without changing their anchor columns", () => {
    const layout = layoutChordLanes([
      { anchorColumn: 0, label: "[Asus4]", name: "Asus4" },
      { anchorColumn: 2, label: "[G]", name: "G" },
      { anchorColumn: 4, label: "[Fmaj7]", name: "Fmaj7" },
    ]);

    expect(layout.laneCount).toBe(3);
    expect(layout.chords.map((chord) => chord.column)).toEqual([0, 2, 4]);
    expect(layout.chords.map((chord) => chord.lane)).toEqual([0, 1, 2]);
  });

  it("reuses a lane when labels have enough horizontal separation", () => {
    const layout = layoutChordLanes([
      { anchorColumn: 0, label: "[C]", name: "C" },
      { anchorColumn: 4, label: "[G]", name: "G" },
    ]);

    expect(layout.laneCount).toBe(1);
    expect(layout.chords.map((chord) => chord.lane)).toEqual([0, 0]);
  });
});
