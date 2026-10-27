import { NextResponse } from "next/server";
import { dataMode, dataRepository } from "@/lib/data";

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
  const checks = {
    mangaRead: results[0].status === "fulfilled",
    editionRead: results[1].status === "fulfilled",
    offerRead: results[2].status === "fulfilled",
    quotationTrendsRpc: results[3].status === "fulfilled"
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
