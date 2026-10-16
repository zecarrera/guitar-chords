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

import { filterLibrarySongs, LibraryPage } from "@/components/library-page";

type LibraryProps = Parameters<typeof LibraryPage>[0];

function createSong(id: string, slug: string, title: string, artistName: string) {
  return {
    id,
    slug,
    title,
    artistId: "a1",
    artist: { id: "a1", name: artistName },
    capo: 0,
    strummingPattern: null,
    notes: null,
    status: "PUBLISHED",
    genres: [],
    customLists: [],
    documents: [],
    videoLinks: [],
  };
}

describe("LibraryPage song play link", () => {
  const songs = [
    createSong("s1", "first-song", "First Song", "First Artist"),
    createSong("s2", "second-song", "Second Song", "Second Artist"),
  ];
  const html = renderToStaticMarkup(
    <LibraryPage
      {...({ songs, artists: [], genres: [], customLists: [] } as unknown as LibraryProps)}
    />,
  );

  it("links each row's play action to its own song page", () => {
    expect(html.match(/href="\/songs\/first-song"/g)).toHaveLength(2);
    expect(html.match(/href="\/songs\/second-song"/g)).toHaveLength(2);
    expect(html.match(/aria-label="Play song"/g)).toHaveLength(4);
  });

  it("shows disabled song-management controls on mobile and keeps desktop controls available", () => {
    expect(html).toMatch(/aria-label="Add song \(disabled on mobile\)"[^>]*disabled/);
    expect(html.match(/aria-label="Edit song \(disabled on mobile\)"[^>]*disabled/g)).toHaveLength(2);
    expect(html.match(/aria-label="Delete song \(disabled on mobile\)"[^>]*disabled/g)).toHaveLength(2);
    expect(html.match(/aria-label="Edit song"/g)).toHaveLength(2);
    expect(html.match(/aria-label="Delete song"/g)).toHaveLength(2);
  });

  it("provides mobile song search and no longer blocks mobile library access", () => {
    expect(html.match(/aria-label="Search songs"/g)).toHaveLength(1);
    expect(html).not.toContain("Desktop only");
    expect(html).toContain("placeholder=\"Search songs...\"");
  });

  it("filters songs by title or artist and returns no songs for unmatched queries", () => {
    expect(filterLibrarySongs(songs, "second").map((song) => song.slug)).toEqual(["second-song"]);
    expect(filterLibrarySongs(songs, "first artist").map((song) => song.slug)).toEqual(["first-song"]);
    expect(filterLibrarySongs(songs, "no match")).toEqual([]);
  });
});
