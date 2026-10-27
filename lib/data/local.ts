import type { Edition, Manga, Offer, Quotation } from "../types";

// Deliberately empty. Data exists only for this server process and is lost on restart.
const mangas: Manga[] = [];
const editions: Edition[] = [];
const quotations: Quotation[] = [];
const offers: Offer[] = [];

export const localData = {
  listManga(query = ""): Manga[] {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return mangas.filter((m) => !m.archived && (!q || [m.title, ...m.alternativeTitles].some((s) => s.toLocaleLowerCase("pt-BR").includes(q))));
  },
  getManga(id: string): Manga | null { return mangas.find((m) => m.id === id && !m.archived) ?? null; },
  listEditions(mangaId?: string): Edition[] { return editions.filter((e) => !e.archived && (!mangaId || e.mangaId === mangaId)); },
  listQuotations(editionId?: string): Quotation[] { return quotations.filter((q) => q.collectionComplete && (!editionId || q.editionId === editionId)); },
  listOffers(): Offer[] { return offers; },
  // Mutations are intentionally not exposed until a real server-side admin/auth adapter is configured.
  mode: "local-empty" as const
};