-- Public clients must not be able to inflate popularity counts by calling the RPC directly.
-- The Next.js server uses its server-only service-role client for this one operation.
revoke all on function public.increment_manga_search_count(uuid) from public, anon, authenticated;
grant execute on function public.increment_manga_search_count(uuid) to service_role;
