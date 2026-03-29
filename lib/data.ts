import { prisma } from "@/lib/prisma";
import { defaultChordDefinitions, deserializeChordDefinition } from "@/lib/chord-library";
import {
  artists as demoArtists,
  customLists as demoCustomLists,
  genres as demoGenres,
  getSongBySlug as getDemoSongBySlug,
  importQueue as demoImportQueue,
  songs as demoSongs,
  stats as demoStats,
} from "@/lib/demo-data";
import type {
  ArtistSummary,
  ChordDefinition,
  CustomListSummary,
  DataSourceKind,
  GenreSummary,
  ImportQueueItem,
  LibraryStat,
  Song,
} from "@/lib/types";

type Snapshot = {
  source: DataSourceKind;
  songs: Song[];
  artists: ArtistSummary[];
  genres: GenreSummary[];
  customLists: CustomListSummary[];
  importQueue: ImportQueueItem[];
  stats: LibraryStat[];
};

let databaseReachable: boolean | null = null;

function buildDemoSnapshot(): Snapshot {
  return {
    source: "demo",
    songs: demoSongs,
    artists: demoArtists,
    genres: demoGenres,
    customLists: demoCustomLists,
    importQueue: demoImportQueue,
    stats: demoStats,
  };
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function summarize(value?: string | null, fallback = "No summary yet.") {
  if (!value) {
    return fallback;
  }

  return value.length > 140 ? `${value.slice(0, 137)}...` : value;
}

function parseChordSections(extractedText?: string | null) {
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

async function buildDatabaseSnapshot(): Promise<Snapshot> {
  const [songs, artists, genres, customLists, importSources] = await Promise.all([
    prisma.song.findMany({
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
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
      include: {
        songs: {
          select: {
            slug: true,
          },
        },
      },
    }),
    prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        songs: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.customList.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        songs: {
          select: {
            title: true,
          },
          orderBy: {
            title: "asc",
          },
        },
      },
    }),
    prisma.importSource.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    }),
  ]);

  const mappedSongs: Song[] = songs.map((song) => {
    const primaryDocument = song.documents[0];
    const importSource = primaryDocument?.importSource;
    const sourceType =
      primaryDocument?.sourceType === "EXTERNAL_LINK" ? "external_link" : "pdf";
    const summarySource =
      song.notes ?? song.description ?? primaryDocument?.extractedText ?? undefined;

    return {
      title: song.title,
      slug: song.slug,
      artist: song.artist.name,
      createdAt: song.createdAt.toISOString(),
      genres: song.genres.map((genre) => genre.name),
      lists: song.customLists.map((list) => list.name),
      sourceType,
      keySignature: song.keySignature ?? "Unknown key",
      capo: song.capo ?? 0,
      tuning: song.tuning ?? "Standard",
      difficulty: song.difficulty ?? "Unspecified",
      status: song.status === "PUBLISHED" ? "published" : "draft",
      scrollSpeed: primaryDocument?.scrollSpeed ?? 24,
      summary: summarize(summarySource),
      description:
        song.description ??
        primaryDocument?.extractedText ??
        "Imported chord sheet awaiting richer description.",
      importNotes:
        importSource?.errorMessage ??
        `Import status: ${toTitleCase(importSource?.status ?? "completed")}.`,
      updatedAt: song.updatedAt.toISOString(),
      documentUrl: primaryDocument
        ? primaryDocument.fileName
          ? `/api/documents/${primaryDocument.id}/file`
          : primaryDocument.fileUrl ?? primaryDocument.sourceUrl
        : null,
      documentLabel: primaryDocument?.fileName ?? primaryDocument?.title ?? null,
      videoLinks: song.videoLinks.map((video) => ({
        label: video.label,
        type: video.type === "TUTORIAL" ? "tutorial" : "song",
        url: video.url,
      })),
      sections: parseChordSections(primaryDocument?.extractedText),
    };
  });

  return {
    source: "database",
    songs: mappedSongs,
    artists: artists.map((artist) => ({
      name: artist.name,
      summary:
        artist.bio ??
        `${artist.name} currently has ${artist.songs.length} song${
          artist.songs.length === 1 ? "" : "s"
        } in the library.`,
      songCount: artist.songs.length,
      songSlugs: artist.songs.map((song) => song.slug),
    })),
    genres: genres.map((genre) => ({
      name: genre.name,
      summary: `${genre.name} currently groups ${genre.songs.length} song${
        genre.songs.length === 1 ? "" : "s"
      } in the database.`,
      songCount: genre.songs.length,
    })),
    customLists: customLists.map((list) => ({
      name: list.name,
      summary:
        list.description ??
        `${list.name} currently contains ${list.songs.length} song${
          list.songs.length === 1 ? "" : "s"
        }.`,
      songCount: list.songs.length,
      songs: list.songs.map((song) => song.title),
    })),
    importQueue: importSources.map((item) => ({
      id: item.id,
      label: item.originalFilename ?? item.externalUrl ?? "Imported source",
      source: item.sourceType === "EXTERNAL_LINK" ? "Canonical external link" : "Uploaded chord sheet",
      status:
        item.status === "PROCESSING"
          ? "processing"
          : item.status === "READY_FOR_REVIEW"
            ? "ready_for_review"
            : "queued",
      summary:
        item.errorMessage ??
        `Current status: ${toTitleCase(item.status)}.`,
    })),
    stats: [
      {
        label: "Songs in library",
        value: String(mappedSongs.length),
        description: "Published and draft entries currently stored in PostgreSQL.",
      },
      {
        label: "Artists tracked",
        value: String(artists.length),
        description: "Artist records normalized for fast grouping and filtering.",
      },
      {
        label: "Custom lists",
        value: String(customLists.length),
        description: "Reusable rehearsal and practice groupings.",
      },
      {
        label: "Pending imports",
        value: String(
          importSources.filter((item) => item.status !== "COMPLETED").length,
        ),
        description: "Import records still queued, processing, or awaiting review.",
      },
    ],
  };
}

