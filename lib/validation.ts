import { z } from "zod";

const optionalHttpUrl = z.union([z.literal(""), z.url().refine((value) => /^https?:\/\//i.test(value))]).optional().transform((value) => value || null);
const money = z.number().finite().positive().max(100000000);

export const mangaInputSchema = z.object({
  title: z.string().trim().min(1).max(180),
  author: z.string().trim().min(1).max(180),
  coverUrl: optionalHttpUrl,
  alternativeTitles: z.array(z.string().trim().min(1).max(180)).max(30).default([]),
  synopsis: z.string().max(10000).optional().nullable(),
  chapterCount: z.number().int().nonnegative().nullable().optional(),
  originalVolumeCount: z.number().int().nonnegative().nullable().optional(),
  publicationStatus: z.enum(["ongoing", "completed", "hiatus", "unknown"]).default("unknown")
});

export const editionInputSchema = z.object({
  mangaId: z.uuid(),
  name: z.string().trim().min(1).max(180),
  publisher: z.string().trim().max(180).optional().nullable(),
  format: z.string().trim().max(100).optional().nullable(),
  isbn: z.string().trim().max(32).optional().nullable(),
  physicalVolumeCount: z.number().int().positive().nullable().optional(),
  notes: z.string().max(5000).optional().nullable()
});

export const quotationInputSchema = z.object({
  editionId: z.uuid(),
  price: money,
  observedAt: z.iso.datetime(),
  listingUrl: optionalHttpUrl,
  conditionNotes: z.string().max(5000).optional().nullable(),
  collectionComplete: z.literal(true)
});

export const offerInputSchema = z.object({
  title: z.string().trim().min(1).max(220),
  mangaId: z.uuid().optional().nullable(),
  editionId: z.uuid().optional().nullable(),
  productType: z.enum(["volume", "box_set", "special_edition", "omnibus", "other"]),
  store: z.string().trim().min(1).max(120),
  promotionalPrice: money,
  previousPrice: money.optional().nullable(),
  previousPriceConfirmed: z.boolean().default(false),
  previousPriceEvidence: optionalHttpUrl,
  productUrl: z.url().refine((value) => /^https?:\/\//i.test(value)),
  affiliateUrl: optionalHttpUrl,
  imageUrl: optionalHttpUrl,
  verifiedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime().optional().nullable(),
  status: z.enum(["draft", "published", "disabled", "expired"]).default("draft")
}).superRefine((offer, ctx) => {
  if (offer.previousPriceConfirmed) {
    if (offer.previousPrice === null || offer.previousPrice === undefined || offer.previousPrice <= offer.promotionalPrice) {
      ctx.addIssue({ code: "custom", path: ["previousPrice"], message: "O preço anterior confirmado deve ser maior que o preço promocional." });
    }
    if (!offer.previousPriceEvidence) {
      ctx.addIssue({ code: "custom", path: ["previousPriceEvidence"], message: "Informe a evidência do preço anterior." });
    }
  }
  if (offer.status === "published" && !offer.productUrl) {
    ctx.addIssue({ code: "custom", path: ["productUrl"], message: "Uma oferta publicada precisa de link do produto." });
  }
});

export type MangaInput = z.infer<typeof mangaInputSchema>;
export type EditionInput = z.infer<typeof editionInputSchema>;
export type QuotationInput = z.infer<typeof quotationInputSchema>;
export type OfferInput = z.infer<typeof offerInputSchema>;