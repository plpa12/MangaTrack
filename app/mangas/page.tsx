import { localData } from "@/lib/data/local";
import MangaCatalogClient from "./catalog-client";

export default function MangasPage() {
  return <MangaCatalogClient initialMangas={localData.listManga()} />;
}