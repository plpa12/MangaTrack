import "server-only";
import { randomUUID } from "node:crypto";
import type { Edition, Manga, Offer, Quotation } from "../types";

// Local-only in-memory adapter. It is not durable and must never be used for production data.
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
  listOffers(): Offer[] { return [...store.offers]; },
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
  updateManga(id: string, input: { title: string; author: string; coverUrl?: string | null; alternativeTitles?: string[]; synopsis?: string | null; chapterCount?: number | null; originalVolumeCount?: number | null; publicationStatus?: Manga["publicationStatus"] }): Manga {
    const manga = store.mangas.find((item) => item.id === id && !item.archived);
    if (!manga) throw new Error("A obra não foi encontrada ou já está arquivada.");
    const normalizedTitle = input.title.trim().toLocaleLowerCase("pt-BR");
    if (store.mangas.some((item) => item.id !== id && !item.archived && item.title.toLocaleLowerCase("pt-BR") === normalizedTitle)) {
      throw new Error("Já existe uma obra ativa com esse título.");
    }
    Object.assign(manga, {
      title: input.title.trim(), author: input.author.trim(), coverUrl: input.coverUrl || null,
      alternativeTitles: input.alternativeTitles ?? [], synopsis: input.synopsis || null,
      chapterCount: input.chapterCount ?? null, originalVolumeCount: input.originalVolumeCount ?? null,
      publicationStatus: input.publicationStatus ?? "unknown", updatedAt: new Date().toISOString()
    });
    return manga;
  },
  archiveManga(id: string): void {
    const manga = store.mangas.find((item) => item.id === id && !item.archived);
    if (!manga) throw new Error("A obra não foi encontrada ou já está arquivada.");
    manga.archived = true;
    manga.updatedAt = new Date().toISOString();
  },
  createEdition(input: { mangaId: string; name: string; publisher?: string | null; format?: string | null; isbn?: string | null; physicalVolumeCount?: number | null; notes?: string | null }): Edition {
    if (!this.getManga(input.mangaId)) throw new Error("A obra selecionada não existe.");
    if (store.editions.some((e) => e.mangaId === input.mangaId && e.name.toLocaleLowerCase("pt-BR") === input.name.trim().toLocaleLowerCase("pt-BR") && !e.archived)) throw new Error("Já existe uma edição com esse nome para esta obra.");
    const edition: Edition = { id: randomUUID(), mangaId: input.mangaId, name: input.name.trim(), publisher: input.publisher || null, format: input.format || null, isbn: input.isbn || null, physicalVolumeCount: input.physicalVolumeCount ?? null, notes: input.notes || null, archived: false, createdAt: new Date().toISOString() };
    store.editions.push(edition);
    return edition;
  },
  updateEdition(id: string, input: { mangaId: string; name: string; publisher?: string | null; format?: string | null; isbn?: string | null; physicalVolumeCount?: number | null; notes?: string | null }): Edition {
    const edition = store.editions.find((item) => item.id === id && !item.archived);
    if (!edition) throw new Error("A edição não foi encontrada ou já está arquivada.");
    if (!this.getManga(input.mangaId)) throw new Error("A obra selecionada não existe.");
    if (store.editions.some((item) => item.id !== id && item.mangaId === input.mangaId && !item.archived && item.name.toLocaleLowerCase("pt-BR") === input.name.trim().toLocaleLowerCase("pt-BR"))) {
      throw new Error("Já existe uma edição com esse nome para esta obra.");
    }
    Object.assign(edition, { mangaId: input.mangaId, name: input.name.trim(), publisher: input.publisher || null, format: input.format || null, isbn: input.isbn || null, physicalVolumeCount: input.physicalVolumeCount ?? null, notes: input.notes || null });
    return edition;
  },
  archiveEdition(id: string): void {
    const edition = store.editions.find((item) => item.id === id && !item.archived);
    if (!edition) throw new Error("A edição não foi encontrada ou já está arquivada.");
    edition.archived = true;
  },
  createQuotation(input: { editionId: string; price: number; observedAt: string; listingUrl?: string | null; conditionNotes?: string | null; collectionComplete: true }): Quotation {
    if (!store.editions.some((e) => e.id === input.editionId && !e.archived)) throw new Error("A edição selecionada não existe.");
    const quotation: Quotation = { id: randomUUID(), editionId: input.editionId, priceCents: Math.round(input.price * 100), observedAt: input.observedAt, listingUrl: input.listingUrl || null, conditionNotes: input.conditionNotes || null, collectionComplete: true, createdAt: new Date().toISOString() };
    store.quotations.push(quotation);
    return quotation;
  },
  createOffer(input: { title: string; mangaId?: string | null; editionId?: string | null; productType: Offer["productType"]; store: string; promotionalPrice: number; previousPrice?: number | null; previousPriceConfirmed: boolean; previousPriceEvidence?: string | null; productUrl: string; affiliateUrl?: string | null; imageUrl?: string | null; verifiedAt: string; expiresAt?: string | null; status: Offer["status"] }): Offer {
    if (input.mangaId && !this.getManga(input.mangaId)) throw new Error("A obra selecionada para a oferta não existe.");
    if (input.editionId && !store.editions.some((edition) => edition.id === input.editionId && !edition.archived)) throw new Error("A edição selecionada para a oferta não existe.");
    if (input.mangaId && input.editionId && store.editions.some((edition) => edition.id === input.editionId && edition.mangaId !== input.mangaId)) throw new Error("A edição selecionada não pertence à obra escolhida.");
    const now = new Date().toISOString();
    const offer: Offer = {
      id: randomUUID(), title: input.title.trim(), mangaId: input.mangaId || null, editionId: input.editionId || null,
      productType: input.productType, store: input.store.trim(), promotionalPriceCents: Math.round(input.promotionalPrice * 100),
      previousPriceCents: input.previousPrice ? Math.round(input.previousPrice * 100) : null,
      previousPriceConfirmed: input.previousPriceConfirmed, previousPriceEvidence: input.previousPriceEvidence || null,
      productUrl: input.productUrl, affiliateUrl: input.affiliateUrl || null, imageUrl: input.imageUrl || null,
      verifiedAt: input.verifiedAt, expiresAt: input.expiresAt || null, status: input.status, createdAt: now, updatedAt: now
    };
    store.offers.push(offer);
    return offer;
  },
  mode: "local-empty" as const
};
