import { createServiceClient } from "@/lib/supabase/service";

export type DayCell = {
  date: string;
  total: number; // effective cap (per-date override or the room default)
  overridden: boolean; // true when a date-specific total override applies
  booked: number; // units taken by real bookings (any source) spanning this night
  manual: number; // manual / OTA / maintenance holds
  available: number; // max(0, total - booked - manual)
};

export type RoomAvailability = {
  id: string;
  name: string;
  total_units: number; // the room's default inventory
  sort_order: number;
  days: DayCell[];
};

/** Calendar date (YYYY-MM-DD) in Pakistan time (UTC+5), regardless of server TZ. */
export function pktToday(): string {
  return new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
}

/** Add n days to a YYYY-MM-DD string using pure UTC math (no DST drift). */
export function addDays(ymd: string, n: number): string {
  const d = new Date(ymd + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function dateRange(start: string, days: number): string[] {
  return Array.from({ length: days }, (_, i) => addDays(start, i));
}

type BookingRow = { room_id: string | null; check_in: string; check_out: string; rooms_count: number | null; status: string };

/** true if a booking's stay covers the given night (check_in inclusive, check_out exclusive). */
function covers(b: BookingRow, date: string) {
  return date >= b.check_in && date < b.check_out;
}

/**
 * Build the availability grid for the calendar: one row per active room type,
 * one cell per day in [start, start+days).
 */
export async function getAvailabilityGrid(start: string, days = 14): Promise<RoomAvailability[]> {
  const supabase = createServiceClient();
  const dates = dateRange(start, days);
  const end = addDays(start, days); // exclusive

  const [{ data: rooms }, { data: overrides }, { data: holds }, { data: bookings }] = await Promise.all([
    supabase.from("rooms").select("id, name, total_units, sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("inventory_overrides").select("room_id, date, total_units").gte("date", start).lt("date", end),
    supabase.from("manual_holds").select("room_id, date, units").gte("date", start).lt("date", end),
    supabase
      .from("bookings")
      .select("room_id, check_in, check_out, rooms_count, status")
      .neq("status", "cancelled")
      .neq("status", "no_show")
      .lt("check_in", end)
      .gt("check_out", start),
  ]);

  const ovr = new Map<string, number>();
  (overrides ?? []).forEach((o) => ovr.set(o.room_id + "|" + o.date, o.total_units));
  const hold = new Map<string, number>();
  (holds ?? []).forEach((h) => hold.set(h.room_id + "|" + h.date, h.units));

  const booked = new Map<string, number>();
  (bookings as BookingRow[] | null ?? []).forEach((b) => {
    if (!b.room_id) return;
    const units = Math.max(1, b.rooms_count || 1);
    for (const date of dates) {
      if (covers(b, date)) {
        const k = b.room_id + "|" + date;
        booked.set(k, (booked.get(k) ?? 0) + units);
      }
    }
  });

  return (rooms ?? []).map((r) => {
    const base = r.total_units ?? 1;
    return {
      id: r.id,
      name: r.name,
      total_units: base,
      sort_order: r.sort_order ?? 0,
      days: dates.map((date) => {
        const k = r.id + "|" + date;
        const override = ovr.get(k);
        const total = override ?? base;
        const bk = booked.get(k) ?? 0;
        const mn = hold.get(k) ?? 0;
        return {
          date,
          total,
          overridden: override !== undefined,
          booked: bk,
          manual: mn,
          available: Math.max(0, total - bk - mn),
        };
      }),
    };
  });
}

/**
 * Server-authoritative check used before saving a booking: are `need` units of
 * `roomId` free on every requested night? Returns the first full night if not.
 */
export async function checkNightsAvailable(
  roomId: string,
  nights: string[],
  need: number
): Promise<{ ok: boolean; fullDate?: string }> {
  if (nights.length === 0) return { ok: true };
  const supabase = createServiceClient();
  const sorted = [...nights].sort();
  const start = sorted[0];
  const end = addDays(sorted[sorted.length - 1], 1); // exclusive

  const [{ data: room }, { data: overrides }, { data: holds }, { data: bookings }] = await Promise.all([
    supabase.from("rooms").select("total_units").eq("id", roomId).maybeSingle(),
    supabase.from("inventory_overrides").select("date, total_units").eq("room_id", roomId).in("date", nights),
    supabase.from("manual_holds").select("date, units").eq("room_id", roomId).in("date", nights),
    supabase
      .from("bookings")
      .select("check_in, check_out, rooms_count, status")
      .eq("room_id", roomId)
      .neq("status", "cancelled")
      .neq("status", "no_show")
      .lt("check_in", end)
      .gt("check_out", start),
  ]);

  const base = room?.total_units ?? 1;
  const ovr = new Map((overrides ?? []).map((o) => [o.date, o.total_units]));
  const hold = new Map((holds ?? []).map((h) => [h.date, h.units]));
  const booked = new Map<string, number>();
  (bookings as BookingRow[] | null ?? []).forEach((b) => {
    const units = Math.max(1, b.rooms_count || 1);
    for (const d of nights) if (covers(b, d)) booked.set(d, (booked.get(d) ?? 0) + units);
  });

  const want = Math.max(1, need);
  for (const d of nights) {
    const total = ovr.get(d) ?? base;
    const used = (booked.get(d) ?? 0) + (hold.get(d) ?? 0);
    if (total - used < want) return { ok: false, fullDate: d };
  }
  return { ok: true };
}

/** Effective cap for a single (room, date): the override if set, else the room default. */
export async function effectiveTotal(roomId: string, date: string): Promise<number> {
  const supabase = createServiceClient();
  const [{ data: room }, { data: override }] = await Promise.all([
    supabase.from("rooms").select("total_units").eq("id", roomId).maybeSingle(),
    supabase.from("inventory_overrides").select("total_units").eq("room_id", roomId).eq("date", date).maybeSingle(),
  ]);
  return override?.total_units ?? room?.total_units ?? 1;
}
