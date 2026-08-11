"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/app/actions/activity";
import type { BookingStatus } from "@/types";

type Res = { ok: true } | { ok: false; error: string };

function eachNight(start: string, end: string) {
  const out: string[] = [];
  const d = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (d < last) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  // Free the room when cancelled / no-show.
  if (status === "cancelled" || status === "no_show") {
    await supabase.from("availability_blocks").delete().eq("booking_id", id);
  }
  await logActivity("booking.status", "booking", id, `→ ${status}`);
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin/bookings");
  return { ok: true };
}

export async function saveBookingNotes(id: string, notes: string): Promise<Res> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ admin_notes: notes.trim() || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("booking.notes", "booking", id);
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

export async function extendStay(id: string, newCheckOut: string): Promise<Res> {
  const supabase = await createClient();
  const { data: b, error: getErr } = await supabase
    .from("bookings")
    .select("room_id, check_in, check_out, unit_price, rooms_count")
    .eq("id", id)
    .maybeSingle();
  if (getErr || !b) return { ok: false, error: "Booking not found." };
  if (newCheckOut <= b.check_out) return { ok: false, error: "New check-out must be after the current one." };

  const addedNights = eachNight(b.check_out, newCheckOut);
  if (b.room_id) {
    // make sure the new nights are free
    const { data: taken } = await supabase
      .from("availability_blocks")
      .select("date")
      .eq("room_id", b.room_id)
      .in("date", addedNights);
    if (taken && taken.length) return { ok: false, error: "Those extra nights are already blocked." };

    await supabase.from("availability_blocks").upsert(
      addedNights.map((date) => ({ room_id: b.room_id, date, reason: "booking" as const, booking_id: id })),
      { onConflict: "room_id,date", ignoreDuplicates: true }
    );
  }

  const nights = eachNight(b.check_in, newCheckOut).length;
  const total = Number(b.unit_price) * nights * (b.rooms_count || 1);
  const { error } = await supabase
    .from("bookings")
    .update({ check_out: newCheckOut, nights, total })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await logActivity("booking.extend", "booking", id, `check-out → ${newCheckOut}`);
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

export async function deleteBooking(id: string): Promise<Res> {
  const supabase = await createClient();
  // remove blocks first (FK SET NULL, not CASCADE) then the booking
  await supabase.from("availability_blocks").delete().eq("booking_id", id);
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logActivity("booking.delete", "booking", id);
  revalidatePath("/admin/bookings");
  return { ok: true };
}
