import type { ChordSection } from "@/lib/types";

export function parseChordSections(extractedText?: string | null): ChordSection[] {
  if (!extractedText) {
    return [
      {
        title: "Chord sheet",
        lines: ["Chord content will appear here after the document is imported."],
      },
    ];
  }

  const blocks = extractedText
    .split(/\n\s*\n/g)
    .map((block) =>
      block
        .split("\n")
        .filter((line) => line.trim().length > 0),
    )
    .filter((block) => block.length > 0);

  if (blocks.length === 0) {
    return [
      {
        title: "Chord sheet",
        lines: [extractedText],
      },
    ];
  }

  return blocks.map((block, index) => {
    const [firstLine, ...rest] = block;
    const trimmedFirstLine = firstLine.trim();
    const useFirstLineAsTitle =
      rest.length > 0 &&
      !trimmedFirstLine.includes("[") &&
      trimmedFirstLine.length <= 40;

    return {
      title: useFirstLineAsTitle ? trimmedFirstLine : `Section ${index + 1}`,
      lines: useFirstLineAsTitle ? rest : block,
    };
  });
}
