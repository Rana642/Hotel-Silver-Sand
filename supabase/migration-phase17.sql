-- Phase 17 — booking attribution (2026-10-08).
-- Run once in Supabase SQL Editor (after migration-phase16.sql).
--
-- Website bookings now save where the guest first came from (the same first
-- touch that makes the WhatsApp "Ref:" code): the ref code (e.g. FB-SFC1),
-- UTMs, Google/Meta click ids, first landing page and referrer. Matches the
-- Elegant site's columns, so the Ads by Shoaib client portal shows a Source
-- for every booking. Additive and nullable — safe on live data.

alter table bookings add column if not exists ref_code text;
alter table bookings add column if not exists utm_source text;
alter table bookings add column if not exists utm_medium text;
alter table bookings add column if not exists utm_campaign text;
alter table bookings add column if not exists utm_content text;
alter table bookings add column if not exists utm_term text;
alter table bookings add column if not exists gclid text;
alter table bookings add column if not exists fbclid text;
alter table bookings add column if not exists landing_path text;
alter table bookings add column if not exists referrer text;

create index if not exists idx_bookings_ref_code on bookings (ref_code) where ref_code is not null;
