-- Phase 13 — weekday filter for deals (recurring weekly, e.g. weekend-only).
-- weekdays: array of 0..6 (0=Sunday .. 6=Saturday). Empty = every day.
-- The deal applies only when the CHECK-IN date falls on one of these weekdays.
-- Run once (Hotel-Silver-Sand project).

alter table promotions add column if not exists weekdays smallint[] not null default '{}';
