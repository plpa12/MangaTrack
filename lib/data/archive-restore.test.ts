import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { localData } from "./local";

describe("archive and restore behavior", () => {
  it("keeps archived manga separate and restores it to the active catalog", () => {
    const manga = localData.createManga({
      title: `Archive restore test ${randomUUID()}`,
      author: "Test author"
    });

    localData.archiveManga(manga.id);
    expect(localData.listManga().some((item) => item.id === manga.id)).toBe(false);
    expect(localData.listArchivedManga().some((item) => item.id === manga.id)).toBe(true);

    localData.restoreManga(manga.id);
    expect(localData.listArchivedManga().some((item) => item.id === manga.id)).toBe(false);
    expect(localData.listManga().some((item) => item.id === manga.id)).toBe(true);
  });

  it("restores an edition without changing its quotation history", () => {
    const manga = localData.createManga({
      title: `Edition restore test ${randomUUID()}`,
      author: "Test author"
    });
    const edition = localData.createEdition({ mangaId: manga.id, name: "Kanzenban" });
    const quotation = localData.createQuotation({
      editionId: edition.id,
      price: 450,
      observedAt: "2026-10-27T20:09:00.000Z",
      collectionComplete: true
    });

    localData.archiveEdition(edition.id);
    expect(localData.listEditions(manga.id).some((item) => item.id === edition.id)).toBe(false);
    expect(localData.listArchivedEditions().some((item) => item.id === edition.id)).toBe(true);

    localData.restoreEdition(edition.id);
    expect(localData.listArchivedEditions().some((item) => item.id === edition.id)).toBe(false);
    expect(localData.listEditions(manga.id).some((item) => item.id === edition.id)).toBe(true);
    expect(localData.listQuotations(edition.id, true)).toContainEqual(
      expect.objectContaining({ id: quotation.id, priceCents: 45000 })
    );
  });
});
