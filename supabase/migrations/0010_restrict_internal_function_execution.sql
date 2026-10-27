-- Restrict helper functions that are not intended as public RPC endpoints.
-- RLS policies still call is_mangatrack_admin() for authenticated requests.
REVOKE EXECUTE ON FUNCTION public.is_mangatrack_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_mangatrack_admin() TO authenticated, service_role;

-- This function is invoked by the database event trigger, not by API clients.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated, service_role;
