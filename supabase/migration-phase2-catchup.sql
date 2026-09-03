-- Phase 2 catch-up — team roles + staff/admin RLS + inquiries.
-- Idempotent: safe to run even if parts already exist. Run once in Supabase.

-- 1) Team roles: add the role column used by getRole() (admin | reception).
alter table admin_users add column if not exists role text not null default 'admin';

-- 2) Helper functions.
create or replace function is_staff() returns boolean as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$ language sql security definer;

create or replace function is_admin() returns boolean as $$
  select exists (select 1 from admin_users where id = auth.uid() and role = 'admin');
$$ language sql security definer;

-- 3) Bookings — staff can view/add/edit, only admin can delete.
drop policy if exists bookings_admin_all on bookings;
drop policy if exists bookings_staff_select on bookings;
drop policy if exists bookings_staff_insert on bookings;
drop policy if exists bookings_staff_update on bookings;
drop policy if exists bookings_admin_delete on bookings;
create policy bookings_staff_select on bookings for select using (is_staff());
create policy bookings_staff_insert on bookings for insert with check (is_staff());
create policy bookings_staff_update on bookings for update using (is_staff()) with check (is_staff());
create policy bookings_admin_delete on bookings for delete using (is_admin());

-- 4) Rooms — public read stays; staff edit, admin delete.
drop policy if exists rooms_admin_all on rooms;
drop policy if exists rooms_staff_insert on rooms;
drop policy if exists rooms_staff_update on rooms;
drop policy if exists rooms_admin_delete on rooms;
create policy rooms_staff_insert on rooms for insert with check (is_staff());
create policy rooms_staff_update on rooms for update using (is_staff()) with check (is_staff());
create policy rooms_admin_delete on rooms for delete using (is_admin());

-- 5) Availability blocks — staff manage fully.
drop policy if exists avail_admin_write on availability_blocks;
drop policy if exists avail_staff_all on availability_blocks;
create policy avail_staff_all on availability_blocks for all using (is_staff()) with check (is_staff());

-- 6) admin_users — any staff can read (to know their own role).
drop policy if exists admin_users_self on admin_users;
drop policy if exists admin_users_staff_read on admin_users;
create policy admin_users_staff_read on admin_users for select using (is_staff());

-- 7) Inquiries table (+ RLS). Public inserts go via the service-role server action.
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
drop policy if exists inquiries_staff_select on inquiries;
drop policy if exists inquiries_staff_update on inquiries;
drop policy if exists inquiries_admin_delete on inquiries;
create policy inquiries_staff_select on inquiries for select using (is_staff());
create policy inquiries_staff_update on inquiries for update using (is_staff()) with check (is_staff());
create policy inquiries_admin_delete on inquiries for delete using (is_admin());
