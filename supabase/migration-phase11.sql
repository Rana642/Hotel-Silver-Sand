-- Phase 11 — a promotion/deal can apply to MULTIPLE specific rooms.
-- Empty array = all rooms. Run once (Hotel-Silver-Sand project).

alter table promotions add column if not exists room_ids uuid[] not null default '{}';

-- Carry over any single room_id set earlier into the new array.
update promotions set room_ids = array[room_id] where room_id is not null and room_ids = '{}';
