-- Phase 3b — coupons (discount codes)
-- Run once in Supabase SQL Editor (after migration-phase3a.sql).

-- 1) Coupons table ----------------------------------------------------------
create table if not exists coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  discount_type text not null default 'percent',   -- 'percent' | 'fixed'
  value numeric(10,2) not null,
  min_booking numeric(10,2) not null default 0,
  max_uses integer,                                 -- null = unlimited
  used_count integer not null default 0,
  starts_at date,
  ends_at date,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

alter table coupons enable row level security;
-- validation happens server-side via the service role; public never reads coupons
drop policy if exists coupons_staff_select on coupons;
create policy coupons_staff_select on coupons for select using (is_staff());
drop policy if exists coupons_staff_insert on coupons;
create policy coupons_staff_insert on coupons for insert with check (is_staff());
drop policy if exists coupons_staff_update on coupons;
create policy coupons_staff_update on coupons for update using (is_staff()) with check (is_staff());
drop policy if exists coupons_admin_delete on coupons;
create policy coupons_admin_delete on coupons for delete using (is_admin());

-- 2) Booking columns for applied discount -----------------------------------
alter table bookings add column if not exists coupon_code text;
alter table bookings add column if not exists discount numeric(12,2) not null default 0;

-- 3) Atomic redemption RPC --------------------------------------------------
-- Locks the coupon row, validates, increments used_count, returns the discount.
create or replace function redeem_coupon(p_code text, p_total numeric)
returns table(valid boolean, message text, discount numeric)
language plpgsql
as $$
declare c coupons%rowtype; d numeric;
begin
  select * into c from coupons where lower(code) = lower(p_code) for update;
  if not found then return query select false, 'Invalid coupon code', 0::numeric; return; end if;
  if not c.is_active then return query select false, 'This coupon is not active', 0::numeric; return; end if;
  if c.starts_at is not null and current_date < c.starts_at then return query select false, 'Coupon is not valid yet', 0::numeric; return; end if;
  if c.ends_at is not null and current_date > c.ends_at then return query select false, 'Coupon has expired', 0::numeric; return; end if;
  if c.max_uses is not null and c.used_count >= c.max_uses then return query select false, 'Coupon usage limit reached', 0::numeric; return; end if;
  if p_total < coalesce(c.min_booking, 0) then return query select false, 'Minimum booking value not met for this coupon', 0::numeric; return; end if;

  if c.discount_type = 'percent' then d := round(p_total * c.value / 100, 2);
  else d := c.value; end if;
  if d > p_total then d := p_total; end if;

  update coupons set used_count = used_count + 1 where id = c.id;
  return query select true, 'Applied', d;
end $$;

-- Preview (no increment) — used by the booking form to show the discount live.
create or replace function preview_coupon(p_code text, p_total numeric)
returns table(valid boolean, message text, discount numeric)
language plpgsql
as $$
declare c coupons%rowtype; d numeric;
begin
  select * into c from coupons where lower(code) = lower(p_code);
  if not found then return query select false, 'Invalid coupon code', 0::numeric; return; end if;
  if not c.is_active then return query select false, 'This coupon is not active', 0::numeric; return; end if;
  if c.starts_at is not null and current_date < c.starts_at then return query select false, 'Coupon is not valid yet', 0::numeric; return; end if;
  if c.ends_at is not null and current_date > c.ends_at then return query select false, 'Coupon has expired', 0::numeric; return; end if;
  if c.max_uses is not null and c.used_count >= c.max_uses then return query select false, 'Coupon usage limit reached', 0::numeric; return; end if;
  if p_total < coalesce(c.min_booking, 0) then return query select false, 'Minimum booking value not met for this coupon', 0::numeric; return; end if;

  if c.discount_type = 'percent' then d := round(p_total * c.value / 100, 2);
  else d := c.value; end if;
  if d > p_total then d := p_total; end if;
  return query select true, 'Valid', d;
end $$;
