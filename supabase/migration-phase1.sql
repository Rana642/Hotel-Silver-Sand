-- Phase 1 — core booking ops
-- Run once in Supabase SQL Editor (after schema.sql).

-- 1) Extra booking statuses -------------------------------------------------
alter type booking_status add value if not exists 'no_show';
alter type booking_status add value if not exists 'unreachable';

-- 2) Financial snapshot + notes on bookings ---------------------------------
alter table bookings add column if not exists unit_price numeric(10,2) not null default 0;
alter table bookings add column if not exists original_price numeric(10,2);
alter table bookings add column if not exists total numeric(12,2) not null default 0;
alter table bookings add column if not exists admin_notes text;
