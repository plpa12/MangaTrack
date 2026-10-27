-- Public catalog data is intentionally public: expose eligible collection prices,
-- but never expose seller links or private notes through this RPC.
create or replace function public.get_public_quotation_values()
returns table (
  edition_id uuid,
  price numeric,
  observed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    q.edition_id,
    q.price,
    q.observed_at
  from public.quotations as q
  join public.editions as e
    on e.id = q.edition_id
   and not e.archived
  join public.manga as m
    on m.id = e.manga_id
   and not m.archived
  where q.collection_complete
    and not q.archived
  order by q.observed_at desc;
$$;

revoke all on function public.get_public_quotation_values() from public;
grant execute on function public.get_public_quotation_values() to anon, authenticated;
