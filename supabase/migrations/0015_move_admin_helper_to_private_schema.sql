-- Keep the admin predicate out of the exposed PostgREST schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_mangatrack_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as u
    where u.id = (select auth.uid())
      and coalesce(u.raw_app_meta_data ->> 'mangatrack_admin', 'false') = 'true'
  );
$$;
revoke all on function private.is_mangatrack_admin() from public, anon;
grant execute on function private.is_mangatrack_admin() to authenticated, service_role;

drop policy if exists "admins manage manga" on public.manga;
create policy "admins manage manga" on public.manga for all to authenticated
using (private.is_mangatrack_admin()) with check (private.is_mangatrack_admin());

drop policy if exists "admins manage editions" on public.editions;
create policy "admins manage editions" on public.editions for all to authenticated
using (private.is_mangatrack_admin()) with check (private.is_mangatrack_admin());

drop policy if exists "admins read quotations" on public.quotations;
create policy "admins read quotations" on public.quotations for select to authenticated
using (private.is_mangatrack_admin());

drop policy if exists "admins manage quotations" on public.quotations;
create policy "admins manage quotations" on public.quotations for all to authenticated
using (private.is_mangatrack_admin()) with check (private.is_mangatrack_admin());

drop policy if exists "admins manage offers" on public.offers;
create policy "admins manage offers" on public.offers for all to authenticated
using (private.is_mangatrack_admin()) with check (private.is_mangatrack_admin());

drop policy if exists "admins manage manga search stats" on public.manga_search_stats;
create policy "admins manage manga search stats" on public.manga_search_stats for all to authenticated
using (private.is_mangatrack_admin()) with check (private.is_mangatrack_admin());

drop policy if exists "Admins upload MangaTrack covers" on storage.objects;
create policy "Admins upload MangaTrack covers" on storage.objects for insert to authenticated
with check (bucket_id = 'mangatrack-covers' and private.is_mangatrack_admin());

drop policy if exists "Admins update MangaTrack covers" on storage.objects;
create policy "Admins update MangaTrack covers" on storage.objects for update to authenticated
using (bucket_id = 'mangatrack-covers' and private.is_mangatrack_admin())
with check (bucket_id = 'mangatrack-covers' and private.is_mangatrack_admin());

drop policy if exists "Admins delete MangaTrack covers" on storage.objects;
create policy "Admins delete MangaTrack covers" on storage.objects for delete to authenticated
using (bucket_id = 'mangatrack-covers' and private.is_mangatrack_admin());

-- The old helper remains for migration compatibility but is no longer callable via the public API.
revoke all on function public.is_mangatrack_admin() from public, anon, authenticated;
grant execute on function public.is_mangatrack_admin() to service_role;
