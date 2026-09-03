-- Phase 12 — lead-time deal triggers (Early Bird / Last Minute).
-- A deal can trigger by booking lead time (days between booking date and check-in)
-- instead of a fixed calendar window. Run once (Hotel-Silver-Sand project).

-- 'none' = use the date range (start_date/end_date)
-- 'early_bird' = applies when booked at least lead_time_days BEFORE check-in
-- 'last_minute' = applies when booked within lead_time_days of check-in
alter table promotions add column if not exists lead_time_type text not null default 'none';
alter table promotions add column if not exists lead_time_days integer not null default 0;
