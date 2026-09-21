import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SongPageShell } from "@/components/song-page-shell";
import { songs } from "@/lib/demo-data";
import { getDisplayableStrummingPattern } from "@/lib/strumming-pattern";
import type { Song } from "@/lib/types";

function createSong(strummingPattern: string | null): Song {
  return {
    ...songs[0],
    strummingPattern,
  };
}

describe("getDisplayableStrummingPattern", () => {
  it("returns the trimmed strumming pattern for standard song details", () => {
    expect(getDisplayableStrummingPattern(" D DU UDU ")).toBe("D DU UDU");
  });

  it("omits absent and whitespace-only strumming patterns", () => {
    expect(getDisplayableStrummingPattern(null)).toBeNull();
    expect(getDisplayableStrummingPattern("   ")).toBeNull();
  });

  it("uses the dedicated strumming-pattern value in demo song data", () => {
    expect(songs[0].strummingPattern).toBe("D DU UDU");
    expect("difficulty" in songs[0]).toBe(false);
  });

  it("renders a labeled pattern in the standard song header", () => {
    const markup = renderToStaticMarkup(
      <SongPageShell chordDefinitions={[]} song={createSong("D DU UDU")} />,
    );

    expect(markup).toContain("Strumming: D DU UDU");
  });

  it("omits the header pattern for an absent or whitespace-only value", () => {
    for (const strummingPattern of [null, "   "]) {
      const markup = renderToStaticMarkup(
        <SongPageShell
          chordDefinitions={[]}
          song={createSong(strummingPattern)}
        />,
      );

      expect(markup).not.toContain("Strumming:");
    }
  });
});
