"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

function parseFretsInput(value: string) {
  const frets = value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  if (frets.length !== 6) {
    throw new Error("Chord frets must include exactly 6 comma-separated values.");
  }

  return frets.map((fret) => {
    if (fret === "x") {
      return "x";
    }

    const parsed = Number(fret);

    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new Error(`Invalid fret value: ${fret}`);
    }

    return String(parsed);
  });
}

function parseFingersInput(value: string) {
  const fingers = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (fingers.length !== 6) {
    throw new Error("Chord fingers must include exactly 6 comma-separated values.");
  }

  return fingers.map((finger) => {
    const parsed = Number(finger);

    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 4) {
      throw new Error(`Invalid finger value: ${finger}`);
    }

    return parsed;
  });
}

async function revalidateChordPages() {
  revalidatePath("/chords");
  revalidatePath("/");
  revalidatePath("/songs");

  const songs = await prisma.song.findMany({
    select: {
      slug: true,
    },
  });

  for (const song of songs) {
    revalidatePath(`/songs/${song.slug}`);
  }
}

export async function createChordDefinitionAction(formData: FormData) {
  const name = readRequiredString(formData, "name");
  const frets = parseFretsInput(readRequiredString(formData, "frets"));
  const fingers = parseFingersInput(readRequiredString(formData, "fingers"));
  const baseFret = readOptionalNumber(formData, "baseFret");

  await prisma.chordDefinition.create({
    data: {
      name,
      frets,
      fingers,
      baseFret,
    },
  });

  await revalidateChordPages();
  redirect("/chords");
}

export async function updateChordDefinitionAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const name = readRequiredString(formData, "name");
  const frets = parseFretsInput(readRequiredString(formData, "frets"));
  const fingers = parseFingersInput(readRequiredString(formData, "fingers"));
  const baseFret = readOptionalNumber(formData, "baseFret");

  await prisma.chordDefinition.update({
    where: {
      id,
    },
    data: {
      name,
      frets,
      fingers,
      baseFret,
    },
  });

  await revalidateChordPages();
  redirect("/chords");
}

export async function deleteChordDefinitionAction(formData: FormData) {
  const id = readRequiredString(formData, "id");

  await prisma.chordDefinition.delete({
    where: {
      id,
    },
  });

  await revalidateChordPages();
  redirect("/chords");
}
