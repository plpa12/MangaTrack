-- Expose quotation history only as daily aggregates, never individual listings.
-- Require at least three observations per edition/day to reduce the risk of exposing
-- an individual seller's price through a one-row average.
create or replace function public.get_public_quotation_trends()
returns table (
  edition_id uuid,
  observed_day date,
  average_price numeric,
  observation_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    q.edition_id,
    (q.observed_at at time zone 'UTC')::date as observed_day,
    round(avg(q.price), 2) as average_price,
    count(*) as observation_count
  from public.quotations as q
  join public.editions as e
    on e.id = q.edition_id
   and not e.archived
  join public.manga as m
    on m.id = e.manga_id
   and not m.archived
  where q.collection_complete
    and not q.archived
  group by q.edition_id, (q.observed_at at time zone 'UTC')::date
  having count(*) >= 3
  order by q.edition_id, observed_day;
$$;

revoke all on function public.get_public_quotation_trends() from public;
grant execute on function public.get_public_quotation_trends() to anon, authenticated;
