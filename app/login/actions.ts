"use server";
import { redirect } from "next/navigation";
import { signInAdmin, signOutAdmin } from "@/lib/supabase/admin";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/login?error=missing");
  try {
    await signInAdmin(email, password);
  } catch (error) {
    const message = error instanceof Error && error.message.includes("não está configurado")
      ? "not-configured"
      : error instanceof Error && error.message.includes("não tem autorização")
        ? "not-admin" : "invalid";
    redirect(`/login?error=${message}`);
  }
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await signOutAdmin();
  redirect("/login?message=signed-out");
}
