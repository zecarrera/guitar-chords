import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/manage/actions", () => ({
  createArtistAction: vi.fn(),
  createSongFromModalAction: vi.fn(),
  deleteArtistAction: vi.fn(),
  deleteSongAction: vi.fn(),
  updateArtistAction: vi.fn(),
  updateSongFromModalAction: vi.fn(),
}));

import { LibraryPage } from "@/components/library-page";

type LibraryProps = Parameters<typeof LibraryPage>[0];

function createSong(id: string, slug: string, title: string) {
  return {
    id,
    slug,
    title,
    artist: { id: "a1", name: "Artist" },
    capo: 0,
    strummingPattern: null,
    videoLinks: [],
  };
}

describe("LibraryPage song play link", () => {
  const songs = [
    createSong("s1", "first-song", "First Song"),
    createSong("s2", "second-song", "Second Song"),
  ];
  const html = renderToStaticMarkup(
    <LibraryPage
      {...({ songs, artists: [], genres: [], customLists: [] } as unknown as LibraryProps)}
    />,
  );

  it("links each row's play action to its own song page", () => {
    expect(html).toMatch(/href="\/songs\/first-song"[^>]*aria-label="Play song"|aria-label="Play song"[^>]*href="\/songs\/first-song"/);
    expect(html).toMatch(/href="\/songs\/second-song"[^>]*aria-label="Play song"|aria-label="Play song"[^>]*href="\/songs\/second-song"/);
    expect(html.match(/aria-label="Play song"/g)).toHaveLength(2);
  });

  it("keeps edit and delete actions", () => {
    expect(html.match(/aria-label="Edit song"/g)).toHaveLength(2);
    expect(html.match(/aria-label="Delete song"/g)).toHaveLength(2);
  });
});
