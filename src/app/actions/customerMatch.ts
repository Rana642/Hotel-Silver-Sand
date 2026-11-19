"use server";

import { createClient } from "@/lib/supabase/server";

// Sends this hotel's confirmed past guests (email/phone only) to the ABS
// Customer Match endpoint, which builds a Google Ads Customer Match list in
// the hotel's own account. Staff-only. The upload is NOT automatic: an admin
// has to trigger it, and it should only run once the privacy policy covers it.

const CUSTOMER_ID = "406-337-1094";       // Hotel Silver Sand Google Ads
const LOGIN_CUSTOMER_ID = "885-934-7478"; // MCC

export async function sendConfirmedGuestsToGoogle(): Promise<{ success: boolean; count?: number; error?: string }> {
  const base = process.env.ABS_OFFLINE_CONVERSIONS_URL;
  const secret = process.env.OFFLINE_CONVERSIONS_SECRET;
  if (!base || !secret) return { success: false, error: "ABS endpoint not configured" };
  const url = base.replace(/offline-conversions\/?$/, "customer-match");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { success: false, error: "not signed in" };
  const { data, error } = await supabase
    .from("bookings")
    .select("guest_email, guest_phone")
    .in("status", ["confirmed", "checked_in", "completed"])
    .limit(5000);
  if (error) return { success: false, error: error.message };

  const seen = new Set<string>();
  const guests = (data ?? [])
    .filter((g) => g.guest_email || g.guest_phone)
    .filter((g) => {
      const key = `${g.guest_email ?? ""}|${g.guest_phone ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  if (guests.length === 0) return { success: false, error: "no guests with email or phone" };

  const listName = `Hotel Silver Sand - confirmed guests ${new Date().toISOString().slice(0, 10)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-offline-secret": secret },
      body: JSON.stringify({ customerId: CUSTOMER_ID, loginCustomerId: LOGIN_CUSTOMER_ID, listName, guests }),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) return { success: false, error: json.error ?? `ABS ${res.status}` };
    return { success: true, count: guests.length };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "request failed" };
  }
}
