import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ChordCatalogBrowser } from "@/components/chord-catalog-browser";
import { ChordDiagram, ChordDiagramSvg } from "@/components/chord-diagram";
import { SongEditorPreview } from "@/components/song-editor-preview";
import { getChordEntry, getChordShape } from "@/lib/chord-library";

describe("chord diagrams", () => {
  it("uses the first position, including finger numbers and non-root bass", () => {
    const shape = getChordShape("Bm")!;
    const markup = renderToStaticMarkup(<ChordDiagram chordName="Bm" />);
    expect(shape).toBe(getChordEntry("Bm")!.positions[0]);
    expect(markup).toContain('aria-label="Bm chord diagram"');
    expect(markup).toContain('data-string="0" data-fret="2"');
    expect(markup).toContain('data-barre-fret="2"');
  });

  it("distinguishes muted strings from open strings", () => {
    const markup = renderToStaticMarkup(<ChordDiagram chordName="C" />);
    expect(markup).toContain(">x</text>");
    expect(markup.match(/fill="none"/g)).toHaveLength(2);
    expect(markup).not.toContain('data-string="0"');
    expect(markup).toContain('data-string="1" data-fret="3"');
  });

  it("renders higher positions relatively, including multiple barres", () => {
    const shape = getChordEntry("C")!.positions[1];
    const markup = renderToStaticMarkup(<ChordDiagramSvg name="C" position={{ ...shape, barres: [1, 3] }} />);
    expect(shape.baseFret).toBe(3);
    expect(markup).toContain('data-string="1" data-fret="1"');
    expect(markup).toContain('data-barre-fret="1"');
    expect(markup).toContain('data-barre-fret="3"');
    expect(markup).toContain('cy="56"');
  });

  it("preserves and escapes requested labels and explicitly reports missing diagrams", () => {
    const markup = renderToStaticMarkup(<ChordDiagram chordName="A#" />);
    expect(markup).toContain('aria-label="A# chord diagram"');
    expect(getChordShape("A#")).toBe(getChordShape("Bb"));
    const missing = renderToStaticMarkup(<ChordDiagram chordName={'<script>alert("x")</script>'} />);
    expect(missing).toContain("No diagram available");
    expect(missing).toContain("&lt;script&gt;");
    expect(missing).not.toContain("<script>");
  });
});

describe("reference page initial render", () => {
  it("bounds diagram cards and offers accessible filters and pagination, not management", () => {
    const markup = renderToStaticMarkup(<ChordCatalogBrowser />);
    expect(markup.match(/role="img"/g)).toHaveLength(24);
    expect(markup).toContain("828 matching");
    expect(markup).toContain("Search chords");
    expect(markup).toContain("All roots");
    expect(markup).toContain("All families");
    expect(markup).toContain('aria-label="Chord result pages"');
    expect(markup).not.toContain("<form");
    expect(markup).not.toContain("Delete chord");
  });
});

describe("editor preview catalog integration", () => {
  it("renders authored alias/extended labels without a separate definition list", () => {
    const markup = renderToStaticMarkup(
      <SongEditorPreview
        artistOptions={[]}
        formId="catalog-preview-test"
        initialArtistId=""
        initialArtistName="Demo artist"
        initialExtractedText="[A#]Words [C7sus4]here"
        initialScrollSpeed={20}
        initialTitle="Catalog preview"
      />,
    );
    expect(markup).toContain("[A#]");
    expect(markup).toContain("[C7sus4]");
    expect(markup).toContain("Catalog preview");
    expect(getChordShape("A#")).toBe(getChordShape("Bb"));
  });
});
