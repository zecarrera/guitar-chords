"use client";

import { useEffect, useMemo, useState } from "react";

import { AutoScrollReader } from "@/components/auto-scroll-reader";
import { parseChordSections } from "@/lib/chord-sections";
import type { ChordDefinition } from "@/lib/types";

type SongEditorPreviewProps = {
  artistOptions: Array<{
    id: string;
    name: string;
  }>;
  chordDefinitions: ChordDefinition[];
  formId: string;
  initialArtistId: string;
  initialArtistName: string;
  initialExtractedText: string;
  initialScrollSpeed: number;
  initialTitle: string;
};

type PreviewState = {
  artistName: string;
  extractedText: string;
  scrollSpeed: number;
  title: string;
};

function readPreviewState(
  form: HTMLFormElement,
  artistOptions: SongEditorPreviewProps["artistOptions"],
  fallbackState: PreviewState,
) {
  const formData = new FormData(form);
  const titleValue = formData.get("title");
  const extractedTextValue = formData.get("extractedText");
  const scrollSpeedValue = formData.get("scrollSpeed");
  const artistIdValue = formData.get("artistId");

  const matchedArtist =
    typeof artistIdValue === "string"
      ? artistOptions.find((artist) => artist.id === artistIdValue)
      : null;
  const parsedScrollSpeed =
    typeof scrollSpeedValue === "string" && scrollSpeedValue.trim()
      ? Number(scrollSpeedValue)
      : fallbackState.scrollSpeed;

  return {
    title:
      typeof titleValue === "string" && titleValue.trim()
        ? titleValue
        : fallbackState.title,
    artistName: matchedArtist?.name ?? fallbackState.artistName,
    extractedText:
      typeof extractedTextValue === "string"
        ? extractedTextValue
        : fallbackState.extractedText,
    scrollSpeed:
      Number.isFinite(parsedScrollSpeed) && parsedScrollSpeed > 0
        ? parsedScrollSpeed
        : fallbackState.scrollSpeed,
  };
}

export function SongEditorPreview({
  artistOptions,
  chordDefinitions,
  formId,
  initialArtistId,
  initialArtistName,
  initialExtractedText,
  initialScrollSpeed,
  initialTitle,
}: SongEditorPreviewProps) {
  const initialState = useMemo<PreviewState>(
    () => ({
      title: initialTitle,
      artistName:
        artistOptions.find((artist) => artist.id === initialArtistId)?.name ??
        initialArtistName,
      extractedText: initialExtractedText,
      scrollSpeed: initialScrollSpeed,
    }),
    [
      artistOptions,
      initialArtistId,
      initialArtistName,
      initialExtractedText,
      initialScrollSpeed,
      initialTitle,
    ],
  );
  const [previewState, setPreviewState] = useState(initialState);
  const previewSections = useMemo(
    () => parseChordSections(previewState.extractedText),
    [previewState.extractedText],
  );

  useEffect(() => {
    const form = document.getElementById(formId);

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const syncPreview = () => {
      setPreviewState(readPreviewState(form, artistOptions, initialState));
    };

    form.addEventListener("input", syncPreview);
    form.addEventListener("change", syncPreview);

    return () => {
      form.removeEventListener("input", syncPreview);
      form.removeEventListener("change", syncPreview);
    };
  }, [artistOptions, formId, initialState]);

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Public page preview
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          This live preview mirrors the public song page formatting for the title,
          artist, reader content, and scroll speed while you edit, without the
          separate video dock.
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          {previewState.artistName}
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          {previewState.title}
        </h2>
      </div>

      <AutoScrollReader
        chordDefinitions={chordDefinitions}
        defaultSpeed={previewState.scrollSpeed}
        sections={previewSections}
      />
    </div>
  );
}
