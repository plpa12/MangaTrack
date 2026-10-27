-- Cover foreign-key lookups used when filtering offers by work or edition.
create index if not exists offers_edition_id_idx
  on public.offers (edition_id)
  where edition_id is not null;

create index if not exists offers_manga_id_idx
  on public.offers (manga_id)
  where manga_id is not null;
