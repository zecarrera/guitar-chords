"use client";

import { useEffect } from "react";

export function SongViewChrome() {
  useEffect(() => {
    const root = document.documentElement;

    root.dataset.songView = "true";

    return () => {
      delete root.dataset.songView;
      delete root.dataset.songPlayerActive;
    };
  }, []);

  return null;
}
