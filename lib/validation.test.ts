import { describe, expect, it } from "vitest";
import { editionInputSchema, offerInputSchema, quotationInputSchema } from "./validation";

const validOffer = {
  title: "Volume 1", mangaId: null, editionId: null, productType: "volume", store: "Loja",
  promotionalPrice: 30, previousPrice: null, previousPriceConfirmed: false, previousPriceEvidence: "",
  productUrl: "https://example.com/produto", affiliateUrl: "", imageUrl: "",
  verifiedAt: "2026-05-01T12:00:00.000Z", expiresAt: null, status: "draft"
} as const;

describe("editionInputSchema", () => {
  it("requires an existing-shaped UUID, name, and a positive physical volume count", () => {
    expect(editionInputSchema.safeParse({ mangaId: "not-a-uuid", name: "Edição 1" }).success).toBe(false);
    expect(editionInputSchema.safeParse({ mangaId: "550e8400-e29b-41d4-a716-446655440000", name: "Edição 1", physicalVolumeCount: 0 }).success).toBe(false);
    expect(editionInputSchema.safeParse({ mangaId: "550e8400-e29b-41d4-a716-446655440000", name: "Edição 1" }).success).toBe(true);
  });
});

describe("quotationInputSchema", () => {
  const valid = { editionId: "550e8400-e29b-41d4-a716-446655440000", price: 120, observedAt: "2026-05-01T12:00:00.000Z", listingUrl: "", conditionNotes: "", collectionComplete: true };
  it("accepts a positive price only when the collection is complete", () => {
    expect(quotationInputSchema.safeParse(valid).success).toBe(true);
    expect(quotationInputSchema.safeParse({ ...valid, collectionComplete: false }).success).toBe(false);
    expect(quotationInputSchema.safeParse({ ...valid, price: 0 }).success).toBe(false);
  });
  it("rejects unsafe listing URL protocols", () => {
    expect(quotationInputSchema.safeParse({ ...valid, listingUrl: "javascript:alert(1)" }).success).toBe(false);
  });
});

describe("offerInputSchema", () => {
  it("accepts a valid draft without claiming a discount", () => {
    expect(offerInputSchema.safeParse(validOffer).success).toBe(true);
  });
  it("requires evidence and a higher previous price for a confirmed discount", () => {
    expect(offerInputSchema.safeParse({ ...validOffer, previousPriceConfirmed: true, previousPrice: 40 }).success).toBe(false);
    expect(offerInputSchema.safeParse({ ...validOffer, previousPriceConfirmed: true, previousPrice: 40, previousPriceEvidence: "https://example.com/historico" }).success).toBe(true);
    expect(offerInputSchema.safeParse({ ...validOffer, previousPriceConfirmed: true, previousPrice: 20, previousPriceEvidence: "https://example.com/historico" }).success).toBe(false);
  });
  it("requires an HTTP product URL", () => {
    expect(offerInputSchema.safeParse({ ...validOffer, productUrl: "javascript:alert(1)" }).success).toBe(false);
  });
});
