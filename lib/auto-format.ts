/**
 * Matches a single bare guitar chord token (no surrounding brackets).
 * Examples: A, Am, G7, Cadd9, D/F#, Bbm7, Asus4, C#m, Em7, Bm/D
 */
const CHORD_TOKEN_RE =
  /^[A-G][#b]?(?:maj|min|aug|dim|sus[24]?|add9?|M)?(?:m(?:aj)?)?(?:[0-9]{1,2})?(?:\/[A-G][#b]?)?$/;

function isChordToken(token: string): boolean {
  return CHORD_TOKEN_RE.test(token);
}

/**
 * Returns true when a line looks like a chord-only line:
 * - Has no existing bracket syntax (`[`)
 * - Every non-empty space-separated token matches the chord pattern
 * - Contains at least one token
 */
function isChordLine(line: string): boolean {
  if (line.includes("[")) return false;
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every(isChordToken);
}

/**
 * Wraps each bare token on a chord-only line in square brackets.
 * E.g. "Am G D Em" → "[Am] [G] [D] [Em]"
 */
function formatChordLine(line: string): string {
  return line
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => `[${token}]`)
    .join(" ");
}

/**
 * Auto-formats a chord sheet:
 * 1. Splits into section blocks separated by blank lines.
 * 2. Within each block, strips purely blank lines (no blank lines inside a section).
 * 3. On chord-only lines, wraps bare chord names in [].
 * 4. Rejoins blocks with exactly one blank line between them.
 */
export function autoFormatChordSheet(text: string): string {
  const blocks = text
    .split(/\n(?:\s*\n)+/)
    .map((block) =>
      block
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => (isChordLine(line) ? formatChordLine(line) : line)),
    )
    .filter((block) => block.length > 0);

  return blocks.map((block) => block.join("\n")).join("\n\n");
}
