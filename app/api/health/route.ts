import { NextResponse } from "next/server";
import { dataMode, dataRepository } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (dataMode !== "supabase") {
    return NextResponse.json(
      { status: "not_connected", message: "Supabase mode is not active." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const results = await Promise.allSettled([
    dataRepository.listManga(),
    dataRepository.listEditions(),
    dataRepository.listOffers(),
    dataRepository.listPublicQuotationTrends()
  ]);
  const supabase = await createSupabaseServerClient();
  let offerEvidenceProtected = false;
  if (supabase) {
    const evidenceProbe = await supabase.from("offers").select("previous_price_evidence").limit(1);
    // SQLSTATE 42501 confirms that the public-facing role cannot select the internal evidence column.
    offerEvidenceProtected = evidenceProbe.error?.code === "42501";
  }
  const checks = {
    mangaRead: results[0].status === "fulfilled",
    editionRead: results[1].status === "fulfilled",
    offerRead: results[2].status === "fulfilled",
    quotationTrendsRpc: results[3].status === "fulfilled",
    offerEvidenceProtected
  };
  const healthy = Object.values(checks).every(Boolean);

  if (!healthy) {
    // Keep database errors and configuration details out of the public response.
    console.error("[health] One or more Supabase read checks failed.");
  }

  return NextResponse.json(
    { status: healthy ? "ok" : "error", checks },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" }
    }
  );
}
