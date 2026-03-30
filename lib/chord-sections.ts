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
        .map((line) => line.trim())
        .filter(Boolean),
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
    const useFirstLineAsTitle =
      rest.length > 0 && !firstLine.includes("[") && firstLine.length <= 40;

    return {
      title: useFirstLineAsTitle ? firstLine : `Section ${index + 1}`,
      lines: useFirstLineAsTitle ? rest : block,
    };
  });
}
