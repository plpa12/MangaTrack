import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SMOKE_TEST_EMAIL",
  "SUPABASE_SMOKE_TEST_PASSWORD"
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Supabase smoke test not run. Missing environment variables: ${missing.join(", ")}`);
  console.error("Set them in your local shell only; do not commit them or paste passwords into chat.");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

let testMangaId = null;
let failed = false;
const errorText = (error) => error instanceof Error ? error.message : String(error);

try {
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: process.env.SUPABASE_SMOKE_TEST_EMAIL,
    password: process.env.SUPABASE_SMOKE_TEST_PASSWORD
  });
  if (signInError || !signInData.user) throw new Error(`Admin sign-in failed: ${signInError?.message ?? "Supabase returned no user."}`);
  if (signInData.user.app_metadata?.mangatrack_admin !== true) {
    await supabase.auth.signOut();
    throw new Error("The signed-in account does not have app_metadata.mangatrack_admin=true.");
  }
  console.log("PASS: Supabase Auth accepted an authorized MangaTrack administrator.");

  const [mangaRead, editionRead, offerRead, trendsRead] = await Promise.all([
    supabase.from("manga").select("id").limit(1),
    supabase.from("editions").select("id").limit(1),
    supabase.from("offers").select("id").limit(1),
    supabase.rpc("get_public_quotation_trends")
  ]);
  for (const [label, result] of [
    ["manga read", mangaRead],
    ["edition read", editionRead],
    ["offer read", offerRead],
    ["public quotation trends RPC", trendsRead]
  ]) {
    if (result.error) throw new Error(`Supabase ${label} failed: ${result.error.message}`);
    console.log(`PASS: ${label} query completed.`);
  }

  const unique = randomUUID();
  const title = `__MANGATRACK_SMOKE_TEST__ ${unique}`;
  const author = "Temporary integration test";
  const { data: inserted, error: insertError } = await supabase
    .from("manga")
    .insert({ title, author, publication_status: "unknown" })
    .select("id,title,author")
    .single();
  if (insertError || !inserted) throw new Error(`Test insert failed: ${insertError?.message ?? "no row returned"}`);
  testMangaId = inserted.id;
  console.log("PASS: test manga inserted.");

  const { data: fetched, error: fetchError } = await supabase
    .from("manga")
    .select("id,title,author")
    .eq("id", testMangaId)
    .single();
  if (fetchError || !fetched) throw new Error(`Read-after-write failed: ${fetchError?.message ?? "no row returned"}`);
  if (fetched.title !== title || fetched.author !== author || fetched.id !== testMangaId) {
    throw new Error("Read-after-write returned data that did not match the inserted test record.");
  }
  console.log("PASS: inserted manga was read back with matching fields.");
} catch (error) {
  failed = true;
  console.error(`FAIL: ${errorText(error)}`);
} finally {
  if (testMangaId) {
    const { data: deleted, error: deleteError } = await supabase
      .from("manga")
      .delete()
      .eq("id", testMangaId)
      .select("id")
      .single();
    if (deleteError || deleted?.id !== testMangaId) {
      failed = true;
      console.error(`CLEANUP FAILED: temporary test record ${testMangaId} may remain. Remove only this exact test record from the admin panel.`);
    } else {
      console.log("PASS: temporary test manga was deleted.");
    }
  }
  await supabase.auth.signOut().catch(() => {});
}

if (failed) process.exitCode = 1;
else console.log("SUCCESS: authenticated Supabase read/write/read/cleanup smoke test completed.");
