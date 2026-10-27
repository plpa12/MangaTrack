-- Public quotation access must go through the narrowly scoped RPCs only.
-- RLS already has no public SELECT policy for quotations; remove the table grant too
-- so anonymous clients cannot even issue direct reads against private quotation columns.
revoke select on table public.quotations from anon;
