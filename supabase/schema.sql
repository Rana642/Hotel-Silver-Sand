-- Hotel Silver Sand Multan — database schema
-- Run once in Supabase: SQL Editor > New query > paste all > Run.

create extension if not exists "uuid-ossp";

-- ROOMS ---------------------------------------------------------------------
create table if not exists rooms (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  capacity text,
  max_adults integer not null default 2,
  max_children integer not null default 0,
  price_per_night numeric(10,2) not null,
  original_price numeric(10,2),
  image text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- BOOKINGS ------------------------------------------------------------------
do $$ begin
  create type booking_status as enum ('pending','confirmed','checked_in','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_source as enum ('website','walkin','phone');
exception when duplicate_object then null; end $$;

create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  booking_ref text unique not null,
  room_id uuid references rooms(id),
  room_name text not null,
  guest_name text not null,
  guest_phone text not null,
  guest_email text,
  check_in date not null,
  check_out date not null,
  guests integer not null default 1,
  rooms_count integer not null default 1,
  nights integer not null default 1,
  special_request text,
  status booking_status default 'pending',
  source booking_source default 'website',
  created_at timestamptz default now()
);

-- AVAILABILITY --------------------------------------------------------------
do $$ begin
  create type block_reason as enum ('booking','maintenance','walkin');
exception when duplicate_object then null; end $$;

create table if not exists availability_blocks (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references rooms(id) on delete cascade,
  date date not null,
  reason block_reason not null default 'booking',
  booking_id uuid references bookings(id) on delete set null,
  unique(room_id, date)
);

-- ADMIN ---------------------------------------------------------------------
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now()
);

create index if not exists idx_bookings_room_id on bookings(room_id);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_bookings_check_in on bookings(check_in);
create index if not exists idx_availability_room_date on availability_blocks(room_id, date);

-- RLS -----------------------------------------------------------------------
alter table rooms enable row level security;
alter table bookings enable row level security;
alter table availability_blocks enable row level security;
alter table admin_users enable row level security;

create or replace function is_admin() returns boolean as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$ language sql security definer;

drop policy if exists rooms_public_read on rooms;
create policy rooms_public_read on rooms for select using (true);
drop policy if exists rooms_admin_all on rooms;
create policy rooms_admin_all on rooms for all using (is_admin()) with check (is_admin());

drop policy if exists bookings_admin_all on bookings;
create policy bookings_admin_all on bookings for all using (is_admin()) with check (is_admin());

drop policy if exists avail_public_read on availability_blocks;
create policy avail_public_read on availability_blocks for select using (true);
drop policy if exists avail_admin_write on availability_blocks;
create policy avail_admin_write on availability_blocks for all using (is_admin()) with check (is_admin());

drop policy if exists admin_users_self on admin_users;
create policy admin_users_self on admin_users for select using (is_admin());

-- SEED ROOMS ----------------------------------------------------------------
insert into rooms (slug, name, capacity, max_adults, max_children, price_per_night, original_price, image, sort_order) values
  ('deluxe-king-room',      'Deluxe King Room',      '2 Adults',              2, 0,  4000, 6500, '/images/rooms/deluxe-king.svg',      1),
  ('deluxe-triple-room',    'Deluxe Triple Room',    '3 Adults',              3, 0,  6000, 7500, '/images/rooms/deluxe-triple.svg',    2),
  ('executive-twin-room',   'Executive Twin Room',   '4 Adults',              4, 0,  9000, null, '/images/rooms/executive-twin.svg',   3),
  ('executive-family-room', 'Executive Family Room', '4 Adults + 2 Children', 4, 2, 11000, null, '/images/rooms/executive-family.svg', 4)
on conflict (slug) do update set
  name = excluded.name,
  capacity = excluded.capacity,
  max_adults = excluded.max_adults,
  max_children = excluded.max_children,
  price_per_night = excluded.price_per_night,
  original_price = excluded.original_price,
  image = excluded.image,
  sort_order = excluded.sort_order;
