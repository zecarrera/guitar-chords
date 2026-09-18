import { normalizeChordName } from "@/lib/chord-library";

const CHORD_NAME_PATTERN =
  /^[A-G](?:#|b|♯|♭)?(?:maj|min|m|M|dim|aug|sus(?:2|4)?|add)?(?:2|4|5|6|7|9|11|13)?(?:[#b](?:5|9|11|13))*(?:\/[A-G](?:#|b|♯|♭)?)?$/;
const BRACKETED_CHORD_PATTERN = /\[([^[\]]+)\]/g;

export type ParsedChordToken = {
  end: number;
  label: string;
  name: string;
  notation: "bare" | "bracketed";
  raw: string;
  start: number;
};

export type ChordRowClassification =
  | {
      kind: "chord-row";
      notation: "bare" | "bracketed";
      tokens: ParsedChordToken[];
    }
  | {
      code:
        | "ambiguous-mixed-row"
        | "bar-delimited-row"
        | "malformed-brackets"
        | "tab-alignment";
      kind: "ambiguous";
      message: string;
    }
  | {
      kind: "other";
    };

export function isChordName(value: string) {
  return CHORD_NAME_PATTERN.test(value.trim());
}

function buildToken(
  raw: string,
  name: string,
  start: number,
  notation: ParsedChordToken["notation"],
): ParsedChordToken {
  return {
    end: start + raw.length,
    label: `[${name}]`,
    name: normalizeChordName(name),
    notation,
    raw,
    start,
  };
}

function parseBareTokens(line: string) {
  return Array.from(line.matchAll(/\S+/g)).map((match) => {
    const raw = match[0];
    return isChordName(raw)
      ? buildToken(raw, raw, match.index ?? 0, "bare")
      : null;
  });
}

export function parseInlineChordTokens(line: string): ParsedChordToken[] {
  const matches = Array.from(line.matchAll(BRACKETED_CHORD_PATTERN));

  if (
    matches.length === 0 ||
    matches.some((match) => !isChordName(match[1] ?? "")) ||
    line.replace(BRACKETED_CHORD_PATTERN, "").includes("[") ||
    line.replace(BRACKETED_CHORD_PATTERN, "").includes("]")
  ) {
    return [];
  }

  return matches.map((match) =>
    buildToken(
      match[0],
      match[1]?.trim() ?? "",
      match.index ?? 0,
      "bracketed",
    ),
  );
}

export function classifyChordRow(line: string): ChordRowClassification {
  if (!line.trim()) {
    return { kind: "other" };
  }

  if (line.includes("\t")) {
    const withoutTabs = line.replace(/\t/g, " ");
    const candidates = parseBareTokens(withoutTabs);

    if (candidates.some(Boolean) || withoutTabs.includes("[")) {
      return {
        code: "tab-alignment",
        kind: "ambiguous",
        message:
          "Tabs have variable display width; replace them with spaces before aligning chords.",
      };
    }
  }

  if (line.includes("[") || line.includes("]")) {
    const matches = Array.from(line.matchAll(BRACKETED_CHORD_PATTERN));
    const remainder = line.replace(BRACKETED_CHORD_PATTERN, "");
    const hasMalformedSyntax =
      matches.length === 0 ||
      remainder.includes("[") ||
      remainder.includes("]") ||
      matches.some((match) => !isChordName(match[1] ?? ""));

    if (hasMalformedSyntax) {
      return {
        code: "malformed-brackets",
        kind: "ambiguous",
        message: "Chord brackets are unmatched or contain an invalid chord label.",
      };
    }

    if (!remainder.trim()) {
      return {
        kind: "chord-row",
        notation: "bracketed",
        tokens: matches.map((match) =>
          buildToken(
            match[0],
            match[1]?.trim() ?? "",
            match.index ?? 0,
            "bracketed",
          ),
        ),
      };
    }

    if (/^(?:x\d+|\d+x)$/i.test(remainder.trim()) || remainder.includes("|")) {
      return {
        code: "ambiguous-mixed-row",
        kind: "ambiguous",
        message:
          "This row mixes chord notation with an unsupported repeat or bar annotation.",
      };
    }

    return { kind: "other" };
  }

  const bareTokens = parseBareTokens(line);

  if (bareTokens.length > 0 && bareTokens.every(Boolean)) {
    return {
      kind: "chord-row",
      notation: "bare",
      tokens: bareTokens.filter(
        (token): token is ParsedChordToken => token !== null,
      ),
    };
  }

  const validTokenCount = bareTokens.filter(Boolean).length;

  if (line.includes("|") && validTokenCount > 0) {
    return {
      code: "bar-delimited-row",
      kind: "ambiguous",
      message:
        "Bar-delimited progressions are preserved but are not automatically interpreted.",
    };
  }

  if (
    validTokenCount > 0 &&
    Array.from(line.matchAll(/\S+/g)).some((match) =>
      /^(?:x\d+|\d+x)$/i.test(match[0]),
    )
  ) {
    return {
      code: "ambiguous-mixed-row",
      kind: "ambiguous",
      message:
        "This row mixes chord notation with an unsupported repeat annotation.",
    };
  }

  if (validTokenCount >= 2) {
    return {
      code: "ambiguous-mixed-row",
      kind: "ambiguous",
      message: "This row mixes chord labels with content that is not chord syntax.",
    };
  }

  return { kind: "other" };
}
