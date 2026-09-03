-- Phase 10 — merge Deals into Promotions.
-- A promotion becomes an automatic date-based discount when discount_percent > 0
-- and start_date/end_date are set. Otherwise it's just a marketing card.
-- Run once in Supabase SQL Editor (on the Hotel-Silver-Sand project).

alter table promotions add column if not exists discount_percent numeric(5,2) not null default 0
  check (discount_percent >= 0 and discount_percent <= 90);
alter table promotions add column if not exists start_date date;             -- check-in window start
alter table promotions add column if not exists end_date date;               -- check-in window end
alter table promotions add column if not exists room_id uuid references rooms(id) on delete set null; -- NULL = all rooms
alter table promotions add column if not exists refundable boolean not null default true;
alter table promotions add column if not exists free_cancel_days integer not null default 2;
alter table promotions add column if not exists priority integer not null default 0;

create index if not exists idx_promotions_deal_dates on promotions(start_date, end_date);
