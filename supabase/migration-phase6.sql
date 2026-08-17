-- Phase 6 — app_settings (editable admin settings, e.g. notification recipient)
-- Run once in Supabase SQL Editor (after migration-phase5.sql).

create table if not exists app_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

alter table app_settings enable row level security;
drop policy if exists settings_staff_all on app_settings;
create policy settings_staff_all on app_settings for all using (is_staff()) with check (is_staff());
