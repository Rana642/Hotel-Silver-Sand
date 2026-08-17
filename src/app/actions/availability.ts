"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/app/actions/activity";
import { addDays } from "@/lib/availability";

type Res = { ok: true; changed?: number } | { ok: false; error: string };

function daysInclusive(from: string, to: string): string[] {
  if (to < from) return [];
  const out: string[] = [];
  let d = from;
  // guard against runaway ranges
  for (let i = 0; i < 400 && d <= to; i++) {
    out.push(d);
    d = addDays(d, 1);
  }
  return out;
}

/** total cap for a room on each date: override if present, else the room default. */
async function capsForRange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  roomId: string,
  dates: string[]
): Promise<{ base: number; capOf: (d: string) => number }> {
  const [{ data: room }, { data: overrides }] = await Promise.all([
    supabase.from("rooms").select("total_units").eq("id", roomId).maybeSingle(),
    supabase.from("inventory_overrides").select("date, total_units").eq("room_id", roomId).in("date", dates),
  ]);
  const base = room?.total_units ?? 1;
  const ovr = new Map((overrides ?? []).map((o) => [o.date as string, o.total_units as number]));
  return { base, capOf: (d) => ovr.get(d) ?? base };
}

/** Bulk ADD n manual/OTA holds per day across a date range (capped at the cap). */
export async function bulkAddHolds(roomId: string, from: string, to: string, perDay: number): Promise<Res> {
  const n = Math.max(1, Math.floor(perDay) || 1);
  const supabase = await createClient();
  const dates = daysInclusive(from, to);
  if (!roomId || dates.length === 0) return { ok: false, error: "Pick a room and a valid date range." };

  const { capOf } = await capsForRange(supabase, roomId, dates);
  const { data: existing } = await supabase
    .from("manual_holds")
    .select("date, units")
    .eq("room_id", roomId)
    .in("date", dates);
  const cur = new Map((existing ?? []).map((h) => [h.date as string, h.units as number]));

  const rows = dates.map((date) => ({
    room_id: roomId,
    date,
    units: Math.min(capOf(date), (cur.get(date) ?? 0) + n),
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from("manual_holds").upsert(rows, { onConflict: "room_id,date" });
  if (error) return { ok: false, error: error.message };
  await logActivity("availability.hold", "availability", roomId, `+${n}/day ${from}→${to}`);
  revalidatePath("/admin/availability");
  return { ok: true, changed: rows.length };
}

/** Bulk RELEASE up to n manual holds per day across a range (real bookings untouched). */
export async function bulkReleaseHolds(roomId: string, from: string, to: string, perDay: number): Promise<Res> {
  const n = Math.max(1, Math.floor(perDay) || 1);
  const supabase = await createClient();
  const dates = daysInclusive(from, to);
  if (!roomId || dates.length === 0) return { ok: false, error: "Pick a room and a valid date range." };

  const { data: existing } = await supabase
    .from("manual_holds")
    .select("date, units")
    .eq("room_id", roomId)
    .in("date", dates);
  const cur = new Map((existing ?? []).map((h) => [h.date as string, h.units as number]));

  const rows = dates.map((date) => ({
    room_id: roomId,
    date,
    units: Math.max(0, (cur.get(date) ?? 0) - n),
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from("manual_holds").upsert(rows, { onConflict: "room_id,date" });
  if (error) return { ok: false, error: error.message };
  await logActivity("availability.release", "availability", roomId, `-${n}/day ${from}→${to}`);
  revalidatePath("/admin/availability");
  return { ok: true, changed: rows.length };
}

/** Nudge a single day's manual hold up or down by `delta` (clamped to [0, cap]). */
export async function adjustHold(roomId: string, date: string, delta: number): Promise<Res> {
  const supabase = await createClient();
  const { capOf } = await capsForRange(supabase, roomId, [date]);
  const { data: row } = await supabase
    .from("manual_holds")
    .select("units")
    .eq("room_id", roomId)
    .eq("date", date)
    .maybeSingle();
  const next = Math.max(0, Math.min(capOf(date), (row?.units ?? 0) + Math.sign(delta)));
  const { error } = await supabase
    .from("manual_holds")
    .upsert({ room_id: roomId, date, units: next, updated_at: new Date().toISOString() }, { onConflict: "room_id,date" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/availability");
  return { ok: true };
}

/**
 * Set a date-specific total-units override. Passing a value equal to the room
 * default clears the override so the date follows the default again.
 */
export async function setDateTotalOverride(roomId: string, date: string, total: number): Promise<Res> {
  const supabase = await createClient();
  const clean = Math.max(0, Math.floor(total) || 0);
  const { data: room } = await supabase.from("rooms").select("total_units").eq("id", roomId).maybeSingle();
  const base = room?.total_units ?? 1;

  if (clean === base) {
    const { error } = await supabase.from("inventory_overrides").delete().eq("room_id", roomId).eq("date", date);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("inventory_overrides")
      .upsert({ room_id: roomId, date, total_units: clean, updated_at: new Date().toISOString() }, { onConflict: "room_id,date" });
    if (error) return { ok: false, error: error.message };
  }
  await logActivity("availability.override", "availability", roomId, `${date} → ${clean}`);
  revalidatePath("/admin/availability");
  return { ok: true };
}

/** Change a room type's default inventory (units total). */
export async function setRoomTotalUnits(roomId: string, total: number): Promise<Res> {
  const supabase = await createClient();
  const clean = Math.max(0, Math.floor(total) || 0);
  const { error } = await supabase.from("rooms").update({ total_units: clean }).eq("id", roomId);
  if (error) return { ok: false, error: error.message };
  await logActivity("availability.inventory", "room", roomId, `total units → ${clean}`);
  revalidatePath("/admin/availability");
  revalidatePath("/admin/rooms");
  return { ok: true };
}
