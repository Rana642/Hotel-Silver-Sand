import "server-only";

import { createClient } from "@/lib/supabase/server";

// Google Ads offline conversion for an admin-confirmed booking. The upload
// itself happens on the ABS side (it holds the Google Ads credentials); this
// only sends the booking facts to ABS's /api/offline-conversions endpoint.
// Order ID = booking_ref, the same reference the website's Booking Request
// conversion uses, so Google counts one booking once.

const ABS_URL = process.env.ABS_OFFLINE_CONVERSIONS_URL;
const ABS_SECRET = process.env.OFFLINE_CONVERSIONS_SECRET;

// Hotel Silver Sand Google Ads (ids are not secrets; the credentials stay in ABS).
const CUSTOMER_ID = "406-337-1094";
const LOGIN_CUSTOMER_ID = "885-934-7478";
const PURCHASE_ACTION_ID = "7909473055"; // "Hotel Silver Sand - Confirmed booking (offline)"

/** Karachi time as Google's "YYYY-MM-DD HH:MM:SS+05:00". */
function pktStamp(d = new Date()): string {
  const shifted = new Date(d.getTime() + 5 * 60 * 60 * 1000).toISOString();
  return `${shifted.slice(0, 10)} ${shifted.slice(11, 19)}+05:00`;
}

export async function sendConfirmedToGoogleAds(bookingId: string): Promise<{ ok: boolean; error?: string }> {
  if (!ABS_URL || !ABS_SECRET) return { ok: false, error: "ABS endpoint not configured" };

  const supabase = await createClient();
  const { data: b, error } = await supabase
    .from("bookings")
    .select("booking_ref, gclid, guest_email, guest_phone, total")
    .eq("id", bookingId)
    .maybeSingle();
  if (error || !b) return { ok: false, error: "booking not found" };

  // No gclid = not from a Google Ads click, so there is nothing to attribute.
  if (!b.gclid) return { ok: true };
  if (!(Number(b.total) > 0)) return { ok: false, error: "no amount" };

  try {
    const res = await fetch(ABS_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-offline-secret": ABS_SECRET },
      body: JSON.stringify({
        customerId: CUSTOMER_ID,
        loginCustomerId: LOGIN_CUSTOMER_ID,
        conversionActionId: PURCHASE_ACTION_ID,
        gclid: b.gclid,
        orderId: b.booking_ref,
        conversionDateTime: pktStamp(),
        value: Number(b.total),
        currency: "PKR",
        email: b.guest_email,
        phone: b.guest_phone,
      }),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) return { ok: false, error: json.error ?? `ABS ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "request failed" };
  }
}
