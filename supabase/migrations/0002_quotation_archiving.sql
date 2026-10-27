-- Preserve quotation records while allowing invalid or duplicate observations to be excluded from calculations.
alter table public.quotations
  add column if not exists archived boolean not null default false;

create index if not exists quotations_active_edition_date_idx
  on public.quotations (edition_id, observed_at desc)
  where not archived;
