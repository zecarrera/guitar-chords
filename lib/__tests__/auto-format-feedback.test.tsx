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

  it("offers one bulk action and summarizes safe fixes", () => {
    const markup = renderToStaticMarkup(
      <AutoFormatFeedback
        onApplySafeFixes={() => undefined}
        result={autoFormatChordSheet("\nVerse\nAm\tG  \nLyrics\n")}
      />,
    );

    expect(markup).toContain("safe fixes available");
    expect(markup).toContain("Expand tabs to 8-column stops (1)");
    expect(markup).toContain("Remove trailing line whitespace (1)");
    expect(markup).toContain("Apply safe fixes");
  });

  it("does not offer apply for recommendation-only results", () => {
    const markup = renderToStaticMarkup(
      <AutoFormatFeedback
        onApplySafeFixes={() => undefined}
        result={autoFormatChordSheet("Verse\nAm G x2\nSing it")}
      />,
    );

    expect(markup).not.toContain("Apply safe fixes");
    expect(markup).toContain("Line 2:");
  });

  it("renders an application failure without source content", () => {
    const markup = renderToStaticMarkup(
      <AutoFormatFeedback
        applicationError="Content changed after analysis."
        result={autoFormatChordSheet("Verse")}
      />,
    );

    expect(markup).toContain("Content changed after analysis.");
  });
});
