"use server";
import { revalidatePath } from "next/cache";
import { dataRepository } from "@/lib/data";
import { editionInputSchema, mangaInputSchema, offerInputSchema, quotationInputSchema } from "@/lib/validation";
import type { OfferStatus } from "@/lib/types";

export type MangaActionState = { message: string; success: boolean };
const localOnly = () => process.env.NODE_ENV === "production" || (process.env.MANGATRACK_DATA_MODE === "supabase" && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
const localOnlyMessage = () => process.env.NODE_ENV === "production"
  ? "Cadastros desativados em produção enquanto a autenticação e a persistência seguras não estiverem implementadas."
  : "A gravação pelo Supabase ainda não foi ativada. Nenhum dado foi salvo.";
const refreshDataPages = () => {
  for (const path of ["/", "/mangas", "/quotations", "/offers", "/admin"]) revalidatePath(path);
};
const failure = (error: unknown): MangaActionState => ({ success: false, message: error instanceof Error ? error.message : "Confira os campos informados e tente novamente." });

export async function createMangaAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: localOnlyMessage() };
  const parsed = mangaInputSchema.safeParse({
    title: formData.get("title"), author: formData.get("author"), coverUrl: formData.get("coverUrl") || "",
    alternativeTitles: String(formData.get("alternativeTitles") || "").split("\n").map((value) => value.trim()).filter(Boolean),
    synopsis: formData.get("synopsis") || null,
    chapterCount: formData.get("chapterCount") ? Number(formData.get("chapterCount")) : null,
    originalVolumeCount: formData.get("originalVolumeCount") ? Number(formData.get("originalVolumeCount")) : null,
    publicationStatus: formData.get("publicationStatus") || "unknown"
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Confira os campos informados." };
  try { await dataRepository.createManga(parsed.data); refreshDataPages(); return { success: true, message: "Obra criada apenas na memória deste processo. Ela não foi salva permanentemente." }; }
  catch (error) { return failure(error); }
}

export async function createEditionAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: localOnlyMessage() };
  const parsed = editionInputSchema.safeParse({
    mangaId: formData.get("mangaId"), name: formData.get("name"), publisher: formData.get("publisher") || null,
    format: formData.get("format") || null, isbn: formData.get("isbn") || null,
    physicalVolumeCount: formData.get("physicalVolumeCount") ? Number(formData.get("physicalVolumeCount")) : null,
    notes: formData.get("notes") || null
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Confira os campos da edição." };
  try { await dataRepository.createEdition(parsed.data); refreshDataPages(); return { success: true, message: "Edição criada temporariamente neste processo." }; }
  catch (error) { return failure(error); }
}

export async function createQuotationAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: "A gravação pelo Supabase ainda não foi ativada." };
  let observedAt: string;
  try {
    const rawDate = String(formData.get("observedAt") || "");
    if (!rawDate) throw new Error("missing date");
    observedAt = new Date(rawDate).toISOString();
  } catch {
    return { success: false, message: "Informe uma data e hora válidas para a cotação." };
  }
  const parsed = quotationInputSchema.safeParse({
    editionId: formData.get("editionId"), price: Number(formData.get("price")),
    observedAt, listingUrl: formData.get("listingUrl") || "",
    conditionNotes: formData.get("conditionNotes") || null,
    collectionComplete: formData.get("collectionComplete") === "on"
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Informe uma cotação válida." };
  try { await dataRepository.createQuotation(parsed.data); refreshDataPages(); return { success: true, message: "Cotação registrada temporariamente. Ela se refere a uma coleção completa." }; }
  catch (error) { return failure(error); }
}

export async function createOfferAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: localOnlyMessage() };
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
  try { await dataRepository.createOffer(parsed.data); refreshDataPages(); return { success: true, message: "Oferta criada temporariamente. Só ofertas publicadas e válidas aparecem ao público." }; }
  catch (error) { return failure(error); }
}


