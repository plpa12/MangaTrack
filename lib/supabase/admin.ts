import "server-only";
import { createSupabaseServerClient } from "./server";

/** Authorization is based on trusted app_metadata set by a project administrator, never user_metadata. */
export async function isSupabaseAdmin(): Promise<boolean> {
  const client = await createSupabaseServerClient();
  if (!client) return false;
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return false;
  return data.user.app_metadata?.mangatrack_admin === true;
}

export async function signInAdmin(email: string, password: string) {
  const client = await createSupabaseServerClient();
  if (!client) throw new Error("O Supabase ainda não está configurado.");
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error("E-mail ou senha inválidos.");
  if (data.user.app_metadata?.mangatrack_admin !== true) {
    await client.auth.signOut();
    throw new Error("Esta conta não tem autorização administrativa.");
  }
}

export async function signOutAdmin() {
  const client = await createSupabaseServerClient();
  if (client) await client.auth.signOut();
}
