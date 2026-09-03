-- Phase 15 — time-of-day window for Last Minute deals.
-- start_time/end_time are "HH:MM" (24h, Pakistan time). Only used when the deal is
-- a Last Minute type: the deal is active only if the CURRENT booking time falls in
-- this window. Empty = all day. Supports windows that cross midnight (e.g. 22:00-02:00).
-- Run once (Hotel-Silver-Sand project).

alter table promotions add column if not exists start_time text;
alter table promotions add column if not exists end_time text;