function mangaFormData(formData: FormData) {
  return {
    title: formData.get("title"), author: formData.get("author"), coverUrl: formData.get("coverUrl") || "",
    alternativeTitles: String(formData.get("alternativeTitles") || "").split("\n").map((value) => value.trim()).filter(Boolean),
    synopsis: formData.get("synopsis") || null,
    chapterCount: formData.get("chapterCount") ? Number(formData.get("chapterCount")) : null,
    originalVolumeCount: formData.get("originalVolumeCount") ? Number(formData.get("originalVolumeCount")) : null,
    publicationStatus: formData.get("publicationStatus") || "unknown"
  };
}

const validId = (value: FormDataEntryValue | null): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function updateMangaAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: localOnlyMessage() };
  const id = formData.get("id");
  if (!validId(id)) return { success: false, message: "Identificador da obra inválido." };
  const parsed = mangaInputSchema.safeParse(mangaFormData(formData));
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Confira os campos informados." };
  try {
    await dataRepository.updateManga(id, parsed.data);
    refreshDataPages();
    return { success: true, message: "Alterações aplicadas temporariamente; elas não foram salvas permanentemente." };
  } catch (error) { return failure(error); }
}

export async function archiveMangaAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: localOnlyMessage() };
  const id = formData.get("id");
  if (!validId(id)) return { success: false, message: "Identificador da obra inválido." };
  try {
    await dataRepository.archiveManga(id);
    refreshDataPages();
    return { success: true, message: "Obra arquivada temporariamente. Ela deixa de aparecer no catálogo." };
  } catch (error) { return failure(error); }
}


function editionFormData(formData: FormData) {
  return {
    mangaId: formData.get("mangaId"), name: formData.get("name"), publisher: formData.get("publisher") || null,
    format: formData.get("format") || null, isbn: formData.get("isbn") || null,
    physicalVolumeCount: formData.get("physicalVolumeCount") ? Number(formData.get("physicalVolumeCount")) : null,
    notes: formData.get("notes") || null
  };
}

export async function updateEditionAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: localOnlyMessage() };
  const id = formData.get("id");
  if (!validId(id)) return { success: false, message: "Identificador da edição inválido." };
  const parsed = editionInputSchema.safeParse(editionFormData(formData));
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Confira os campos da edição." };
  try {
    await dataRepository.updateEdition(id, parsed.data);
    refreshDataPages();
    return { success: true, message: "Edição atualizada temporariamente; as alterações não são permanentes." };
  } catch (error) { return failure(error); }
}

export async function archiveEditionAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: localOnlyMessage() };
  const id = formData.get("id");
  if (!validId(id)) return { success: false, message: "Identificador da edição inválido." };
  try {
    await dataRepository.archiveEdition(id);
    refreshDataPages();
    return { success: true, message: "Edição arquivada sem apagar o histórico de cotações." };
  } catch (error) { return failure(error); }
}


export async function updateOfferStatusAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: localOnlyMessage() };
  const id = formData.get("id");
  const status = formData.get("status");
  if (!validId(id)) return { success: false, message: "Identificador da oferta inválido." };
  if (typeof status !== "string" || !["draft", "published", "disabled", "expired"].includes(status)) {
    return { success: false, message: "Selecione um status válido para a oferta." };
  }
  try {
    await dataRepository.updateOfferStatus(id, status as OfferStatus);
    refreshDataPages();
    return { success: true, message: "Status da oferta atualizado temporariamente; a alteração não é permanente." };
  } catch (error) { return failure(error); }
}


export async function setQuotationArchivedAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (localOnly()) return { success: false, message: localOnlyMessage() };
  const id = formData.get("id");
  const archivedValue = formData.get("archived");
  if (!validId(id)) return { success: false, message: "Identificador da cotação inválido." };
  if (archivedValue !== "true" && archivedValue !== "false") return { success: false, message: "Ação de arquivamento inválida." };
  const archived = archivedValue === "true";
  try {
    await dataRepository.setQuotationArchived(id, archived);
    refreshDataPages();
    return { success: true, message: archived ? "Cotação arquivada. Ela deixa de influenciar médias públicas, mas permanece no histórico administrativo." : "Cotação restaurada e incluída novamente nos cálculos." };
  } catch (error) { return failure(error); }
}
