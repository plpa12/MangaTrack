import "server-only";
import type {
  CreateEditionInput, CreateMangaInput, CreateOfferInput, CreateQuotationInput,
  Edition, Manga, MangaRepository, Offer, OfferStatus, PublicQuotationTrend, Quotation, UpdateEditionInput,
  UpdateMangaInput, UpdateOfferInput
} from "../types";
import { createSupabaseServerClient } from "../supabase/server";
import { buildPublicQuotationTrends, countPublicQuotationValues, summarizePublicQuotationValues } from "../quotation-statistics";
import type { Database } from "../supabase/database.types";
type MangaRow = Database["public"]["Tables"]["manga"]["Row"];
type EditionRow = Database["public"]["Tables"]["editions"]["Row"];
type QuotationRow = Database["public"]["Tables"]["quotations"]["Row"];
type OfferRow = Database["public"]["Tables"]["offers"]["Row"];
type SafeOfferRow = Omit<OfferRow, "previous_price_evidence"> & { previous_price_evidence?: string | null };
const offerSelect = "id,title,manga_id,edition_id,product_type,store,promotional_price,previous_price,previous_price_confirmed,product_url,affiliate_url,image_url,verified_at,expires_at,status,created_at,updated_at";

async function clientOrThrow() {
  const client = await createSupabaseServerClient();
  if (!client) throw new Error("Supabase não está configurado. Defina a URL e a chave pública do projeto.");
  return client;
}
function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}
function mapManga(row: MangaRow): Manga {
  return {
    id: row.id, title: row.title, author: row.author,
    coverUrl: row.cover_path?.startsWith("http") ? row.cover_path : null,
    alternativeTitles: row.alternative_titles ?? [], synopsis: row.synopsis,
    chapterCount: row.chapter_count, originalVolumeCount: row.original_volume_count,
    publicationStatus: row.publication_status as Manga["publicationStatus"], archived: row.archived,
    searchCount: 0, createdAt: row.created_at, updatedAt: row.updated_at
  };
}
function mapEdition(row: EditionRow): Edition {
  return { id: row.id, mangaId: row.manga_id, name: row.name, publisher: row.publisher,
    format: row.format, isbn: row.isbn, physicalVolumeCount: row.physical_volume_count,
    notes: row.notes, archived: row.archived, createdAt: row.created_at };
}
function mapQuotation(row: QuotationRow): Quotation {
  return { id: row.id, editionId: row.edition_id, priceCents: Math.round(Number(row.price) * 100),
    observedAt: row.observed_at, listingUrl: row.listing_url, conditionNotes: row.condition_notes,
    collectionComplete: row.collection_complete, createdAt: row.created_at, archived: row.archived };
}
function mapOffer(row: SafeOfferRow): Offer {
  return { id: row.id, title: row.title, mangaId: row.manga_id, editionId: row.edition_id,
    productType: row.product_type as Offer["productType"], store: row.store,
    promotionalPriceCents: Math.round(Number(row.promotional_price) * 100),
    previousPriceCents: row.previous_price == null ? null : Math.round(Number(row.previous_price) * 100),
    previousPriceConfirmed: row.previous_price_confirmed, previousPriceEvidence: row.previous_price_evidence ?? null,
    productUrl: row.product_url, affiliateUrl: row.affiliate_url, imageUrl: row.image_url,
    verifiedAt: row.verified_at, expiresAt: row.expires_at, status: row.status as OfferStatus,
    createdAt: row.created_at, updatedAt: row.updated_at };
}
const mangaWrite = (input: CreateMangaInput | UpdateMangaInput) => ({
  title: input.title.trim(), author: input.author.trim(), cover_path: input.coverUrl || null,
  alternative_titles: input.alternativeTitles ?? [], synopsis: input.synopsis || null,
  chapter_count: input.chapterCount ?? null, original_volume_count: input.originalVolumeCount ?? null,
  publication_status: input.publicationStatus ?? "unknown", updated_at: new Date().toISOString()
});
const editionWrite = (input: CreateEditionInput | UpdateEditionInput) => ({
  manga_id: input.mangaId, name: input.name.trim(), publisher: input.publisher || null,
  format: input.format || null, isbn: input.isbn || null,
  physical_volume_count: input.physicalVolumeCount ?? null, notes: input.notes || null,
  updated_at: new Date().toISOString()
});
const offerWrite = (input: CreateOfferInput) => ({
  title: input.title.trim(), manga_id: input.mangaId || null, edition_id: input.editionId || null,
  product_type: input.productType, store: input.store.trim(),
  promotional_price: input.promotionalPrice, previous_price: input.previousPrice ?? null,
  previous_price_confirmed: input.previousPriceConfirmed,
  previous_price_evidence: input.previousPriceEvidence || null,
  product_url: input.productUrl, affiliate_url: input.affiliateUrl || null,
  image_url: input.imageUrl || null, verified_at: input.verifiedAt,
  expires_at: input.expiresAt || null, status: input.status, updated_at: new Date().toISOString()
});

