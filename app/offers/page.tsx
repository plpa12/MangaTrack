import { localData } from "@/lib/data/local";
import { sortPublicOffers } from "@/lib/money";
import OffersClient from "./offers-client";

// Keep data access in this Server Component and never serialize drafts to public clients.
export default function OffersPage() {
  return <OffersClient initialOffers={sortPublicOffers(localData.listOffers())} />;
}
