"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SongSaveFeedback() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const wasSaved = searchParams.get("saved") === "1";

  useEffect(() => {
    if (!wasSaved) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("saved");
      router.replace(
        nextParams.size > 0 ? `${pathname}?${nextParams.toString()}` : pathname,
        { scroll: false },
      );
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname, router, searchParams, wasSaved]);

  if (!wasSaved) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-50 rounded-2xl border border-emerald-300/30 bg-emerald-300/15 px-4 py-3 text-sm font-medium text-emerald-100 shadow-lg shadow-emerald-950/30 backdrop-blur"
    >
      Song saved successfully.
    </div>
  );
}
