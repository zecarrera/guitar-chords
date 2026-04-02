"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { extractChordTextFromPdf, normalizeChordDocumentText } from "@/lib/pdf-import";
import { prisma } from "@/lib/prisma";

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    throw new Error(`Missing form field: ${key}`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`Empty form field: ${key}`);
  }

  return trimmed;
}

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function readOptionalMultilineString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  return value.trim() ? value : null;
}

function readOptionalNumber(formData: FormData, key: string) {
  const value = readOptionalString(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number in form field: ${key}`);
  }

  return parsed;
}

async function readOptionalPdfUpload(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  const bytes = Buffer.from(await value.arrayBuffer());

  return {
    fileName: value.name,
    mimeType: value.type || "application/pdf",
    fileData: bytes,
  };
}

function slugify(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function revalidateLibrary() {
  revalidatePath("/");
  revalidatePath("/songs");
  revalidatePath("/artists");
  revalidatePath("/genres");
  revalidatePath("/lists");
  revalidatePath("/manage");
}

export async function createArtistAction(formData: FormData) {
  const name = readRequiredString(formData, "name");

  await prisma.artist.create({
    data: {
      name,
      slug: slugify(name),
    },
  });

  revalidateLibrary();
  redirect("/manage");
}

export async function updateArtistAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const name = readRequiredString(formData, "name");

  await prisma.artist.update({
    where: {
      id,
    },
    data: {
      name,
      slug: slugify(name),
    },
  });

  revalidateLibrary();
  redirect("/manage");
}

export async function deleteArtistAction(formData: FormData) {
  const id = readRequiredString(formData, "id");

  const artist = await prisma.artist.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          songs: true,
        },
      },
    },
  });

  if (artist._count.songs > 0) {
    throw new Error("Cannot delete an artist that still has songs.");
  }

  await prisma.artist.delete({
    where: {
      id,
    },
  });

  revalidateLibrary();
  redirect("/manage");
}

export async function createGenreAction(formData: FormData) {
  const name = readRequiredString(formData, "name");

  await prisma.genre.create({
    data: {
      name,
      slug: slugify(name),
    },
  });

  revalidateLibrary();
  redirect("/manage");
}

export async function updateGenreAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const name = readRequiredString(formData, "name");

  await prisma.genre.update({
    where: {
      id,
    },
    data: {
      name,
      slug: slugify(name),
    },
  });

  revalidateLibrary();
  redirect("/manage");
}

export async function deleteGenreAction(formData: FormData) {
  const id = readRequiredString(formData, "id");

  await prisma.genre.delete({
    where: {
      id,
    },
  });

  revalidateLibrary();
  redirect("/manage");
}

export async function createCustomListAction(formData: FormData) {
  const name = readRequiredString(formData, "name");
  const isPinned = formData.get("isPinned") === "on";

  await prisma.customList.create({
    data: {
      name,
      slug: slugify(name),
      isPinned,
    },
  });

  revalidateLibrary();
  redirect("/manage");
}

export async function updateCustomListAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const name = readRequiredString(formData, "name");
  const isPinned = formData.get("isPinned") === "on";

  await prisma.customList.update({
    where: {
      id,
    },
    data: {
      name,
      slug: slugify(name),
      isPinned,
    },
  });

  revalidateLibrary();
  redirect("/manage");
}

export async function deleteCustomListAction(formData: FormData) {
  const id = readRequiredString(formData, "id");

  await prisma.customList.delete({
    where: {
      id,
    },
  });

  revalidateLibrary();
  redirect("/manage");
}

export async function createSongAction(formData: FormData) {
  const title = readRequiredString(formData, "title");
  const slugInput = readOptionalString(formData, "slug");
  const artistId = readRequiredString(formData, "artistId");
  const sourceType = readRequiredString(formData, "sourceType");
  const scrollSpeed = readOptionalNumber(formData, "scrollSpeed") ?? 24;
  const manualExtractedText = readOptionalMultilineString(formData, "extractedText");
  const pdfUpload = await readOptionalPdfUpload(formData, "pdfFile");
  const normalizedSourceType: "PDF" | "EXTERNAL_LINK" =
    sourceType === "EXTERNAL_LINK" ? "EXTERNAL_LINK" : "PDF";
  const normalizedSourceUrl =
    normalizedSourceType === "EXTERNAL_LINK"
      ? readRequiredString(formData, "sourceUrl")
      : null;
  const extractedText =
    (manualExtractedText ? normalizeChordDocumentText(manualExtractedText) : null) ??
    (normalizedSourceType === "PDF" && pdfUpload
      ? await extractChordTextFromPdf(pdfUpload.fileData)
      : null);

  const slug = slugInput ? slugify(slugInput) : slugify(title);

  await prisma.song.create({
    data: {
      title,
      slug,
      status: "DRAFT",
      artist: {
        connect: {
          id: artistId,
        },
      },
      documents: {
        create: [
          {
            title: `${title} chord sheet`,
            sourceType: normalizedSourceType,
            sourceUrl: normalizedSourceUrl,
            extractedText,
            scrollSpeed,
            fileName: pdfUpload?.fileName,
            mimeType: pdfUpload?.mimeType,
            fileData: pdfUpload?.fileData,
          },
        ],
      },
    },
  });

  revalidateLibrary();
  redirect(`/manage/songs/${slug}`);
}

export async function updateSongAction(formData: FormData) {
  const songId = readRequiredString(formData, "songId");
  const title = readRequiredString(formData, "title");
  const slugInput = readOptionalString(formData, "slug");
  const artistId = readRequiredString(formData, "artistId");
  const notes = readOptionalString(formData, "notes");
  const keySignature = readOptionalString(formData, "keySignature");
  const capo = readOptionalNumber(formData, "capo");
  const tuning = readOptionalString(formData, "tuning");
  const difficulty = readOptionalString(formData, "difficulty");
  const status = readRequiredString(formData, "status");
  const documentId = readOptionalString(formData, "documentId");
  const documentTitle = readRequiredString(formData, "documentTitle");
  const sourceType = readRequiredString(formData, "sourceType");
  const fileUrl = readOptionalString(formData, "fileUrl");
  const submittedExtractedText = readOptionalMultilineString(formData, "extractedText");
  const scrollSpeed = readOptionalNumber(formData, "scrollSpeed");
  const pdfUpload = await readOptionalPdfUpload(formData, "pdfFile");
  const genreIds = formData
    .getAll("genreIds")
    .filter((value): value is string => typeof value === "string");
  const listIds = formData
    .getAll("listIds")
    .filter((value): value is string => typeof value === "string");
  const slug = slugInput ? slugify(slugInput) : slugify(title);
  const normalizedSourceType: "PDF" | "EXTERNAL_LINK" =
    sourceType === "EXTERNAL_LINK" ? "EXTERNAL_LINK" : "PDF";
  const normalizedSourceUrl =
    normalizedSourceType === "EXTERNAL_LINK"
      ? readRequiredString(formData, "sourceUrl")
      : null;
  const normalizedFileUrl =
    normalizedSourceType === "PDF" ? fileUrl : null;
  const existingDocument = documentId
    ? await prisma.chordDocument.findUnique({
        where: {
          id: documentId,
        },
        select: {
          extractedText: true,
        },
      })
    : null;
  const extractedFromPdf =
    normalizedSourceType === "PDF" && pdfUpload
      ? await extractChordTextFromPdf(pdfUpload.fileData)
      : null;
  const extractedText =
    extractedFromPdf &&
    (!submittedExtractedText ||
      submittedExtractedText === existingDocument?.extractedText)
      ? extractedFromPdf
      : submittedExtractedText;
  const documentData = {
    title: documentTitle,
    sourceType: normalizedSourceType,
    sourceUrl: normalizedSourceUrl,
    fileUrl: normalizedFileUrl,
    extractedText,
    scrollSpeed,
    ...(pdfUpload
      ? {
          fileName: pdfUpload.fileName,
          mimeType: pdfUpload.mimeType,
          fileData: pdfUpload.fileData,
        }
      : {}),
  };

  await prisma.song.update({
    where: {
      id: songId,
    },
    data: {
      title,
      slug,
      notes,
      keySignature,
      capo,
      tuning,
      difficulty,
      status:
        status === "PUBLISHED"
          ? "PUBLISHED"
          : status === "ARCHIVED"
            ? "ARCHIVED"
            : "DRAFT",
      artist: {
        connect: {
          id: artistId,
        },
      },
      genres: {
        set: genreIds.map((id) => ({
          id,
        })),
      },
      customLists: {
        set: listIds.map((id) => ({
          id,
        })),
      },
      documents: documentId
        ? {
            update: [
              {
                where: {
                  id: documentId,
                },
                data: documentData,
              },
            ],
          }
        : {
            create: [
              documentData,
            ],
          },
    },
  });

  revalidateLibrary();
  revalidatePath(`/songs/${slug}`);
  revalidatePath(`/manage/songs/${slug}`);
  redirect(`/manage/songs/${slug}?saved=1`);
}

export async function deleteSongAction(formData: FormData) {
  const songId = readRequiredString(formData, "songId");

  await prisma.song.delete({
    where: {
      id: songId,
    },
  });

  revalidateLibrary();
  redirect("/manage");
}

export async function createVideoLinkAction(formData: FormData) {
  const songId = readRequiredString(formData, "songId");
  const songSlug = readRequiredString(formData, "songSlug");
  const type = readRequiredString(formData, "type");
  const label = readRequiredString(formData, "label");
  const url = readRequiredString(formData, "url");

  await prisma.videoLink.create({
    data: {
      song: {
        connect: {
          id: songId,
        },
      },
      type: type === "SONG" ? "SONG" : "TUTORIAL",
      label,
      url,
    },
  });

  revalidateLibrary();
  revalidatePath(`/songs/${songSlug}`);
  revalidatePath(`/manage/songs/${songSlug}`);
  redirect(`/manage/songs/${songSlug}`);
}

export async function updateVideoLinkAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const songSlug = readRequiredString(formData, "songSlug");
  const type = readRequiredString(formData, "type");
  const label = readRequiredString(formData, "label");
  const url = readRequiredString(formData, "url");

  await prisma.videoLink.update({
    where: {
      id,
    },
    data: {
      type: type === "SONG" ? "SONG" : "TUTORIAL",
      label,
      url,
    },
  });

  revalidateLibrary();
  revalidatePath(`/songs/${songSlug}`);
  revalidatePath(`/manage/songs/${songSlug}`);
  redirect(`/manage/songs/${songSlug}`);
}

export async function deleteVideoLinkAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const songSlug = readRequiredString(formData, "songSlug");

  await prisma.videoLink.delete({
    where: {
      id,
    },
  });

  revalidateLibrary();
  revalidatePath(`/songs/${songSlug}`);
  revalidatePath(`/manage/songs/${songSlug}`);
  redirect(`/manage/songs/${songSlug}`);
}
