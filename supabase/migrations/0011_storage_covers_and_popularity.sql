-- Provision a public, read-only cover bucket with tightly scoped administrator writes.
-- The bucket is public so catalog images can be rendered without exposing database rows.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mangatrack-covers',
  'mangatrack-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads MangaTrack covers" on storage.objects;
create policy "Public reads MangaTrack covers"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'mangatrack-covers');

drop policy if exists "Admins upload MangaTrack covers" on storage.objects;
create policy "Admins upload MangaTrack covers"
on storage.objects for insert
to authenticated
with check (bucket_id = 'mangatrack-covers' and public.is_mangatrack_admin());

drop policy if exists "Admins update MangaTrack covers" on storage.objects;
create policy "Admins update MangaTrack covers"
on storage.objects for update
to authenticated
using (bucket_id = 'mangatrack-covers' and public.is_mangatrack_admin())
with check (bucket_id = 'mangatrack-covers' and public.is_mangatrack_admin());

drop policy if exists "Admins delete MangaTrack covers" on storage.objects;
create policy "Admins delete MangaTrack covers"
on storage.objects for delete
to authenticated
using (bucket_id = 'mangatrack-covers' and public.is_mangatrack_admin());

-- Atomic public popularity counter: only active catalog records may be counted.
create or replace function public.increment_manga_search_count(p_manga_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.manga_search_stats (manga_id, selection_count, updated_at)
  select m.id, 1, now()
  from public.manga as m
  where m.id = p_manga_id and not m.archived
  on conflict (manga_id) do update
    set selection_count = public.manga_search_stats.selection_count + 1,
        updated_at = now();
end;
$$;

revoke all on function public.increment_manga_search_count(uuid) from public;
grant execute on function public.increment_manga_search_count(uuid) to anon, authenticated;

-- Expose only ranked active works and their aggregate counts, never private catalog fields.
create or replace function public.get_public_popular_manga(p_limit integer default 10)
returns table (manga_id uuid, selection_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select m.id, coalesce(s.selection_count, 0)::bigint
  from public.manga as m
  left join public.manga_search_stats as s on s.manga_id = m.id
  where not m.archived
  order by coalesce(s.selection_count, 0) desc, m.title asc
  limit greatest(1, least(coalesce(p_limit, 10), 20));
$$;

revoke all on function public.get_public_popular_manga(integer) from public;
grant execute on function public.get_public_popular_manga(integer) to anon, authenticated;
