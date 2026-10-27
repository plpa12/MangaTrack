import { localData } from "@/lib/data/local";
import { sortPublicOffers } from "@/lib/money";
import OffersClient from "./offers-client";

// Never serialize drafts, internal price evidence, or private notes to the public client.
export default function OffersPage() {
  const publicOffers = sortPublicOffers(localData.listOffers()).map(({ previousPriceEvidence: _evidence, ...offer }) => offer);
  return <OffersClient initialOffers={publicOffers} />;
}
