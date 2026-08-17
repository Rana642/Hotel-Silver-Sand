-- Phase 7 — hero_images (auto-rotating hero slider, managed in admin)
-- Run once in Supabase SQL Editor (after migration-phase6.sql).

create table if not exists hero_images (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  alt text,
  is_active boolean not null default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
create index if not exists idx_hero_active on hero_images(is_active, sort_order);

alter table hero_images enable row level security;
drop policy if exists hero_public_read on hero_images;
create policy hero_public_read on hero_images for select using (is_active = true);
drop policy if exists hero_staff_all on hero_images;
create policy hero_staff_all on hero_images for all using (is_staff()) with check (is_staff());

-- seed the current hero as the first slide
insert into hero_images (url, alt, sort_order)
select '/images/hero.png', 'Hotel Silver Sand Multan building exterior', 0
where not exists (select 1 from hero_images);
