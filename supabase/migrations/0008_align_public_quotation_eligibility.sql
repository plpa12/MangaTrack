-- Align the checked-in migration history with the live quotation aggregation fix.
-- Only eligible, public prices are included; seller links and private notes remain private.
-- A single eligible quotation is sufficient for the overall mean and a one-point trend.
create or replace function public.get_public_quotation_trends()
returns table (edition_id uuid, observed_day date, average_price numeric, observation_count bigint)
language sql stable security definer set search_path = ''
as $$
  select q.edition_id,
         (q.observed_at at time zone 'UTC')::date as observed_day,
         round(avg(q.price), 2) as average_price,
         count(*) as observation_count
  from public.quotations q
  join public.editions e on e.id = q.edition_id and not e.archived
  join public.manga m on m.id = e.manga_id and not m.archived
  where q.collection_complete and not q.archived and q.price > 0
  group by q.edition_id, (q.observed_at at time zone 'UTC')::date
  order by q.edition_id, (q.observed_at at time zone 'UTC')::date;
$$;
revoke all on function public.get_public_quotation_trends() from public;
grant execute on function public.get_public_quotation_trends() to anon, authenticated;

create or replace function public.get_public_quotation_observation_counts()
returns table (edition_id uuid, observation_count bigint)
language sql stable security definer set search_path = ''
as $$
  select e.id, count(q.id)
  from public.editions e
  join public.manga m on m.id = e.manga_id and not m.archived
  left join public.quotations q
    on q.edition_id = e.id
   and q.collection_complete
   and not q.archived
   and q.price > 0
  where not e.archived
  group by e.id
  order by e.id;
$$;
revoke all on function public.get_public_quotation_observation_counts() from public;
grant execute on function public.get_public_quotation_observation_counts() to anon, authenticated;

create or replace function public.get_public_quotation_values()
returns table (edition_id uuid, price numeric, observed_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select q.edition_id, q.price, q.observed_at
  from public.quotations q
  join public.editions e on e.id = q.edition_id and not e.archived
  join public.manga m on m.id = e.manga_id and not m.archived
  where q.collection_complete and not q.archived and q.price > 0
  order by q.observed_at desc;
$$;
revoke all on function public.get_public_quotation_values() from public;
grant execute on function public.get_public_quotation_values() to anon, authenticated;
