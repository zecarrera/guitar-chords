import { songs } from "../lib/demo-data";
import { prisma } from "../lib/prisma";

function toSongStatus(status: "draft" | "published") {
  return status === "published" ? "PUBLISHED" : "DRAFT";
}

function toSourceType(sourceType: "pdf" | "external_link") {
  return sourceType === "external_link" ? "EXTERNAL_LINK" : "PDF";
}

function toVideoType(type: "tutorial" | "song") {
  return type === "tutorial" ? "TUTORIAL" : "SONG";
}

function toImportStatus(status: "draft" | "published") {
  return status === "published" ? "COMPLETED" : "READY_FOR_REVIEW";
}

function buildExtractedText(
  sections: {
    title: string;
    lines: string[];
  }[],
) {
  return sections
    .map((section) => [section.title, ...section.lines].join("\n"))
    .join("\n\n");
}

function slugify(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function seed() {
  if (process.env.SEED_DEMO_DATA === "false") {
    console.log("Skipping demo seed because SEED_DEMO_DATA=false.");
    return;
  }

  const existingSongs = await prisma.song.count();

  if (existingSongs > 0) {
    console.log("Skipping demo seed because songs already exist.");
    return;
  }

  const artistNames = [...new Set(songs.map((song) => song.artist))];
  const genreNames = [...new Set(songs.flatMap((song) => song.genres))];
  const listNames = [...new Set(songs.flatMap((song) => song.lists))];

  await prisma.artist.createMany({
    data: artistNames.map((name) => ({
      name,
      slug: slugify(name),
    })),
    skipDuplicates: true,
  });

  await prisma.genre.createMany({
    data: genreNames.map((name) => ({
      name,
      slug: slugify(name),
    })),
    skipDuplicates: true,
  });

  await prisma.customList.createMany({
    data: listNames.map((name) => ({
      name,
      slug: slugify(name),
    })),
    skipDuplicates: true,
  });

  for (const song of songs) {
    await prisma.song.upsert({
      where: {
        slug: song.slug,
      },
      update: {},
      create: {
        title: song.title,
        slug: song.slug,
        description: song.description,
        notes: song.summary,
        keySignature: song.keySignature,
        capo: song.capo,
        tuning: song.tuning,
        difficulty: song.difficulty,
        status: toSongStatus(song.status),
        artist: {
          connect: {
            name: song.artist,
          },
        },
        genres: {
          connect: song.genres.map((name) => ({
            name,
          })),
        },
        customLists: {
          connect: song.lists.map((name) => ({
            name,
          })),
        },
        documents: {
          create: [
            {
              title: `${song.title} chord sheet`,
              sourceType: toSourceType(song.sourceType),
              sourceUrl:
                song.sourceType === "external_link"
                  ? `https://example.com/sources/${song.slug}`
                  : null,
              fileUrl:
                song.sourceType === "pdf"
                  ? `https://example.com/files/${song.slug}.pdf`
                  : null,
              storageKey: `seed/${song.slug}`,
              extractedText: buildExtractedText(song.sections),
              scrollSpeed: song.scrollSpeed,
              importSource: {
                create: {
                  sourceType: toSourceType(song.sourceType),
                  externalUrl:
                    song.sourceType === "external_link"
                      ? `https://example.com/imports/${song.slug}`
                      : null,
                  originalFilename:
                    song.sourceType === "pdf" ? `${song.slug}.pdf` : null,
                  storageKey: `seed/${song.slug}`,
                  status: toImportStatus(song.status),
                },
              },
            },
          ],
        },
        videoLinks: {
          create: song.videoLinks.map((video) => ({
            type: toVideoType(video.type),
            label: video.label,
            url: video.url,
          })),
        },
      },
    });
  }

  console.log("Seeded demo guitar library data.");
}

seed()
  .catch((error) => {
    console.error("Failed to seed demo data.", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
