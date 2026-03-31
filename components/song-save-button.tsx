"use client";

import { useFormStatus } from "react-dom";

export function SongSaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving..." : "Save song"}
    </button>
  );
}
