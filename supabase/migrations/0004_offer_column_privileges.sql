-- Prevent direct PostgREST reads from exposing the internal evidence URL for an offer's previous price.
-- Public and authenticated clients may read the public-facing offer fields only.
-- RLS policies still decide which rows each role may see.
revoke select on table public.offers from public, anon, authenticated;

grant select (
  id,
  title,
  manga_id,
  edition_id,
  product_type,
  store,
  promotional_price,
  previous_price,
  previous_price_confirmed,
  product_url,
  affiliate_url,
  image_url,
  verified_at,
  expires_at,
  status,
  created_at,
  updated_at
) on table public.offers to anon, authenticated;
