import { dataRepository } from "@/lib/data";
import MangaCatalogClient from "./catalog-client";

export default async function MangasPage() {
  return <MangaCatalogClient initialMangas={await dataRepository.listManga()} />;
}
