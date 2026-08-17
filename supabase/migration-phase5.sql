-- Phase 5 — Promotions (editable from admin, shown on /promotions)
-- Run once in Supabase SQL Editor (after migration-phase4c.sql).

create table if not exists promotions (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  short_desc text,            -- card blurb
  description text,           -- long detail (paragraphs separated by blank lines)
  image text,
  badge text,                 -- e.g. "20% OFF"
  benefits text[] default '{}',
  coupon_code text,           -- optional coupon prefilled on "Book Now"
  is_active boolean not null default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
create index if not exists idx_promotions_active on promotions(is_active, sort_order);

alter table promotions enable row level security;
drop policy if exists promo_public_read on promotions;
create policy promo_public_read on promotions for select using (is_active = true);
drop policy if exists promo_staff_all on promotions;
create policy promo_staff_all on promotions for all using (is_staff()) with check (is_staff());
