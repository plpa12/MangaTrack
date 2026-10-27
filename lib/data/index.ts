import { localData } from "./local";

export const dataMode = process.env.MANGATRACK_DATA_MODE === "supabase" &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ? "supabase-configured" : "local-empty";

export { localData };
export function getDataModeLabel(): string {
  return dataMode === "local-empty" ? "Modo local — dados temporários não persistentes" : "Supabase configurado — validar conexão antes de usar";
}