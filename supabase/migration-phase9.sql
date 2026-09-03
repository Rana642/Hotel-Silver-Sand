-- Phase 9 — dashboard-managed rate deals (Early Bird / Last Minute / seasonal)
-- Run once in Supabase SQL Editor (after migration-phase8.sql).
--
-- A deal applies an automatic % discount to a room's nightly price when the
-- guest's CHECK-IN date falls inside [start_date, end_date]. No coupon code
-- needed — it shows and applies on the reservation automatically. room_id NULL
-- means the deal applies to every room.

-- Ensure the staff-check helper exists (originally defined in phase2). Recreated
-- here so this migration is self-contained even if phase2 wasn't applied.
create or replace function is_staff() returns boolean as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$ language sql security definer;

create table if not exists rate_deals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,                                   -- e.g. "Early Bird Deal", "Last Minute Deal", "Eid Special"
  discount_percent numeric(5,2) not null default 0 check (discount_percent >= 0 and discount_percent <= 90),
  start_date date not null,                             -- applies to check-in dates within this window
  end_date date not null,
  room_id uuid references rooms(id) on delete cascade,  -- NULL = applies to all rooms
  refundable boolean not null default true,             -- true = free cancellation, false = non-refundable
  free_cancel_days integer not null default 2,          -- (refundable) free cancellation until check-in minus N days
  is_active boolean not null default true,
  priority integer not null default 0,                  -- higher wins when windows overlap (tie-break: higher discount)
  created_at timestamptz default now()
);

create index if not exists idx_rate_deals_dates on rate_deals(start_date, end_date);
create index if not exists idx_rate_deals_active on rate_deals(is_active);

alter table rate_deals enable row level security;

drop policy if exists rate_deals_public_read on rate_deals;
create policy rate_deals_public_read on rate_deals for select using (true);
drop policy if exists rate_deals_staff_all on rate_deals;
create policy rate_deals_staff_all on rate_deals for all using (is_staff()) with check (is_staff());
