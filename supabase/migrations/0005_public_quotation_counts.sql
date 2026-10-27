-- Expose only the total count of eligible quotations per active edition.
-- Do not return prices, dates, listing URLs, or seller notes. Price trends remain
-- available only as daily aggregates with at least three observations (migration 0003).
create or replace function public.get_public_quotation_observation_counts()
returns table (
  edition_id uuid,
  observation_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.id as edition_id,
    count(q.id) as observation_count
  from public.editions as e
  join public.manga as m
    on m.id = e.manga_id
   and not m.archived
  left join public.quotations as q
    on q.edition_id = e.id
   and q.collection_complete
   and not q.archived
  where not e.archived
  group by e.id
  order by e.id;
$$;

revoke all on function public.get_public_quotation_observation_counts() from public;
grant execute on function public.get_public_quotation_observation_counts() to anon, authenticated;
