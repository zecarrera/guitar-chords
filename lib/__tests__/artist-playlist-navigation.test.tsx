import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SongPageShell } from "@/components/song-page-shell";
import { songs } from "@/lib/demo-data";

describe("artist playlist navigation", () => {
  it("links a song artist to the encoded playlist route", () => {
    const song = {
      ...songs[0],
      artist: "The Harbor Lights",
    };

    const markup = renderToStaticMarkup(
      <SongPageShell chordDefinitions={[]} song={song} />,
    );

    expect(markup).toContain('href="/artists/The%20Harbor%20Lights/play"');
  });
});
