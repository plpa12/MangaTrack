import { NextResponse } from "next/server";
import { dataMode, dataRepository } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
      dataRepository.listPublicQuotationTrends(),
      dataRepository.listPublicQuotationObservationCounts(),
      dataRepository.listPopularManga(1)
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
      quotationCountsRpc: results[4].status === "fulfilled",
      popularMangaRpc: results[5].status === "fulfilled",
      popularityTrackingConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      coverStorageAvailable: false,
      offerEvidenceProtected
    };
    let coverStorageAvailable = false;
    if (supabase) {
      const { error: storageError } = await supabase.storage.from("mangatrack-covers").list("", { limit: 1 });
      coverStorageAvailable = !storageError;
    }
    checks.coverStorageAvailable = coverStorageAvailable;
    const healthy = Object.values(checks).every(Boolean);

    if (!healthy) {
      // Keep database errors and configuration details out of the public response.
      console.error("[health] One or more Supabase read checks failed.", {
        checks,
        failures: results.flatMap((result, index) =>
          result.status === "rejected"
            ? [{ check: ["mangaRead", "editionRead", "offerRead", "quotationTrendsRpc", "quotationCountsRpc", "popularMangaRpc"][index], reason: result.reason }]
            : []
        )
      });
    }

    return NextResponse.json(
      { status: healthy ? "ok" : "error", checks },
      {
        status: healthy ? 200 : 503,
        headers: { "Cache-Control": "no-store" }
      }
    );
  } catch (error) {
    // Log details for the Vercel runtime logs, but never expose internal errors publicly.
    console.error("[health] Health endpoint threw an exception.", error);
    return NextResponse.json(
      { status: "error", message: "Health check could not complete. Check server logs." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
