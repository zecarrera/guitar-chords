"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function shouldHideFooter(pathname: string) {
  return (
    pathname.startsWith("/songs/") &&
    window.innerWidth < 640 &&
    document.documentElement.dataset.songPlayerActive === "true"
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setIsHidden(shouldHideFooter(pathname));
    }

    const observer = new MutationObserver(updateVisibility);

    updateVisibility();
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-song-player-active", "data-song-view"],
    });
    window.addEventListener("resize", updateVisibility);
    window.addEventListener("orientationchange", updateVisibility);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateVisibility);
      window.removeEventListener("orientationchange", updateVisibility);
    };
  }, [pathname]);

  if (isHidden) {
    return null;
  }

  return (
    <footer className="site-footer border-t border-white/10 py-6 text-sm text-slate-400">
      Built for a single-user MVP on Render with PostgreSQL, Prisma, and object
      storage for imported PDFs.
    </footer>
  );
}