export const supabaseData: MangaRepository = {
  async listManga(query) {
    const db = await clientOrThrow();
    let request = db.from("manga").select("*").eq("archived", false).order("title");
    if (query?.trim()) request = request.ilike("title", `%${query.trim().replace(/[%_]/g, "\\$&")}%`);
    const { data, error } = await request;
    fail(error);
    return (data ?? []).map(mapManga);
  },
  async getManga(id) {
    const db = await clientOrThrow();
    const { data, error } = await db.from("manga").select("*").eq("id", id).eq("archived", false).maybeSingle();
    fail(error);
    return data ? mapManga(data) : null;
  },
  async listEditions(mangaId) {
    const db = await clientOrThrow();
    let request = db.from("editions").select("*").eq("archived", false).order("name");
    if (mangaId) request = request.eq("manga_id", mangaId);
    const { data, error } = await request;
    fail(error);
    return (data ?? []).map(mapEdition);
  },
  async listQuotations(editionId, includeArchived = false) {
    const db = await clientOrThrow();
    let request = db.from("quotations").select("*").eq("collection_complete", true).order("observed_at", { ascending: true });
    if (editionId) request = request.eq("edition_id", editionId);
    if (!includeArchived) request = request.eq("archived", false);
    const { data, error } = await request;
    fail(error);
    return (data ?? []).map(mapQuotation);
  },
  async listPublicQuotationTrends(): Promise<PublicQuotationTrend[]> { return buildPublicQuotationTrends(await this.listPublicQuotationValues()); },
  async listPublicQuotationObservationCounts() {
    const [counts, editions] = await Promise.all([this.listPublicQuotationValues().then(countPublicQuotationValues), this.listEditions()]);
    return editions.map(({ id }) => counts.find((count) => count.editionId === id) ?? { editionId: id, observationCount: 0 });
  },
  async listPublicQuotationValues() {
    const db = await clientOrThrow();
    const { data, error } = await db.rpc("get_public_quotation_values");
    fail(error);
    const values: { editionId: string; priceCents: number; observedAt: string }[] = (data ?? []).map((row: { edition_id: string; price: number; observed_at: string }) => ({
      editionId: row.edition_id,
      priceCents: Math.round(Number(row.price) * 100),
      observedAt: row.observed_at
    }));
    return values.sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  },
  async listOffers() {
    const db = await clientOrThrow();
    const { data, error } = await db.from("offers").select(offerSelect).order("verified_at", { ascending: false });
    fail(error);
    return (data ?? []).map(mapOffer);
  },
  async getQuotationSummary(editionId) { return summarizePublicQuotationValues(await this.listPublicQuotationValues(), editionId); },
  async createManga(input) {
    const db = await clientOrThrow();
    const { data, error } = await db.from("manga").insert(mangaWrite(input)).select("*").single();
    fail(error); return mapManga(data);
  },
  async updateManga(id, input) {
    const db = await clientOrThrow();
    const { data, error } = await db.from("manga").update(mangaWrite(input)).eq("id", id).eq("archived", false).select("*").single();
    fail(error); return mapManga(data);
  },
  async archiveManga(id) {
    const db = await clientOrThrow();
    const { error } = await db.from("manga").update({ archived: true, updated_at: new Date().toISOString() }).eq("id", id);
    fail(error);
  },
  async createEdition(input) {
    const db = await clientOrThrow();
    const { data, error } = await db.from("editions").insert(editionWrite(input)).select("*").single();
    fail(error); return mapEdition(data);
  },
  async updateEdition(id, input) {
    const db = await clientOrThrow();
    const { data, error } = await db.from("editions").update(editionWrite(input)).eq("id", id).eq("archived", false).select("*").single();
    fail(error); return mapEdition(data);
  },
  async archiveEdition(id) {
    const db = await clientOrThrow();
    const { error } = await db.from("editions").update({ archived: true, updated_at: new Date().toISOString() }).eq("id", id);
    fail(error);
  },
  async createQuotation(input: CreateQuotationInput) {
    const db = await clientOrThrow();
    const { data, error } = await db.from("quotations").insert({
      edition_id: input.editionId, price: input.price, observed_at: input.observedAt,
      listing_url: input.listingUrl || null, condition_notes: input.conditionNotes || null,
      collection_complete: true
    }).select("*").single();
    fail(error); return mapQuotation(data);
  },
  async setQuotationArchived(id, archived) {
    const db = await clientOrThrow();
    const { data, error } = await db.from("quotations").update({ archived }).eq("id", id).select("*").single();
    fail(error); return mapQuotation(data);
  },
  async createOffer(input) {
    const db = await clientOrThrow();
    const { data, error } = await db.from("offers").insert(offerWrite(input)).select(offerSelect).single();
    fail(error);
    if (!data) throw new Error("O Supabase não retornou a oferta criada.");
    return mapOffer(data);
  },
  async updateOffer(id, input: UpdateOfferInput) {
    const db = await clientOrThrow();
    const { data, error } = await db.from("offers").update({
      title: input.title.trim(), store: input.store.trim(), promotional_price: input.promotionalPrice,
      product_url: input.productUrl, expires_at: input.expiresAt || null, status: input.status,
      updated_at: new Date().toISOString()
    }).eq("id", id).select(offerSelect).single();
    fail(error);
    if (!data) throw new Error("O Supabase não retornou a oferta atualizada.");
    return mapOffer(data);
  },
  async updateOfferStatus(id, status: OfferStatus) {
    const db = await clientOrThrow();
    const { data, error } = await db.from("offers").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select(offerSelect).single();
    fail(error);
    if (!data) throw new Error("O Supabase não retornou a oferta atualizada.");
    return mapOffer(data);
  }
};
