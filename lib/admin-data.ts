import { prisma } from "@/lib/prisma";

export async function getManageDashboardData() {
  const [songs, artists, genres, customLists] = await Promise.all([
    prisma.song.findMany({
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      include: {
        artist: true,
        documents: {
          select: {
            id: true,
            title: true,
            sourceType: true,
            sourceUrl: true,
            fileUrl: true,
            fileName: true,
            mimeType: true,
            extractedText: true,
            scrollSpeed: true,
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
        },
        videoLinks: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    }),
    prisma.artist.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            songs: true,
          },
        },
      },
    }),
    prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            songs: true,
          },
        },
      },
    }),
    prisma.customList.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            songs: true,
          },
        },
      },
    }),
  ]);

  return {
    songs,
    artists,
    genres,
    customLists,
  };
}

export async function getSongEditorData(slug: string) {
  const [song, artists, genres, customLists] = await Promise.all([
    prisma.song.findUnique({
      where: {
        slug,
      },
      include: {
        artist: true,
        genres: {
          orderBy: {
            name: "asc",
          },
        },
        customLists: {
          orderBy: {
            name: "asc",
          },
        },
        documents: {
          select: {
            id: true,
            title: true,
            sourceType: true,
            sourceUrl: true,
            fileUrl: true,
            fileName: true,
            mimeType: true,
            extractedText: true,
            scrollSpeed: true,
            importSource: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        videoLinks: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    }),
    prisma.artist.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.customList.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    song,
    artists,
    genres,
    customLists,
  };
}
