-- Phase 4C — gallery_images + destinations
-- Run once in Supabase SQL Editor (after migration-phase4.sql).

-- 1) gallery_images ---------------------------------------------------------
create table if not exists gallery_images (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  alt text,
  category text not null default 'Exterior',
  is_visible boolean not null default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
create index if not exists idx_gallery_visible on gallery_images(is_visible, sort_order);

alter table gallery_images enable row level security;
drop policy if exists gallery_public_read on gallery_images;
create policy gallery_public_read on gallery_images for select using (is_visible = true);
drop policy if exists gallery_staff_all on gallery_images;
create policy gallery_staff_all on gallery_images for all using (is_staff()) with check (is_staff());

-- 2) destinations (Discover Multan) -----------------------------------------
create table if not exists destinations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text not null,
  image text,
  is_active boolean not null default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
create index if not exists idx_destinations_active on destinations(is_active, sort_order);

alter table destinations enable row level security;
drop policy if exists dest_public_read on destinations;
create policy dest_public_read on destinations for select using (is_active = true);
drop policy if exists dest_staff_all on destinations;
create policy dest_staff_all on destinations for all using (is_staff()) with check (is_staff());

-- 3) Storage bucket policies for site-images bucket (created via script) ----
drop policy if exists "site_images_public_read" on storage.objects;
create policy "site_images_public_read" on storage.objects
  for select using (bucket_id = 'site-images');
drop policy if exists "site_images_staff_write" on storage.objects;
create policy "site_images_staff_write" on storage.objects
  for all using (bucket_id = 'site-images' and is_staff())
  with check (bucket_id = 'site-images' and is_staff());
