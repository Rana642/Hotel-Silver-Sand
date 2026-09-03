-- Phase 14 — Long Stay deals (minimum nights condition).
-- A deal with min_nights > 0 applies only when the stay is at least that many nights.
-- Run once (Hotel-Silver-Sand project).

alter table promotions add column if not exists min_nights integer not null default 0;
