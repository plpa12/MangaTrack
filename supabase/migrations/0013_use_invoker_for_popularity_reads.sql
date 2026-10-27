-- This RPC only reads tables that already have narrow public RLS policies,
-- so it does not need SECURITY DEFINER privileges.
create or replace function public.get_public_popular_manga(p_limit integer default 10)
returns table (manga_id uuid, selection_count bigint)
language sql
stable
security invoker
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
