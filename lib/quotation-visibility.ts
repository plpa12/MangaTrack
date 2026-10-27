export type QuotationAvailability = "none" | "insufficient" | "available";

/**
 * Distinguishes no eligible records from records that cannot yet be safely
 * represented by a public price aggregate.
 */
export function getQuotationAvailability(
  observationCount: number,
  hasPublicAggregate: boolean
): QuotationAvailability {
  if (observationCount <= 0) return "none";
  if (!hasPublicAggregate) return "insufficient";
  return "available";
}
