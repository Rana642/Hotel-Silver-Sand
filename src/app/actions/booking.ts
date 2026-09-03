"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { checkNightsAvailable } from "@/lib/availability";
import { dealForRoomOnDate, applyDeal } from "@/lib/deals";
import { sendMetaEvent } from "@/lib/meta-capi";
import { notifyBooking } from "@/lib/notify";
import { site } from "@/data/site";

export type ManageBookingResult =
  | {
      found: true;
      booking: {
        booking_ref: string;
        room_name: string;
        guest_name: string;
        check_in: string;
        check_out: string;
        nights: number;
        guests: number;
        total: number;
        status: string;
      };
    }
  | { found: false };

/** Look up a booking for the guest — requires the ref AND a matching email/phone. */
export async function lookupBooking(ref: string, contact: string): Promise<ManageBookingResult> {
  const code = ref.trim().toUpperCase();
  const c = contact.trim().toLowerCase();
  if (!code || !c) return { found: false };
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("bookings")
    .select("booking_ref, room_name, guest_name, guest_email, guest_phone, check_in, check_out, nights, guests, total, status")
    .eq("booking_ref", code)
    .maybeSingle();
  if (!data) return { found: false };
  const emailOk = (data.guest_email ?? "").toLowerCase() === c;
  const phoneDigits = (data.guest_phone ?? "").replace(/\D/g, "");
  const contactDigits = c.replace(/\D/g, "");
  const phoneOk =
    contactDigits.length >= 7 && phoneDigits.length >= 7 && phoneDigits.endsWith(contactDigits.slice(-10));
  if (!emailOk && !phoneOk) return { found: false };
  const { guest_email, guest_phone, ...safe } = data;
  void guest_email;
  void guest_phone;
  return { found: true, booking: safe };
}

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
  couponCode?: string;
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

// Give a consumed coupon use back when a booking fails after redemption.
async function rollbackCoupon(
  supabase: ReturnType<typeof createServiceClient>,
  code: string
) {
  const { data } = await supabase
    .from("coupons")
    .select("id, used_count")
    .ilike("code", code)
    .maybeSingle();
  if (data && data.used_count > 0) {
    await supabase.from("coupons").update({ used_count: data.used_count - 1 }).eq("id", data.id);
  }
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

  // --- resolve room (server-authoritative price) ---
  const { data: room } = await supabase
    .from("rooms")
    .select("id, name, price_per_night, original_price, max_adults, max_children")
    .eq("name", input.roomType)
    .maybeSingle();

  if (!room) {
    return { success: false, error: "Selected room type was not found." };
  }

  const roomsCount = Math.max(1, Number(input.roomsCount) || 1);
  // Apply any active dashboard deal for the check-in date (server-authoritative,
  // so the saved price matches what the guest was shown on /reservations).
  const baseUnit = Number(room.price_per_night) || 0;
  const deal = await dealForRoomOnDate(room.id, input.checkIn);
  const unitPrice = applyDeal(baseUnit, deal);
  const roomTotal = unitPrice * nights * roomsCount;

  // --- availability check (multi-unit inventory) — before touching coupons ---
  const nightsList = eachDate(input.checkIn, input.checkOut);
  const avail = await checkNightsAvailable(room.id, nightsList, roomsCount);
  if (!avail.ok) {
    return {
      success: false,
      error: "Sorry, this room is sold out for the selected dates. Please try different dates or contact us.",
    };
  }

  // --- coupon (atomic redeem) ---
  let discount = 0;
  let couponCode: string | null = null;
  if (input.couponCode?.trim()) {
    const { data: redeem, error: rErr } = await supabase.rpc("redeem_coupon", {
      p_code: input.couponCode.trim(),
      p_total: roomTotal,
    });
    const row = Array.isArray(redeem) ? redeem[0] : redeem;
    if (rErr || !row) return { success: false, error: "Could not apply coupon. Please try again." };
    if (!row.valid) return { success: false, error: row.message as string };
    discount = Number(row.discount) || 0;
    couponCode = input.couponCode.trim().toUpperCase();
  }

  const total = Math.max(0, roomTotal - discount);

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
      rooms_count: roomsCount,
      nights,
      unit_price: unitPrice,
      original_price: room.original_price ?? null,
      discount,
      coupon_code: couponCode,
      total,
      special_request: input.requests?.trim() || null,
      status: "pending",
      source: input.source ?? "website",
    })
    .select("id")
    .single();

  if (insertError || !booking) {
    if (couponCode) await rollbackCoupon(supabase, couponCode);
    return { success: false, error: "Could not save your booking. Please try again or contact us." };
  }

  // Note: web/direct booking usage is counted straight from the bookings table
  // (see lib/availability.ts), so there is no separate block row to write here.

  // --- Meta Conversions API (awaited so the serverless fn doesn't freeze
  // before the request lands; deduped with the browser Pixel via event_id) ---
  await sendMetaEvent({
    name: "Lead",
    eventId: bookingRef,
    eventSourceUrl: `${site.url}/thank-you?ref=${bookingRef}`,
    user: {
      email: input.email,
      phone: input.phone,
      name: input.name,
    },
    custom: {
      currency: "PKR",
      value: total,
      content_name: room.name,
      content_ids: [room.id],
    },
  });

  // --- Email notifications (admin + guest confirmation) — never blocks success ---
  await notifyBooking({
    booking_ref: bookingRef,
    guest_name: input.name,
    guest_phone: input.phone,
    guest_email: input.email || null,
    room_name: room.name,
    check_in: input.checkIn,
    check_out: input.checkOut,
    nights,
    guests: input.guests,
    rooms_count: input.roomsCount,
    total,
    special_request: input.requests?.trim() || null,
  });

  return { success: true, bookingRef };
}
