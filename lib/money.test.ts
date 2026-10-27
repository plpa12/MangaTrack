import { describe, expect, it } from "vitest";
import { calculateDiscountPercent, isPublicOffer, sortPublicOffers, summarizeQuotations } from "./money";
import type { Offer, Quotation } from "./types";

const quote = (priceCents: number, date: string, complete = true): Quotation => ({
  id: date, editionId: "edition-a", priceCents, observedAt: date, listingUrl: null,
  conditionNotes: null, collectionComplete: complete, createdAt: date
});
const offer = (overrides: Partial<Offer> = {}): Offer => ({
  id: "offer", title: "Produto", mangaId: null, editionId: null, productType: "volume",
  store: "Loja", promotionalPriceCents: 8000, previousPriceCents: 10000,
  previousPriceConfirmed: true, previousPriceEvidence: "https://example.com/evidencia",
  productUrl: "https://example.com/produto", affiliateUrl: null, imageUrl: null,
  verifiedAt: "2026-01-01T00:00:00.000Z", expiresAt: null, status: "published",
  createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", ...overrides
});

describe("summarizeQuotations", () => {
  it("ignores incomplete collections and calculates average and thresholds", () => {
    const result = summarizeQuotations([quote(10000, "2026-01-01"), quote(20000, "2026-01-02"), quote(500, "2026-01-03", false)]);
    expect(result.averageCents).toBe(15000);
    expect(result.goodPriceCents).toBe(13500);
    expect(result.greatPriceCents).toBe(12000);
    expect(result.observationCount).toBe(2);
    expect(result.limitedSample).toBe(true);
  });
  it("flags fewer than five valid observations", () => {
    expect(summarizeQuotations(Array.from({length: 4}, (_, i) => quote(1000, `2026-01-0${i + 1}`))).limitedSample).toBe(true);
    expect(summarizeQuotations(Array.from({length: 5}, (_, i) => quote(1000, `2026-01-0${i + 1}`))).limitedSample).toBe(false);
  });
  it("returns an empty summary with no valid observations", () => {
    expect(summarizeQuotations([quote(1000, "2026-01-01", false)]).averageCents).toBeNull();
  });
});
describe("offer rules", () => {
  it("calculates discount only when previous price is confirmed with evidence", () => {
    expect(calculateDiscountPercent(offer())).toBe(20);
    expect(calculateDiscountPercent(offer({previousPriceConfirmed:false}))).toBeNull();
    expect(calculateDiscountPercent(offer({previousPriceEvidence:" "}))).toBeNull();
    expect(calculateDiscountPercent(offer({previousPriceCents:7000}))).toBeNull();
  });
  it("hides drafts, disabled and expired offers", () => {
    const now = new Date("2026-03-01T00:00:00.000Z");
    expect(isPublicOffer(offer({status:"draft"}), now)).toBe(false);
    expect(isPublicOffer(offer({status:"disabled"}), now)).toBe(false);
    expect(isPublicOffer(offer({expiresAt:"2026-02-28T00:00:00.000Z"}), now)).toBe(false);
    expect(isPublicOffer(offer(), now)).toBe(true);
  });
  it("sorts confirmed discounts first, then by verification date", () => {
    const sorted = sortPublicOffers([
      offer({id:"none", previousPriceConfirmed:false, verifiedAt:"2026-02-01T00:00:00.000Z"}),
      offer({id:"older", verifiedAt:"2026-01-01T00:00:00.000Z"}),
      offer({id:"newer", verifiedAt:"2026-02-01T00:00:00.000Z"})
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["newer", "older", "none"]);
  });
});