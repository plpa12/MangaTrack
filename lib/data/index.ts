import { localData } from "./local";
import { buildPublicQuotationTrends, countPublicQuotationValues, summarizePublicQuotationValues } from "../quotation-statistics";
import { supabaseData } from "./supabase";
import type { MangaRepository } from "../types";

const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const useSupabase = process.env.MANGATRACK_DATA_MODE === "supabase" && hasSupabaseConfig;

// Configuration is explicit: credentials alone never switch storage providers.
export const dataMode = useSupabase ? "supabase" as const : "local-empty" as const;
export { localData };
export const dataRepository: MangaRepository = useSupabase ? supabaseData : {
  async listManga(query) { return localData.listManga(query); },
  async listPopularManga(limit = 10) { return [...localData.listManga()].filter(m => m.searchCount > 0).sort((a,b) => b.searchCount-a.searchCount).slice(0, Math.max(1, Math.min(limit, 20))); },
  async getManga(id) { return localData.getManga(id); },
  async listEditions(mangaId) { return localData.listEditions(mangaId); },
  async listQuotations(editionId, includeArchived) { return localData.listQuotations(editionId, includeArchived); },
  async listPublicQuotationTrends() { return buildPublicQuotationTrends(await this.listPublicQuotationValues()); },
  async listPublicQuotationObservationCounts() {
    const counts = countPublicQuotationValues(await this.listPublicQuotationValues());
    return (await localData.listEditions()).map(({id}) => counts.find(c => c.editionId === id) ?? {editionId:id, observationCount:0});
  },
  async listPublicQuotationValues() {
    const mangaIds = new Set(localData.listManga().map(m => m.id));
    const editionIds = new Set(localData.listEditions().filter(e => mangaIds.has(e.mangaId)).map(e => e.id));
    return localData.listQuotations().filter(q => editionIds.has(q.editionId) && Number.isSafeInteger(q.priceCents) && q.priceCents > 0)
      .map(({editionId,priceCents,observedAt}) => ({editionId,priceCents,observedAt})).sort((a,b) => b.observedAt.localeCompare(a.observedAt));
  },
  async listOffers() { return localData.listOffers(); },
  async getQuotationSummary(editionId) { return summarizePublicQuotationValues(await this.listPublicQuotationValues(), editionId); },
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
