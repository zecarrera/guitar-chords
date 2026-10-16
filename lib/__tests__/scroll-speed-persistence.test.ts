import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateScrollSpeedAction } from "@/app/manage/actions";
import { getSongs } from "@/lib/data";

const { prismaMock, revalidatePathMock, redirectMock } = vi.hoisted(() => ({
  prismaMock: {
    $queryRaw: vi.fn(),
    song: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    artist: { findMany: vi.fn() },
    genre: { findMany: vi.fn() },
    customList: { findMany: vi.fn() },
    importSource: { findMany: vi.fn() },
    chordDocument: { update: vi.fn() },
  },
  revalidatePathMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/pdf-import", () => ({ extractChordTextFromPdf: vi.fn() }));

describe("primary chord document scroll speed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("DATABASE_URL", "configured");
    vi.stubEnv("ENABLE_DATABASE_READS", "true");
    prismaMock.$queryRaw.mockResolvedValue(1);
    prismaMock.artist.findMany.mockResolvedValue([]);
    prismaMock.genre.findMany.mockResolvedValue([]);
    prismaMock.customList.findMany.mockResolvedValue([]);
    prismaMock.importSource.findMany.mockResolvedValue([]);
  });

  it("loads playback speed from the deterministically ordered primary document", async () => {
    prismaMock.song.findMany.mockResolvedValue([
      {
        title: "Test Song",
        slug: "test-song",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-02T00:00:00.000Z"),
        artist: { name: "Test Artist" },
        genres: [],
        customLists: [],
        status: "PUBLISHED",
        capo: null,
        strummingPattern: null,
        documents: [
          {
            id: "primary-document",
            title: "Primary",
            sourceType: "PDF",
            sourceUrl: null,
            fileUrl: null,
            fileName: null,
            extractedText: null,
            scrollSpeed: 37,
            importSource: null,
          },
          {
            id: "secondary-document",
            title: "Secondary",
            sourceType: "PDF",
            sourceUrl: null,
            fileUrl: null,
            fileName: null,
            extractedText: null,
            scrollSpeed: 52,
            importSource: null,
          },
        ],
        videoLinks: [],
      },
    ]);

    const songs = await getSongs();

    expect(songs[0]?.scrollSpeed).toBe(37);
    expect(
      prismaMock.song.findMany.mock.calls[0]?.[0].include.documents.orderBy,
    ).toEqual([{ createdAt: "asc" }, { id: "asc" }]);
  });

  it("updates the same deterministically ordered primary document", async () => {
    prismaMock.song.findUnique.mockResolvedValue({
      documents: [{ id: "primary-document" }],
    });

    await updateScrollSpeedAction("test-song", 37);

    expect(prismaMock.song.findUnique).toHaveBeenCalledWith({
      where: { slug: "test-song" },
      select: {
        documents: {
          take: 1,
          select: { id: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    });
    expect(prismaMock.chordDocument.update).toHaveBeenCalledWith({
      where: { id: "primary-document" },
      data: { scrollSpeed: 37 },
    });
  });
});
