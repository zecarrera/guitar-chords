import type { ChordDefinition, ChordFret } from "@/lib/types";

export const defaultChordDefinitions: ChordDefinition[] = [
  {
    name: "A",
    frets: ["x", 0, 2, 2, 2, 0],
    fingers: [null, null, 1, 2, 3, null],
  },
  {
    name: "A7",
    frets: ["x", 0, 2, 0, 2, 0],
    fingers: [null, null, 2, null, 3, null],
  },
  {
    name: "Am",
    frets: ["x", 0, 2, 2, 1, 0],
    fingers: [null, null, 2, 3, 1, null],
  },
  {
    name: "B",
    frets: ["x", 2, 4, 4, 4, 2],
    fingers: [null, 1, 3, 4, 4, 1],
    baseFret: 2,
  },
  {
    name: "B7",
    frets: ["x", 2, 1, 2, 0, 2],
    fingers: [null, 2, 1, 3, null, 4],
  },
  {
    name: "Bb",
    frets: ["x", 1, 3, 3, 3, 1],
    fingers: [null, 1, 3, 4, 4, 1],
    baseFret: 1,
  },
  {
    name: "Bm",
    frets: ["x", 2, 4, 4, 3, 2],
    fingers: [null, 1, 3, 4, 2, 1],
    baseFret: 2,
  },
  {
    name: "C",
    frets: ["x", 3, 2, 0, 1, 0],
    fingers: [null, 3, 2, null, 1, null],
  },
  {
    name: "C7",
    frets: ["x", 3, 2, 3, 1, 0],
    fingers: [null, 3, 2, 4, 1, null],
  },
  {
    name: "Cm",
    frets: ["x", 3, 5, 5, 4, 3],
    fingers: [null, 1, 3, 4, 2, 1],
    baseFret: 3,
  },
  {
    name: "D",
    frets: ["x", "x", 0, 2, 3, 2],
    fingers: [null, null, null, 1, 3, 2],
  },
  {
    name: "D7",
    frets: ["x", "x", 0, 2, 1, 2],
    fingers: [null, null, null, 2, 1, 3],
  },
  {
    name: "Dm",
    frets: ["x", "x", 0, 2, 3, 1],
    fingers: [null, null, null, 2, 3, 1],
  },
  {
    name: "E",
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [null, 2, 3, 1, null, null],
  },
  {
    name: "E7",
    frets: [0, 2, 0, 1, 0, 0],
    fingers: [null, 2, null, 1, null, null],
  },
  {
    name: "Em",
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [null, 2, 3, null, null, null],
  },
  {
    name: "F",
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    baseFret: 1,
  },
  {
    name: "Fm",
    frets: [1, 3, 3, 1, 1, 1],
    fingers: [1, 3, 4, 1, 1, 1],
    baseFret: 1,
  },
  {
    name: "F#",
    frets: [2, 4, 4, 3, 2, 2],
    fingers: [1, 3, 4, 2, 1, 1],
    baseFret: 2,
  },
  {
    name: "F#m",
    frets: [2, 4, 4, 2, 2, 2],
    fingers: [1, 3, 4, 1, 1, 1],
    baseFret: 2,
  },
  {
    name: "G",
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, null, null, null, 3],
  },
  {
    name: "G7",
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, null, null, null, 1],
  },
  {
    name: "Amaj7",
    frets: ["x", 0, 2, 1, 2, 0],
    fingers: [null, null, 2, 1, 3, null],
  },
  {
    name: "Asus2",
    frets: ["x", 0, 2, 2, 0, 0],
    fingers: [null, null, 2, 3, null, null],
  },
  {
    name: "Asus4",
    frets: ["x", 0, 2, 2, 3, 0],
    fingers: [null, null, 1, 2, 3, null],
  },
  {
    name: "Cadd9",
    frets: ["x", 3, 2, 0, 3, 3],
    fingers: [null, 3, 2, null, 4, 4],
  },
  {
    name: "Dsus2",
    frets: ["x", "x", 0, 2, 3, 0],
    fingers: [null, null, null, 1, 2, null],
  },
  {
    name: "Dsus4",
    frets: ["x", "x", 0, 2, 3, 3],
    fingers: [null, null, null, 1, 2, 3],
  },
  {
    name: "Emaj7",
    frets: [0, 2, 1, 1, 0, 0],
    fingers: [null, 3, 1, 2, null, null],
  },
  {
    name: "Gsus2",
    frets: [3, 0, 0, 2, 3, 3],
    fingers: [2, null, null, 1, 3, 4],
  },
];

export function normalizeChordName(value: string) {
  return value
    .trim()
    .replace(/♯/g, "#")
    .replace(/♭/g, "b")
    .replace(/\s+/g, "")
    .replace(/maj(?=\d)/i, "maj")
    .replace(/min/gi, "m");
}

export function buildChordShapeLookup(chordDefinitions: ChordDefinition[]) {
  return chordDefinitions.reduce<Record<string, ChordDefinition>>((lookup, chord) => {
    lookup[normalizeChordName(chord.name)] = chord;
    return lookup;
  }, {});
}

export const defaultChordShapeLookup = buildChordShapeLookup(defaultChordDefinitions);

export function getChordShape(
  chordName: string,
  chordLookup = defaultChordShapeLookup,
) {
  const normalized = normalizeChordName(chordName);

  return chordLookup[normalized] ?? null;
}

export function isKnownChordName(
  value: string,
  chordLookup = defaultChordShapeLookup,
) {
  return Boolean(getChordShape(value, chordLookup));
}

export function formatChordFrets(frets: ChordDefinition["frets"]) {
  return frets.map((fret) => (typeof fret === "number" ? String(fret) : fret)).join(", ");
}

export function formatChordFingers(fingers: ChordDefinition["fingers"]) {
  return fingers.map((finger) => String(finger ?? 0)).join(", ");
}

export function deserializeChordDefinition(input: {
  id?: string;
  name: string;
  frets: string[];
  fingers: number[];
  baseFret?: number | null;
}): ChordDefinition {
  return {
    id: input.id,
    name: input.name,
    frets: input.frets.map((fret) =>
      fret.toLowerCase() === "x" ? "x" : Number(fret),
    ) as ChordFret[],
    fingers: input.fingers.map((finger) => (finger > 0 ? finger : null)),
    baseFret: input.baseFret ?? null,
  };
}

export function serializeChordFrets(frets: ChordDefinition["frets"]) {
  return frets.map((fret) => (typeof fret === "number" ? String(fret) : fret));
}

export function serializeChordFingers(fingers: ChordDefinition["fingers"]) {
  return fingers.map((finger) => finger ?? 0);
}
