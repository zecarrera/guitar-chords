"use client";

import { useState } from "react";

type SourceType = "PDF" | "EXTERNAL_LINK";

type SongDocumentFieldsProps = {
  defaultSourceType?: SourceType;
  documentTitleDefaultValue?: string;
  existingPdfFileHref?: string;
  existingPdfFileName?: string | null;
  extractedTextDefaultValue?: string;
  extractedTextRows?: number;
  fileUrlDefaultValue?: string;
  includeDocumentTitle?: boolean;
  includeHostedPdfUrl?: boolean;
  pdfFieldLabel?: string;
  scrollSpeedDefaultValue?: number;
  sourceUrlDefaultValue?: string;
};

function labelClassName() {
  return "space-y-2";
}

function inputClassName() {
  return "w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white";
}

export function SongDocumentFields({
  defaultSourceType = "PDF",
  documentTitleDefaultValue,
  existingPdfFileHref,
  existingPdfFileName,
  extractedTextDefaultValue = "",
  extractedTextRows = 10,
  fileUrlDefaultValue = "",
  includeDocumentTitle = false,
  includeHostedPdfUrl = false,
  pdfFieldLabel = "PDF upload",
  scrollSpeedDefaultValue = 24,
  sourceUrlDefaultValue = "",
}: SongDocumentFieldsProps) {
  const [sourceType, setSourceType] = useState<SourceType>(defaultSourceType);
  const isExternalLink = sourceType === "EXTERNAL_LINK";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {includeDocumentTitle ? (
          <label className={labelClassName()}>
            <span className="text-sm font-medium text-slate-200">Document title</span>
            <input
              name="documentTitle"
              defaultValue={documentTitleDefaultValue}
              className={inputClassName()}
              required
            />
          </label>
        ) : null}

        <label className={labelClassName()}>
          <span className="text-sm font-medium text-slate-200">Source type</span>
          <select
            name="sourceType"
            defaultValue={defaultSourceType}
            className={inputClassName()}
            onChange={(event) => setSourceType(event.target.value as SourceType)}
          >
            <option value="PDF">PDF</option>
            <option value="EXTERNAL_LINK">External link</option>
          </select>
        </label>
      </div>

      {isExternalLink ? (
        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-slate-200">External link</span>
          <input
            type="url"
            name="sourceUrl"
            defaultValue={sourceUrlDefaultValue}
            placeholder="https://example.com/chords/song-name"
            className={inputClassName()}
            required
          />
          <p className="text-xs leading-5 text-slate-400">
            Save the original song or chord page URL here so it can be opened later.
          </p>
        </label>
      ) : (
        <div className="mt-4 space-y-4">
          {includeHostedPdfUrl ? (
            <label className={labelClassName()}>
              <span className="text-sm font-medium text-slate-200">Hosted PDF URL</span>
              <input
                type="url"
                name="fileUrl"
                defaultValue={fileUrlDefaultValue}
                placeholder="https://example.com/song.pdf"
                className={inputClassName()}
              />
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">{pdfFieldLabel}</span>
            <input
              type="file"
              name="pdfFile"
              accept="application/pdf"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-amber-300 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-950"
            />
            {existingPdfFileHref && existingPdfFileName ? (
              <a
                href={existingPdfFileHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-xs font-semibold text-amber-300"
              >
                Current uploaded PDF: {existingPdfFileName}
              </a>
            ) : null}
            <p className="text-xs leading-5 text-slate-400">
              Uploaded PDFs are stored in PostgreSQL and parsed into the chord sheet
              automatically. You can still edit the extracted text later.
            </p>
          </label>
        </div>
      )}

      <label className="mt-4 block space-y-2">
        <span className="text-sm font-medium text-slate-200">Reader content</span>
        <textarea
          name="extractedText"
          rows={extractedTextRows}
          defaultValue={extractedTextDefaultValue}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 font-mono text-sm text-white"
          placeholder="Verse&#10;[G] line one&#10;[D] line two"
        />
        <p className="text-xs leading-5 text-slate-400">
          {isExternalLink
            ? "Optional: paste the text you want in the player, or add it later after saving the link."
            : "Leave the existing text untouched when replacing a PDF and the new file will refresh this chord sheet automatically."}
        </p>
      </label>

      <label className="mt-4 block space-y-2">
        <span className="text-sm font-medium text-slate-200">Scroll speed</span>
        <input
          type="number"
          min="1"
          name="scrollSpeed"
          defaultValue={scrollSpeedDefaultValue}
          className={inputClassName()}
        />
      </label>
    </>
  );
}
