import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  buildChordCatalog,
  chordCatalog,
  chordFamilies,
  filterChordCatalog,
  getChordEntry,
  getChordShape,
  validateChordPosition,
} from "@/lib/chord-library";
import guitar from "@/lib/vendor/chords-db/guitar.json";

describe("bundled chord catalog", () => {
  it("preserves the pinned asset and every ordered upstream position", () => {
    const bytes = readFileSync(new URL("../vendor/chords-db/guitar.json", import.meta.url));
    expect(createHash("sha256").update(bytes).digest("hex"))
      .toBe("cfe439962b2f444d2c341b1f0261403b4c3a3416e321147286fc608922699974");
    expect(readFileSync(new URL("../../public/chord-data-LICENSE.txt", import.meta.url), "utf8"))
      .toBe(readFileSync(new URL("../vendor/chords-db/LICENSE", import.meta.url), "utf8"));
    expect(chordCatalog).toHaveLength(828);
    expect(chordCatalog.reduce((sum, chord) => sum + chord.positions.length, 0)).toBe(3283);
    expect(chordCatalog.map((chord) => chord.positions))
      .toEqual(Object.values(guitar.chords).flat().map((chord) => chord.positions));
  });

  it("uses position zero even when it has an unfamiliar bass note", () => {
    expect(getChordShape("Bm")).toBe(getChordEntry("Bm")?.positions[0]);
    expect(getChordShape("Bm")?.frets).toEqual([2, 2, 4, 4, 3, 2]);
    expect(getChordShape("B")?.frets).toEqual([2, 2, 4, 4, 4, 2]);
  });

  it.each([["A#", "Bb"], ["F♯m", "Gbm"], ["Cmajor", "C"], ["Cminor", "Cm"],
    ["CM7", "Cmaj7"], ["C/G#", "C/Ab"]])("resolves %s and %s identically", (left, right) => {
    expect(getChordEntry(left)).not.toBeNull();
    expect(getChordEntry(left)).toBe(getChordEntry(right));
  });

  it("does not confuse major/minor or substitute a root for an unavailable chord", () => {
    expect(getChordEntry("Cm7")).not.toBe(getChordEntry("CM7"));
    expect(getChordShape("D7/F#")).toBeNull();
    expect(getChordShape("Chello")).toBeNull();
  });

  it("rejects missing positions and duplicate canonical identities", () => {
    const chord = guitar.chords.C[0];
    expect(() => buildChordCatalog([{ ...chord, positions: [] }])).toThrow(/C/);
    expect(() => buildChordCatalog([chord, chord])).toThrow(/duplicate.*C/);
  });

  it("rejects invalid arrays, frets, fingers, barres, and pitches with a chord identifier", () => {
    const position = guitar.chords.C[0].positions[0];
    for (const broken of [
      { frets: [1] }, { frets: [NaN, 0, 0, 0, 0, 0] }, { baseFret: 0 },
      { fingers: [9, 0, 0, 0, 0, 0] }, { barres: [5] }, { midi: [1, 2] },
    ]) {
      expect(() => validateChordPosition({ ...position, ...broken }, "C #1")).toThrow(/C #1/);
    }
  });
});

describe("catalog filtering", () => {
  it("covers the whole catalog without duplicate alias entries or unclassified families", () => {
    expect(filterChordCatalog("")).toHaveLength(828);
    expect(filterChordCatalog("A#")).toEqual(filterChordCatalog("Bb"));
    expect(chordCatalog.every((chord) => chordFamilies.includes(chord.family))).toBe(true);
    expect(chordCatalog.filter((chord) => chord.family === "Slash")).toHaveLength(289);
  });

  it("combines search, root, and family and can match beyond the first page", () => {
    expect(filterChordCatalog("Bm7", "11", "Minor").map((chord) => chord.name))
      .toEqual(["Bm7", "Bm7b5"]);
    expect(filterChordCatalog("Bm7", "0")).toEqual([]);
    expect(filterChordCatalog("not a chord")).toEqual([]);
    expect(filterChordCatalog("CM7").some((chord) => chord.name === "Cm7")).toBe(false);
  });
});
