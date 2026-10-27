import { localData } from "@/lib/data/local";
import OffersClient from "./offers-client";

export default function OffersPage() {
  return <OffersClient initialOffers={localData.listOffers()} />;
}