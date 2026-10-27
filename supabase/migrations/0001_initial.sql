-- MangaTrack initial schema. Apply with Supabase CLI after reviewing README.
create extension if not exists pgcrypto;

create table if not exists public.manga (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 180),
  author text not null check (length(trim(author)) between 1 and 180),
  cover_path text,
  alternative_titles text[] not null default '{}',
  synopsis text,
  chapter_count integer check (chapter_count is null or chapter_count >= 0),
  original_volume_count integer check (original_volume_count is null or original_volume_count >= 0),
  publication_status text not null default 'unknown' check (publication_status in ('ongoing','completed','hiatus','unknown')),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists manga_title_search_idx on public.manga using gin (to_tsvector('simple', title));
create index if not exists manga_active_idx on public.manga (archived, title);

create table if not exists public.editions (
  id uuid primary key default gen_random_uuid(),
  manga_id uuid not null references public.manga(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 180),
  publisher text,
  format text,
  isbn text,
  physical_volume_count integer check (physical_volume_count is null or physical_volume_count >= 1),
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manga_id, name)
);
create index if not exists editions_manga_idx on public.editions (manga_id, archived);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.editions(id) on delete restrict,
  price numeric(12,2) not null check (price > 0),
  observed_at timestamptz not null default now(),
  listing_url text,
  condition_notes text,
  collection_complete boolean not null default false check (collection_complete),
  created_at timestamptz not null default now(),
  constraint quotation_url_length check (listing_url is null or length(listing_url) <= 2048)
);
create index if not exists quotations_edition_date_idx on public.quotations (edition_id, observed_at desc);
create index if not exists quotations_listing_url_idx on public.quotations (edition_id, listing_url) where listing_url is not null;

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 220),
  manga_id uuid references public.manga(id) on delete set null,
  edition_id uuid references public.editions(id) on delete set null,
  product_type text not null check (product_type in ('volume','box_set','special_edition','omnibus','other')),
  store text not null check (length(trim(store)) between 1 and 120),
  promotional_price numeric(12,2) not null check (promotional_price > 0),
  previous_price numeric(12,2) check (previous_price is null or previous_price > 0),
  previous_price_confirmed boolean not null default false,
  previous_price_evidence text,
  product_url text not null,
  affiliate_url text,
  image_url text,
  verified_at timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published','disabled','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offer_previous_price_evidence check (not previous_price_confirmed or (previous_price is not null and previous_price > promotional_price and length(trim(coalesce(previous_price_evidence,''))) > 0))
);
create index if not exists offers_public_idx on public.offers (status, verified_at desc);
create index if not exists offers_expiry_idx on public.offers (expires_at);
create index if not exists offers_store_idx on public.offers (store);
create index if not exists offers_type_price_idx on public.offers (product_type, promotional_price);

create table if not exists public.manga_search_stats (
  manga_id uuid primary key references public.manga(id) on delete cascade,
  selection_count bigint not null default 0 check (selection_count >= 0),
  updated_at timestamptz not null default now()
);

create or replace function public.is_mangatrack_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u
    where u.id = (select auth.uid())
      and coalesce(u.raw_app_meta_data ->> 'mangatrack_admin', 'false') = 'true'
  );
$$;

alter table public.manga enable row level security;
alter table public.editions enable row level security;
alter table public.quotations enable row level security;
alter table public.offers enable row level security;
alter table public.manga_search_stats enable row level security;

create policy "public reads active manga" on public.manga for select using (not archived);
create policy "admins manage manga" on public.manga for all to authenticated using (public.is_mangatrack_admin()) with check (public.is_mangatrack_admin());
create policy "public reads active editions" on public.editions for select using (not archived and exists(select 1 from public.manga m where m.id = manga_id and not m.archived));
create policy "admins manage editions" on public.editions for all to authenticated using (public.is_mangatrack_admin()) with check (public.is_mangatrack_admin());
-- Public quotations are intentionally not exposed as individual rows. Provide only a future aggregate RPC/view.
create policy "admins read quotations" on public.quotations for select to authenticated using (public.is_mangatrack_admin());
create policy "admins manage quotations" on public.quotations for all to authenticated using (public.is_mangatrack_admin()) with check (public.is_mangatrack_admin());
create policy "public reads current published offers" on public.offers for select using (status = 'published' and (expires_at is null or expires_at > now()));
create policy "admins manage offers" on public.offers for all to authenticated using (public.is_mangatrack_admin()) with check (public.is_mangatrack_admin());
-- Stats are readable only as aggregates for public-facing popular works; writes are server-only.
create policy "public reads manga search stats" on public.manga_search_stats for select using (exists(select 1 from public.manga m where m.id = manga_id and not m.archived));
create policy "admins manage manga search stats" on public.manga_search_stats for all to authenticated using (public.is_mangatrack_admin()) with check (public.is_mangatrack_admin());

-- No seed data. Set app_metadata.mangatrack_admin=true only through a trusted server/admin process.
-- TODO before production: replace direct stats reads with a safe RPC increment function,
-- configure Storage bucket policies, and add an aggregate-only quotation summary RPC/view.
