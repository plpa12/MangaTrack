import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dataMode } from "@/lib/data";

export const dynamic = "force-dynamic";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: "Invalid manga identifier." }, { status: 400 });
  if (dataMode !== "supabase") return new NextResponse(null, { status: 204 });

  const cookieStore = await cookies();
  const cookieName = `mt_view_${id.replaceAll("-", "")}`;
  if (cookieStore.get(cookieName)) return new NextResponse(null, { status: 204 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Popularity tracking unavailable." }, { status: 503 });
  const { error } = await supabase.rpc("increment_manga_search_count", { p_manga_id: id });
  if (error) {
    console.error("[manga-view] Popularity update failed.", { code: error.code });
    return NextResponse.json({ error: "Popularity tracking unavailable." }, { status: 503 });
  }

  cookieStore.set(cookieName, "1", {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 60 * 60 * 24
  });
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
