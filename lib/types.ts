export type PublicationStatus = "ongoing" | "completed" | "hiatus" | "unknown";
export type ProductType = "volume" | "box_set" | "special_edition" | "omnibus" | "other";
export type OfferStatus = "draft" | "published" | "disabled" | "expired";

export interface Manga {
  id: string; title: string; author: string; coverUrl: string | null;
  alternativeTitles: string[]; synopsis: string | null; chapterCount: number | null;
  originalVolumeCount: number | null; publicationStatus: PublicationStatus;
  archived: boolean; searchCount: number; createdAt: string; updatedAt: string;
}
export interface Edition {
  id: string; mangaId: string; name: string; publisher: string | null; format: string | null;
  isbn: string | null; physicalVolumeCount: number | null; notes: string | null;
  archived: boolean; createdAt: string;
}
export interface Quotation {
  id: string; editionId: string; priceCents: number; observedAt: string;
  listingUrl: string | null; conditionNotes: string | null; collectionComplete: boolean;
  createdAt: string;
}
export interface Offer {
  id: string; title: string; mangaId: string | null; editionId: string | null;
  productType: ProductType; store: string; promotionalPriceCents: number;
  previousPriceCents: number | null; previousPriceConfirmed: boolean;
  previousPriceEvidence: string | null; productUrl: string; affiliateUrl: string | null;
  imageUrl: string | null; verifiedAt: string; expiresAt: string | null;
  status: OfferStatus; createdAt: string; updatedAt: string;
}
export interface PriceSummary {
  averageCents: number | null; goodPriceCents: number | null; greatPriceCents: number | null;
  observationCount: number; latestObservedAt: string | null; limitedSample: boolean;
}
export interface OfferView extends Offer { discountPercent: number | null }

export interface CreateMangaInput {
  title: string; author: string; coverUrl?: string | null; alternativeTitles?: string[];
  synopsis?: string | null; chapterCount?: number | null; originalVolumeCount?: number | null;
  publicationStatus?: PublicationStatus;
}
export interface UpdateMangaInput {
  title: string; author: string; coverUrl?: string | null; alternativeTitles?: string[];
  synopsis?: string | null; chapterCount?: number | null; originalVolumeCount?: number | null;
  publicationStatus?: PublicationStatus;
}
export interface CreateEditionInput {
  mangaId: string; name: string; publisher?: string | null; format?: string | null;
  isbn?: string | null; physicalVolumeCount?: number | null; notes?: string | null;
}
export interface CreateQuotationInput {
  editionId: string; price: number; observedAt: string; listingUrl?: string | null;
  conditionNotes?: string | null; collectionComplete: true;
}
export interface CreateOfferInput {
  title: string; mangaId?: string | null; editionId?: string | null; productType: ProductType;
  store: string; promotionalPrice: number; previousPrice?: number | null;
  previousPriceConfirmed: boolean; previousPriceEvidence?: string | null; productUrl: string;
  affiliateUrl?: string | null; imageUrl?: string | null; verifiedAt: string;
  expiresAt?: string | null; status: OfferStatus;
}

/** Async data contract keeps pages and server actions independent of the storage provider. */
export interface MangaRepository {
  listManga(query?: string): Promise<Manga[]>;
  getManga(id: string): Promise<Manga | null>;
  listEditions(mangaId?: string): Promise<Edition[]>;
  listQuotations(editionId?: string): Promise<Quotation[]>;
  listOffers(): Promise<Offer[]>;
  getQuotationSummary(editionId: string): Promise<PriceSummary>;
  createManga(input: CreateMangaInput): Promise<Manga>;
  updateManga(id: string, input: UpdateMangaInput): Promise<Manga>;
  archiveManga(id: string): Promise<void>;
  createEdition(input: CreateEditionInput): Promise<Edition>;
  createQuotation(input: CreateQuotationInput): Promise<Quotation>;
  createOffer(input: CreateOfferInput): Promise<Offer>;
}
