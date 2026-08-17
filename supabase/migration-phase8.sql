-- Phase 8 — multi-unit availability (inventory) model
-- Run once in Supabase SQL Editor (after migration-phase7.sql).
--
-- Old model: availability_blocks had unique(room_id,date) => 1 unit per type.
-- New model: each room type has an inventory (total_units). Per date we track:
--   bookings (from the bookings table)  +  manual/OTA holds (manual_holds)
--   available = effective_total - bookings - manual_holds
-- The website only allows a booking when available > 0 for every requested night.
-- A future channel manager just writes manual_holds to mirror OTA reservations.

-- 1) Inventory count per room type -----------------------------------------
alter table rooms add column if not exists total_units integer not null default 1;

-- 2) Per-date cap override (owner raises/reduces inventory for a single date)
create table if not exists inventory_overrides (
  room_id uuid not null references rooms(id) on delete cascade,
  date date not null,
  total_units integer not null check (total_units >= 0),
  updated_at timestamptz default now(),
  primary key (room_id, date)
);

-- 3) Manual / OTA / maintenance holds, counted per date --------------------
create table if not exists manual_holds (
  room_id uuid not null references rooms(id) on delete cascade,
  date date not null,
  units integer not null default 0 check (units >= 0),
  updated_at timestamptz default now(),
  primary key (room_id, date)
);

create index if not exists idx_inventory_overrides_date on inventory_overrides(date);
create index if not exists idx_manual_holds_date on manual_holds(date);

-- 4) RLS --------------------------------------------------------------------
alter table inventory_overrides enable row level security;
alter table manual_holds enable row level security;

drop policy if exists inv_ovr_public_read on inventory_overrides;
create policy inv_ovr_public_read on inventory_overrides for select using (true);
drop policy if exists inv_ovr_staff_all on inventory_overrides;
create policy inv_ovr_staff_all on inventory_overrides for all using (is_staff()) with check (is_staff());

drop policy if exists manual_holds_public_read on manual_holds;
create policy manual_holds_public_read on manual_holds for select using (true);
drop policy if exists manual_holds_staff_all on manual_holds;
create policy manual_holds_staff_all on manual_holds for all using (is_staff()) with check (is_staff());

-- 5) Carry over existing maintenance / walk-in blocks into manual_holds -----
--    (booking blocks are ignored — the bookings table is now the source.)
insert into manual_holds (room_id, date, units)
select room_id, date, count(*)::int
from availability_blocks
where reason in ('maintenance','walkin')
group by room_id, date
on conflict (room_id, date) do update set units = excluded.units;
