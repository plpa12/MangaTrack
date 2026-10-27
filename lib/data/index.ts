import { localData } from "./local";
import { summarizeQuotations } from "../money";
import type { MangaRepository } from "../types";

// Supabase is intentionally not selected until its repository adapter and auth are implemented.
// Merely adding environment variables must never imply that data is connected or persistent.
export const dataMode = "local-empty" as const;

export { localData };

export const dataRepository: MangaRepository = {
  async listManga(query) {
    return localData.listManga(query);
  },
  async getManga(id) {
    return localData.getManga(id);
  },
  async listEditions(mangaId) {
    return localData.listEditions(mangaId);
  },
  async listQuotations(editionId) {
    return localData.listQuotations(editionId);
  },
  async listOffers() {
    return localData.listOffers();
  },
  async getQuotationSummary(editionId) {
    return summarizeQuotations(localData.listQuotations(editionId));
  },
  async createManga(input) {
    return localData.createManga(input);
  },
  async createEdition(input) {
    return localData.createEdition(input);
  },
  async createQuotation(input) {
    return localData.createQuotation(input);
  },
  async createOffer(input) {
    return localData.createOffer(input);
  }
};

export function getDataModeLabel(): string {
  return "Modo local — dados temporários não persistentes";
}
