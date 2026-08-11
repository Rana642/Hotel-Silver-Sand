-- Phase 4 — rich room content + multiple images + per-room GST
-- Run once in Supabase SQL Editor (after migration-phase3b.sql).

-- 1) Rich fields on rooms ---------------------------------------------------
alter table rooms add column if not exists description text;
alter table rooms add column if not exists size_sqft integer;
alter table rooms add column if not exists view text default 'City View';
alter table rooms add column if not exists amenities text[] default '{}';
alter table rooms add column if not exists ideal_for text;
alter table rooms add column if not exists why_book text[] default '{}';
alter table rooms add column if not exists good_to_know jsonb default '{}'::jsonb;
alter table rooms add column if not exists nearby jsonb default '[]'::jsonb;
alter table rooms add column if not exists faqs jsonb default '[]'::jsonb;
alter table rooms add column if not exists gst_percent numeric(5,2) not null default 16;

-- 2) Multiple images per room ----------------------------------------------
create table if not exists room_images (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references rooms(id) on delete cascade,
  url text not null,
  alt text,
  is_featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);
create index if not exists idx_room_images_room on room_images(room_id, sort_order);

alter table room_images enable row level security;
drop policy if exists rimages_public_read on room_images;
create policy rimages_public_read on room_images for select using (true);
drop policy if exists rimages_staff_write on room_images;
create policy rimages_staff_write on room_images for all using (is_staff()) with check (is_staff());

-- 3) Storage bucket policies (bucket 'room-images' created via script) ------
-- public read
drop policy if exists "room_images_public_read" on storage.objects;
create policy "room_images_public_read" on storage.objects
  for select using (bucket_id = 'room-images');
-- staff upload / update / delete
drop policy if exists "room_images_staff_write" on storage.objects;
create policy "room_images_staff_write" on storage.objects
  for all using (bucket_id = 'room-images' and is_staff())
  with check (bucket_id = 'room-images' and is_staff());