async function canUseDatabase() {
  if (!process.env.DATABASE_URL || process.env.ENABLE_DATABASE_READS !== "true") {
    return false;
  }

  if (databaseReachable !== null) {
    return databaseReachable;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseReachable = true;
  } catch (error) {
    databaseReachable = false;
    console.error("Database is unreachable, falling back to demo data.", error);
  }

  return databaseReachable;
}

export async function getLibrarySnapshot(): Promise<Snapshot> {
  if (!(await canUseDatabase())) {
    return buildDemoSnapshot();
  }

  try {
    return await buildDatabaseSnapshot();
  } catch (error) {
    console.error("Falling back to demo data because database loading failed.", error);
    return buildDemoSnapshot();
  }
}

export async function getSongs() {
  const snapshot = await getLibrarySnapshot();
  return snapshot.songs;
}

export async function getSongBySlug(slug: string) {
  const snapshot = await getLibrarySnapshot();
  return snapshot.songs.find((song) => song.slug === slug) ?? getDemoSongBySlug(slug);
}

export async function getArtists() {
  const snapshot = await getLibrarySnapshot();
  return snapshot.artists;
}

export async function getGenres() {
  const snapshot = await getLibrarySnapshot();
  return snapshot.genres;
}

export async function getCustomLists() {
  const snapshot = await getLibrarySnapshot();
  return snapshot.customLists;
}

export async function getImportQueue() {
  const snapshot = await getLibrarySnapshot();
  return snapshot.importQueue;
}

export async function getChordDefinitions(): Promise<ChordDefinition[]> {
  if (!(await canUseDatabase())) {
    return defaultChordDefinitions;
  }

  try {
    const chordDefinitions = await prisma.chordDefinition.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return chordDefinitions.map((chord) =>
      deserializeChordDefinition({
        id: chord.id,
        name: chord.name,
        frets: chord.frets,
        fingers: chord.fingers,
        baseFret: chord.baseFret,
      }),
    );
  } catch (error) {
    console.error("Falling back to default chord library because loading failed.", error);
    return defaultChordDefinitions;
  }
}

export function isDatabaseConfigured() {
  return Boolean(
    process.env.DATABASE_URL && process.env.ENABLE_DATABASE_READS === "true",
  );
}
