import { localData } from "./local";
import { supabaseData } from "./supabase";
import { summarizeQuotations } from "../money";
import type { MangaRepository } from "../types";

const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const useSupabase = process.env.MANGATRACK_DATA_MODE === "supabase" && hasSupabaseConfig;

// Configuration is explicit: credentials alone never switch storage providers.
export const dataMode = useSupabase ? "supabase" as const : "local-empty" as const;
export { localData };
export const dataRepository: MangaRepository = useSupabase ? supabaseData : {
  async listManga(query) { return localData.listManga(query); },
  async getManga(id) { return localData.getManga(id); },
  async listEditions(mangaId) { return localData.listEditions(mangaId); },
  async listQuotations(editionId, includeArchived) { return localData.listQuotations(editionId, includeArchived); },
  async listPublicQuotationTrends() {
    const buckets = new Map<string, { editionId: string; observedDay: string; totalCents: number; count: number }>();
    for (const quotation of localData.listQuotations()) {
      const observedDay = quotation.observedAt.slice(0, 10);
      const key = `${quotation.editionId}:${observedDay}`;
      const bucket = buckets.get(key) ?? { editionId: quotation.editionId, observedDay, totalCents: 0, count: 0 };
      bucket.totalCents += quotation.priceCents;
      bucket.count += 1;
      buckets.set(key, bucket);
    }
    return [...buckets.values()].filter(({ count }) => count >= 3).map(({ editionId, observedDay, totalCents, count }) => ({
      editionId, observedDay, averagePriceCents: Math.round(totalCents / count), observationCount: count
    })).sort((a, b) => a.observedDay.localeCompare(b.observedDay));
  },
  async listPublicQuotationObservationCounts() {
    const editions = await localData.listEditions();
    return Promise.all(editions.map(async (edition) => ({
      editionId: edition.id,
      observationCount: (await localData.listQuotations(edition.id)).length
    })));
  },
  async listOffers() { return localData.listOffers(); },
  async getQuotationSummary(editionId) { return summarizeQuotations(localData.listQuotations(editionId)); },
  async createManga(input) { return localData.createManga(input); },
  async updateManga(id, input) { return localData.updateManga(id, input); },
  async archiveManga(id) { localData.archiveManga(id); },
  async createEdition(input) { return localData.createEdition(input); },
  async updateEdition(id, input) { return localData.updateEdition(id, input); },
  async archiveEdition(id) { localData.archiveEdition(id); },
  async createQuotation(input) { return localData.createQuotation(input); },
  async setQuotationArchived(id, archived) { return localData.setQuotationArchived(id, archived); },
  async createOffer(input) { return localData.createOffer(input); },
  async updateOffer(id, input) { return localData.updateOffer(id, input); },
  async updateOfferStatus(id, status) { return localData.updateOfferStatus(id, status); }
};

export function getDataModeLabel(): string {
  return dataMode === "supabase" ? "Supabase — banco conectado" : "Modo local — dados temporários não persistentes";
}
