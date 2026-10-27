import { dataRepository } from "@/lib/data";
import { sortPublicOffers } from "@/lib/money";
import OffersClient from "./offers-client";

// Never serialize drafts, internal price evidence, or private notes to the public client.
export default async function OffersPage() {
  const publicOffers = sortPublicOffers(await dataRepository.listOffers()).map(({ previousPriceEvidence: _evidence, ...offer }) => offer);
  return <OffersClient initialOffers={publicOffers} />;
}
