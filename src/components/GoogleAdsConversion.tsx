"use client";

import { useEffect } from "react";

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

/**
 * Fires a Google Ads conversion DIRECTLY (via gtag) on the thank-you page —
 * not routed through GTM/GA4 — for the fastest, most reliable conversion
 * signal so campaigns optimise quickly. Fires once per booking_ref.
 * Also sets Enhanced Conversions user data (gtag hashes it in-browser).
 */
export default function GoogleAdsConversion({
  bookingRef,
  value,
  email,
  phone,
}: {
  bookingRef: string;
  value: number;
  email?: string | null;
  phone?: string | null;
}) {
  useEffect(() => {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL;
    if (!adsId || !label) return;

    const key = `gads_conv:${bookingRef}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}

    const w = window as GtagWindow;
    if (typeof w.gtag !== "function") return;

    // Enhanced Conversions — gtag hashes these client-side before sending.
    const userData: Record<string, string> = {};
    if (email) userData.email = email.trim().toLowerCase();
    if (phone) userData.phone_number = "+" + phone.replace(/[^\d]/g, "").replace(/^0/, "92");
    if (Object.keys(userData).length) w.gtag("set", "user_data", userData);

    w.gtag("event", "conversion", {
      send_to: `${adsId}/${label}`,
      value,
      currency: "PKR",
      transaction_id: bookingRef,
    });
  }, [bookingRef, value, email, phone]);

  return null;
}
