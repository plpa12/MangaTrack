import "server-only";
import { randomUUID } from "node:crypto";
import type { Edition, Manga, Offer, Quotation } from "../types";

// Local-only in-memory adapter. It is not durable and is disabled for Supabase mode.
type LocalStore = { mangas: Manga[]; editions: Edition[]; quotations: Quotation[]; offers: Offer[] };
const globalForMangaTrack = globalThis as typeof globalThis & { __mangatrackLocalStore?: LocalStore };
const store = globalForMangaTrack.__mangatrackLocalStore ??= { mangas: [], editions: [], quotations: [], offers: [] };

export const localData = {
  listManga(query = ""): Manga[] {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return store.mangas.filter((m) => !m.archived && (!q || [m.title, ...m.alternativeTitles].some((s) => s.toLocaleLowerCase("pt-BR").includes(q))));
  },
  getManga(id: string): Manga | null { return store.mangas.find((m) => m.id === id && !m.archived) ?? null; },
  listEditions(mangaId?: string): Edition[] { return store.editions.filter((e) => !e.archived && (!mangaId || e.mangaId === mangaId)); },
  listQuotations(editionId?: string): Quotation[] { return store.quotations.filter((q) => q.collectionComplete && (!editionId || q.editionId === editionId)); },
  listOffers(): Offer[] { return store.offers; },
  createManga(input: { title: string; author: string; coverUrl?: string | null; alternativeTitles?: string[]; synopsis?: string | null; chapterCount?: number | null; originalVolumeCount?: number | null; publicationStatus?: Manga["publicationStatus"] }): Manga {
    const now = new Date().toISOString();
    const manga: Manga = {
      id: randomUUID(), title: input.title.trim(), author: input.author.trim(), coverUrl: input.coverUrl || null,
      alternativeTitles: input.alternativeTitles ?? [], synopsis: input.synopsis || null,
      chapterCount: input.chapterCount ?? null, originalVolumeCount: input.originalVolumeCount ?? null,
      publicationStatus: input.publicationStatus ?? "unknown", archived: false, searchCount: 0,
      createdAt: now, updatedAt: now
    };
    store.mangas.push(manga);
    return manga;
  },
  mode: "local-empty" as const
};