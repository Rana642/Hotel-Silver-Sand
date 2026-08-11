-- Phase 3a — activity log (audit trail)
-- Run once in Supabase SQL Editor (after migration-phase2.sql).

create table if not exists activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_email text,
  action text not null,        -- e.g. booking.status, booking.delete, inquiry.status, room.update
  entity text,                 -- booking | inquiry | room | availability
  entity_id text,
  detail text,
  created_at timestamptz default now()
);
create index if not exists idx_activity_created on activity_log(created_at desc);
create index if not exists idx_activity_action on activity_log(action);

alter table activity_log enable row level security;

-- staff can read + append; no updates/deletes (immutable audit trail)
drop policy if exists activity_staff_read on activity_log;
create policy activity_staff_read on activity_log for select using (is_staff());
drop policy if exists activity_staff_insert on activity_log;
create policy activity_staff_insert on activity_log for insert with check (is_staff());
