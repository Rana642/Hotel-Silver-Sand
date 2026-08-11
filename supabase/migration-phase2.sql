-- Phase 2 — inquiries (lead capture) + team roles
-- Run once in Supabase SQL Editor (after migration-phase1.sql).

-- 1) Team roles -------------------------------------------------------------
alter table admin_users add column if not exists role text not null default 'admin';
-- allowed values: 'admin' (full) | 'reception' (view/edit, no delete)

-- is_staff(): any logged-in staff member
create or replace function is_staff() returns boolean as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$ language sql security definer;

-- is_admin(): staff member whose role is 'admin' (full access)
create or replace function is_admin() returns boolean as $$
  select exists (select 1 from admin_users where id = auth.uid() and role = 'admin');
$$ language sql security definer;

-- 2) Re-scope existing policies to staff (edit) + admin (delete) ------------
-- bookings
drop policy if exists bookings_admin_all on bookings;
create policy bookings_staff_select on bookings for select using (is_staff());
create policy bookings_staff_insert on bookings for insert with check (is_staff());
create policy bookings_staff_update on bookings for update using (is_staff()) with check (is_staff());
create policy bookings_admin_delete on bookings for delete using (is_admin());

-- rooms (public read already exists)
drop policy if exists rooms_admin_all on rooms;
create policy rooms_staff_insert on rooms for insert with check (is_staff());
create policy rooms_staff_update on rooms for update using (is_staff()) with check (is_staff());
create policy rooms_admin_delete on rooms for delete using (is_admin());

-- availability (public read already exists) — staff manage fully
drop policy if exists avail_admin_write on availability_blocks;
create policy avail_staff_all on availability_blocks for all using (is_staff()) with check (is_staff());

-- admin_users: any staff can read (to know their own role)
drop policy if exists admin_users_self on admin_users;
create policy admin_users_staff_read on admin_users for select using (is_staff());

-- 3) Inquiries --------------------------------------------------------------
create table if not exists inquiries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text,
  room_interest text,
  check_in date,
  check_out date,
  message text,
  source text default 'contact_form',
  status text not null default 'new',   -- new | contacted | converted | closed
  created_at timestamptz default now()
);
create index if not exists idx_inquiries_status on inquiries(status);
create index if not exists idx_inquiries_created on inquiries(created_at desc);

alter table inquiries enable row level security;
-- public inserts happen via the service-role server action (bypasses RLS)
create policy inquiries_staff_select on inquiries for select using (is_staff());
create policy inquiries_staff_update on inquiries for update using (is_staff()) with check (is_staff());
create policy inquiries_admin_delete on inquiries for delete using (is_admin());
