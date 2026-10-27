import { localData } from "@/lib/data/local";
import OffersClient from "./offers-client";

// Keep data access in this Server Component; interactive filters live in OffersClient.
export default function OffersPage() {
  return <OffersClient initialOffers={localData.listOffers()} />;
}
