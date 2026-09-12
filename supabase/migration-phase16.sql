-- Phase 16 — search intent log (real guest date-search behaviour).
-- Run once in Supabase SQL Editor (after migration-phase15.sql).
--
-- Every "Book Now" search on the homepage / /rooms search bar now writes a row
-- here (server-side, service role) alongside the browser Pixel + server CAPI
-- "Search" fire, so real search behaviour is both visible in /admin and paired
-- with Meta via CAPI for match quality (Search is now the optimization event
-- for both Meta ad sets, so its signal quality matters more than any other).

create table if not exists search_intents (
  id uuid primary key default uuid_generate_v4(),
  check_in date,
  check_out date,
  nights int,
  adults int,
  children int,
  rooms int,
  room_slug text,
  value numeric,
  page_url text,
  meta_event_id text,
  created_at timestamptz default now()
);
create index if not exists idx_search_intents_created on search_intents(created_at desc);

alter table search_intents enable row level security;

-- Inserted via the service-role client (bypasses RLS) from the server action;
-- staff can read it in /admin. No public insert policy needed.
drop policy if exists search_intents_staff_read on search_intents;
create policy search_intents_staff_read on search_intents for select using (is_staff());
