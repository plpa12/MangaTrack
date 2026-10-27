import type { PriceSummary, PublicQuotationCount, PublicQuotationTrend, PublicQuotationValue } from "./types";
function eligible(values: PublicQuotationValue[]): PublicQuotationValue[] {
  return values.filter(v => Number.isSafeInteger(v.priceCents) && v.priceCents > 0 && /^\d{4}-\d{2}-\d{2}T/.test(v.observedAt) && Number.isFinite(Date.parse(v.observedAt)));
}
export function buildPublicQuotationTrends(values: PublicQuotationValue[]): PublicQuotationTrend[] {
  const buckets = new Map<string, { editionId: string; observedDay: string; totalCents: bigint; count: number }>();
  for (const v of eligible(values)) {
    const observedDay = v.observedAt.slice(0, 10), key = `${v.editionId}:${observedDay}`;
    const b = buckets.get(key) ?? { editionId: v.editionId, observedDay, totalCents: 0n, count: 0 };
    b.totalCents += BigInt(v.priceCents); b.count++; buckets.set(key, b);
  }
  return [...buckets.values()].map(({editionId, observedDay, totalCents, count}) => ({
    editionId, observedDay, averagePriceCents: Number((totalCents + BigInt(count) / 2n) / BigInt(count)), observationCount: count
  })).sort((a,b) => a.editionId.localeCompare(b.editionId) || a.observedDay.localeCompare(b.observedDay));
}
export function countPublicQuotationValues(values: PublicQuotationValue[]): PublicQuotationCount[] {
  const counts = new Map<string, number>();
  for (const v of eligible(values)) counts.set(v.editionId, (counts.get(v.editionId) ?? 0) + 1);
  return [...counts].map(([editionId, observationCount]) => ({editionId, observationCount}));
}
export function summarizePublicQuotationValues(values: PublicQuotationValue[], editionId: string): PriceSummary {
  const rows = eligible(values).filter(v => v.editionId === editionId);
  if (!rows.length) return {averageCents:null, goodPriceCents:null, greatPriceCents:null, observationCount:0, latestObservedAt:null, limitedSample:true};
  const sum = rows.reduce((total,v) => total + BigInt(v.priceCents), 0n), count = BigInt(rows.length);
  const averageCents = Number((sum + count / 2n) / count);
  const latestObservedAt = rows.reduce<string|null>((latest,v) => !latest || v.observedAt > latest ? v.observedAt : latest, null);
  return {averageCents, goodPriceCents:Number((BigInt(averageCents)*9n)/10n), greatPriceCents:Number((BigInt(averageCents)*8n)/10n), observationCount:rows.length, latestObservedAt, limitedSample:rows.length<5};
}
