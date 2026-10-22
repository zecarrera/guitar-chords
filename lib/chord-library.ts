import guitar from "@/lib/vendor/chords-db/guitar.json";
import { normalizeChordName, parseChordName } from "@/lib/chord-names";
import type { ChordCatalogEntry, ChordPosition } from "@/lib/types";

export { chordRoots, normalizeChordName } from "@/lib/chord-names";

type ProviderChord = {
  key: string;
  suffix: string;
  positions: ChordPosition[];
};

function chordFamily(suffix: string) {
  if (suffix.startsWith("mmaj")) return "Minor major";
  if (suffix.startsWith("maj")) return "Major";
  if (suffix.startsWith("dim")) return "Diminished";
  if (suffix.startsWith("aug")) return "Augmented";
  if (suffix.includes("sus")) return "Suspended";
  if (suffix.startsWith("m")) return "Minor";
  if (suffix.startsWith("add")) return "Added tone";
  if (suffix === "5") return "Power";
  if (suffix === "" || suffix === "6" || suffix === "69") return "Major";
  if (suffix === "alt" || /^[79]/.test(suffix) || suffix === "11" || suffix === "13") return "Dominant";
  throw new Error(`Unclassified chord suffix: ${suffix}`);
}

function isIntegerBetween(value: number, minimum: number, maximum: number) {
  return Number.isInteger(value) && value >= minimum && value <= maximum;
}

export function validateChordPosition(position: ChordPosition, label: string) {
  const invalid = () => { throw new Error(`Invalid catalog position: ${label}`); };
  if (
    !Array.isArray(position.frets) || position.frets.length !== 6 ||
    !position.frets.every((fret) => isIntegerBetween(fret, -1, 4)) ||
    !Array.isArray(position.fingers) || position.fingers.length !== 6 ||
    !position.fingers.every((finger, index) => isIntegerBetween(finger, -1, 4) &&
      (finger !== -1 || position.frets[index] === -1)) ||
    !isIntegerBetween(position.baseFret, 1, 24) ||
    !Array.isArray(position.barres) ||
    !position.barres.every((barre) => isIntegerBetween(barre, 1, 4) && position.frets.includes(barre)) ||
    !Array.isArray(position.midi) ||
    !position.midi.every((note) => isIntegerBetween(note, 0, 127)) ||
    (position.capo !== undefined && typeof position.capo !== "boolean")
  ) invalid();

  const expectedMidi = [40, 45, 50, 55, 59, 64].flatMap((note, index) => {
    const fret = position.frets[index];
    return fret < 0 ? [] : [note + (fret === 0 ? 0 : fret + position.baseFret - 1)];
  });
  if (expectedMidi.length === 0 || expectedMidi.join(",") !== position.midi.join(",")) invalid();
}

export function buildChordCatalog(chords: ProviderChord[]): ChordCatalogEntry[] {
  const identities = new Set<string>();
  return chords.map((chord) => {
    const name = normalizeChordName(chord.key + (chord.suffix === "major" ? "" : chord.suffix));
    const parsed = parseChordName(name);
    if (!parsed || !Array.isArray(chord.positions) || !chord.positions.length || identities.has(parsed.identity)) {
      throw new Error(`Invalid or duplicate catalog chord: ${name}`);
    }
    identities.add(parsed.identity);
    chord.positions.forEach((position, index) => validateChordPosition(position, `${name} #${index + 1}`));
    return { name, root: parsed.root, family: parsed.bass !== null ? "Slash" : chordFamily(parsed.suffix), positions: chord.positions };
  });
}

export const chordCatalog = buildChordCatalog(Object.values(guitar.chords).flat());
export const chordFamilies = [...new Set(chordCatalog.map((chord) => chord.family))].sort();
const chordLookup = new Map(chordCatalog.map((chord) => [parseChordName(chord.name)!.identity, chord]));

export function getChordEntry(name: string) {
  const parsed = parseChordName(name);
  return parsed ? chordLookup.get(parsed.identity) ?? null : null;
}

export function getChordShape(name: string) {
  return getChordEntry(name)?.positions[0] ?? null;
}

export function isKnownChordName(name: string) {
  return getChordEntry(name) !== null;
}

export function filterChordCatalog(search: string, root = "", family = "") {
  const query = normalizeChordName(search);
  const parsed = parseChordName(query);
  return chordCatalog.filter((chord) => {
    if (root !== "" && chord.root !== Number(root)) return false;
    if (family && chord.family !== family) return false;
    if (!query) return true;
    const candidate = parseChordName(chord.name)!;
    if (parsed) {
      return candidate.root === parsed.root &&
        candidate.suffix.startsWith(parsed.suffix) &&
        (parsed.bass === null || candidate.bass === parsed.bass);
    }
    return chord.name.includes(query);
  });
}
