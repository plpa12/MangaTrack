"use client";

import { useEffect } from "react";

export default function MangaViewTracker({ mangaId }: { mangaId: string }) {
  useEffect(() => {
    void fetch(`/api/manga/${encodeURIComponent(mangaId)}/view`, {
      method: "POST", credentials: "same-origin", keepalive: true
    }).catch(() => {
      // Popularity tracking is non-critical; never interrupt reading if it is unavailable.
    });
  }, [mangaId]);
  return null;
}
