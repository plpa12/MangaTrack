export type QuotationAvailability = "none" | "insufficient" | "available";

/**
 * Distinguishes no eligible records from records with a public aggregate.
 * One eligible quotation is sufficient for a mean and a one-point chart;
 * small samples are labeled separately instead of being hidden.
 */
export function getQuotationAvailability(
  observationCount: number,
  hasPublicAggregate: boolean
): QuotationAvailability {
  if (observationCount <= 0) return "none";
  if (!hasPublicAggregate) return "insufficient";
  return "available";
}
