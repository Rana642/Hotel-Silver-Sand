"use server";

import { createServiceClient } from "@/lib/supabase/service";

export type BookingInput = {
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomsCount: number;
  name: string;
  phone: string;
  email: string;
  requests?: string;
  source?: "website" | "walkin" | "phone";
};

export type BookingResult =
  | { success: true; bookingRef: string }
  | { success: false; error: string };

function makeRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `HSS-${s}`;
}

function eachDate(start: string, end: string) {
  const dates: string[] = [];
  const d = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (d < last) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const supabase = createServiceClient();

  // --- validate ---
  if (!input.name?.trim() || !input.phone?.trim()) {
    return { success: false, error: "Name and phone are required." };
  }
  if (!input.checkIn || !input.checkOut) {
    return { success: false, error: "Check-in and check-out dates are required." };
  }
  const nights = eachDate(input.checkIn, input.checkOut).length;
  if (nights < 1) {
    return { success: false, error: "Check-out must be after check-in." };
  }
  if (nights > 90) {
    return { success: false, error: "Stay cannot exceed 90 nights." };
  }

  // --- resolve room (server-authoritative) ---
  const { data: room } = await supabase
    .from("rooms")
    .select("id, name, max_adults, max_children")
    .eq("name", input.roomType)
    .maybeSingle();

  if (!room) {
    return { success: false, error: "Selected room type was not found." };
  }

  // --- availability check ---
  const nightsList = eachDate(input.checkIn, input.checkOut);
  const { data: blocked } = await supabase
    .from("availability_blocks")
    .select("date")
    .eq("room_id", room.id)
    .in("date", nightsList);

  if (blocked && blocked.length > 0) {
    return {
      success: false,
      error: "Sorry, this room is not available for the selected dates. Please try different dates or contact us.",
    };
  }

  // --- insert booking ---
  const bookingRef = makeRef();
  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      booking_ref: bookingRef,
      room_id: room.id,
      room_name: room.name,
      guest_name: input.name.trim(),
      guest_phone: input.phone.trim(),
      guest_email: input.email?.trim() || null,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests: Math.max(1, Number(input.guests) || 1),
      rooms_count: Math.max(1, Number(input.roomsCount) || 1),
      nights,
      special_request: input.requests?.trim() || null,
      status: "pending",
      source: input.source ?? "website",
    })
    .select("id")
    .single();

  if (insertError || !booking) {
    return { success: false, error: "Could not save your booking. Please try again or contact us." };
  }

  // --- block the nights (skip any already taken) ---
  const { error: blockError } = await supabase.from("availability_blocks").upsert(
    nightsList.map((date) => ({
      room_id: room.id,
      date,
      reason: "booking" as const,
      booking_id: booking.id,
    })),
    { onConflict: "room_id,date", ignoreDuplicates: true }
  );

  if (blockError) {
    // roll back so we never leave a half-booked state
    await supabase.from("bookings").delete().eq("id", booking.id);
    return { success: false, error: "Those dates were just taken. Please pick different dates." };
  }

  return { success: true, bookingRef };
}
