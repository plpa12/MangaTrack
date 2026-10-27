import type { Offer, OfferView, PriceSummary, Quotation } from "./types";

export function summarizeQuotations(rows: Quotation[]): PriceSummary {
  const valid = rows.filter((row) => row.collectionComplete && Number.isSafeInteger(row.priceCents) && row.priceCents > 0);
  if (!valid.length) return { averageCents: null, goodPriceCents: null, greatPriceCents: null, observationCount: 0, latestObservedAt: null, limitedSample: true };
  // All currency calculations use integer cents / BigInt to avoid binary floating-point drift.
  const sum = valid.reduce((total, row) => total + BigInt(row.priceCents), 0n);
  const count = BigInt(valid.length);
  const averageCents = Number((sum + count / 2n) / count);
  const latestObservedAt = valid.reduce<string | null>((latest, row) => !latest || row.observedAt > latest ? row.observedAt : latest, null);
  return {
    averageCents,
    goodPriceCents: Number((BigInt(averageCents) * 9n) / 10n),
    greatPriceCents: Number((BigInt(averageCents) * 8n) / 10n),
    observationCount: valid.length,
    latestObservedAt,
    limitedSample: valid.length < 5
  };
}

export function calculateDiscountPercent(offer: Pick<Offer, "promotionalPriceCents" | "previousPriceCents" | "previousPriceConfirmed" | "previousPriceEvidence">): number | null {
  if (!offer.previousPriceConfirmed || !offer.previousPriceEvidence?.trim() || !offer.previousPriceCents || offer.previousPriceCents <= offer.promotionalPriceCents || offer.promotionalPriceCents <= 0) return null;
  return Math.round(((offer.previousPriceCents - offer.promotionalPriceCents) / offer.previousPriceCents) * 10000) / 100;
}
export function isPublicOffer(offer: Offer, now = new Date()): boolean {
  return offer.status === "published" && (!offer.expiresAt || new Date(offer.expiresAt).getTime() > now.getTime());
}
export function sortPublicOffers(offers: Offer[], now = new Date()): OfferView[] {
  return offers.filter((offer) => isPublicOffer(offer, now)).map((offer) => ({ ...offer, discountPercent: calculateDiscountPercent(offer) }))
    .sort((a, b) => (b.discountPercent ?? -1) - (a.discountPercent ?? -1) || b.verifiedAt.localeCompare(a.verifiedAt));
}
export function formatBRL(cents: number | null): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}