"use server";
import { revalidatePath } from "next/cache";
import { localData } from "@/lib/data/local";
import { editionInputSchema, mangaInputSchema, offerInputSchema, quotationInputSchema } from "@/lib/validation";

export type MangaActionState = { message: string; success: boolean };
const localOnly = () => process.env.MANGATRACK_DATA_MODE === "supabase" && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const refreshDataPages = () => {
  for (const path of ["/", "/mangas", "/quotations", "/offers", "/admin"]) revalidatePath(path);
};
const failure = (error: unknown): MangaActionState => ({ success: false, message: error instanceof Error ? error.message : "Confira os campos informados e tente novamente." });

export async function createMangaAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: "A gravação pelo Supabase ainda não foi ativada. Nenhum dado foi salvo." };
  const parsed = mangaInputSchema.safeParse({
    title: formData.get("title"), author: formData.get("author"), coverUrl: formData.get("coverUrl") || "",
    alternativeTitles: String(formData.get("alternativeTitles") || "").split("\n").map((value) => value.trim()).filter(Boolean),
    synopsis: formData.get("synopsis") || null
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Confira os campos informados." };
  try { localData.createManga(parsed.data); refreshDataPages(); return { success: true, message: "Obra criada apenas na memória deste processo. Ela não foi salva permanentemente." }; }
  catch (error) { return failure(error); }
}

export async function createEditionAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: "A gravação pelo Supabase ainda não foi ativada." };
  const parsed = editionInputSchema.safeParse({
    mangaId: formData.get("mangaId"), name: formData.get("name"), publisher: formData.get("publisher") || null,
    format: formData.get("format") || null, isbn: formData.get("isbn") || null,
    physicalVolumeCount: formData.get("physicalVolumeCount") ? Number(formData.get("physicalVolumeCount")) : null,
    notes: formData.get("notes") || null
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Confira os campos da edição." };
  try { localData.createEdition(parsed.data); refreshDataPages(); return { success: true, message: "Edição criada temporariamente neste processo." }; }
  catch (error) { return failure(error); }
}

export async function createQuotationAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: "A gravação pelo Supabase ainda não foi ativada." };
  const parsed = quotationInputSchema.safeParse({
    editionId: formData.get("editionId"), price: Number(formData.get("price")),
    observedAt: new Date(String(formData.get("observedAt") || "")).toISOString(),
    listingUrl: formData.get("listingUrl") || "", conditionNotes: formData.get("conditionNotes") || null,
    collectionComplete: formData.get("collectionComplete") === "on"
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Informe uma cotação válida." };
  try { localData.createQuotation(parsed.data); refreshDataPages(); return { success: true, message: "Cotação registrada temporariamente. Ela se refere a uma coleção completa." }; }
  catch (error) { return failure(error); }
}

export async function createOfferAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: "A gravação pelo Supabase ainda não foi ativada." };
  const toDate = (value: FormDataEntryValue | null) => value ? new Date(String(value)).toISOString() : null;
  let verifiedAt: string;
  let expiresAt: string | null;
  try { verifiedAt = toDate(formData.get("verifiedAt")) ?? new Date().toISOString(); expiresAt = toDate(formData.get("expiresAt")); }
  catch { return { success: false, message: "Confira as datas informadas." }; }
  const rawMangaId = String(formData.get("mangaId") || "");
  const rawEditionId = String(formData.get("editionId") || "");
  const rawPreviousPrice = String(formData.get("previousPrice") || "");
  const parsed = offerInputSchema.safeParse({
    title: formData.get("title"), mangaId: rawMangaId || null, editionId: rawEditionId || null,
    productType: formData.get("productType"), store: formData.get("store"),
    promotionalPrice: Number(formData.get("promotionalPrice")),
    previousPrice: rawPreviousPrice ? Number(rawPreviousPrice) : null,
    previousPriceConfirmed: formData.get("previousPriceConfirmed") === "on",
    previousPriceEvidence: formData.get("previousPriceEvidence") || "",
    productUrl: formData.get("productUrl"), affiliateUrl: formData.get("affiliateUrl") || "",
    imageUrl: formData.get("imageUrl") || "", verifiedAt, expiresAt,
    status: formData.get("status") || "draft"
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Confira os dados da oferta." };
  try { localData.createOffer(parsed.data); refreshDataPages(); return { success: true, message: "Oferta criada temporariamente. Só ofertas publicadas e válidas aparecem ao público." }; }
  catch (error) { return failure(error); }
}
