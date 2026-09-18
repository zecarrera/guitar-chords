import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AutoFormatFeedback } from "@/components/auto-format-feedback";
import { autoFormatChordSheet } from "@/lib/auto-format";

describe("AutoFormatFeedback", () => {
  it("renders line-addressable warnings", () => {
    const markup = renderToStaticMarkup(
      <AutoFormatFeedback
        result={autoFormatChordSheet("Verse\nAm G x2\nSing it")}
      />,
    );

    expect(markup).toContain("1 row needs review");
    expect(markup).toContain("Line 2:");
    expect(markup).toContain("unsupported repeat annotation");
  });

  it("renders a clean summary and missing-diagram information", () => {
    const markup = renderToStaticMarkup(
      <AutoFormatFeedback
        result={autoFormatChordSheet("Verse\nG13 Cmaj9\nJazz words")}
      />,
    );

    expect(markup).toContain("Analysis complete");
    expect(markup).toContain("No diagram available for G13, Cmaj9");
    expect(markup).toContain("These chords remain playable");
  });
});
