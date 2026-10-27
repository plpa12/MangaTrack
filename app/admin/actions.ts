"use server";
import { revalidatePath } from "next/cache";
import { localData } from "@/lib/data/local";
import { mangaInputSchema } from "@/lib/validation";

export type MangaActionState = { message: string; success: boolean };

export async function createMangaAction(_previous: MangaActionState, formData: FormData): Promise<MangaActionState> {
  if (process.env.MANGATRACK_DATA_MODE === "supabase" && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: false, message: "A gravação pelo Supabase ainda não foi ativada. Nenhum dado foi salvo." };
  }
  const parsed = mangaInputSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    coverUrl: formData.get("coverUrl") || "",
    alternativeTitles: String(formData.get("alternativeTitles") || "").split("\n").map((value) => value.trim()).filter(Boolean),
    synopsis: formData.get("synopsis") || null
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Confira os campos informados." };
  try {
    localData.createManga(parsed.data);
    revalidatePath("/");
    revalidatePath("/mangas");
    revalidatePath("/admin");
    return { success: true, message: "Obra criada somente na memória deste processo de desenvolvimento. Ela não foi salva permanentemente." };
  } catch {
    return { success: false, message: "Não foi possível criar a obra. Tente novamente." };
  }
}