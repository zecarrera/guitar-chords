const pitchClasses: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

export const chordRoots = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export function normalizeChordName(value: string) {
  const normalized = value.trim().replace(/♯/g, "#").replace(/♭/g, "b").replace(/\s+/g, "");
  const match = /^([A-G](?:#|b)?)(.*)$/.exec(normalized);
  if (!match) return normalized;

  const suffix = match[2]
    .replace(/^major/, "maj")
    .replace(/^min(?:or)?/, "m")
    .replace(/^M(?=\d)/, "maj")
    .replace(/^mMaj/, "mmaj");
  return match[1] + (suffix === "maj" || suffix === "M" ? "" : suffix);
}

export function notePitchClass(note: string) {
  const match = /^([A-G])([#b]?)$/.exec(note);
  if (!match) return null;
  return (pitchClasses[match[1]] + (match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0) + 12) % 12;
}

export function parseChordName(value: string) {
  const match = /^([A-G](?:#|b)?)([^/]*)(?:\/([A-G](?:#|b)?))?$/.exec(normalizeChordName(value));
  if (!match) return null;
  const root = notePitchClass(match[1]);
  const bass = match[3] ? notePitchClass(match[3]) : null;
  if (root === null) return null;
  return { root, suffix: match[2], bass, identity: `${root}:${match[2]}:${bass ?? ""}` };
}
