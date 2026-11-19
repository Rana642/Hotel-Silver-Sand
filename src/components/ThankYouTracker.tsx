"use client";

import { useEffect } from "react";
import { trackEvent, trackMetaPixel, trackAdsConversion } from "@/lib/analytics";

// Google Ads "Booking Request" conversion label (AW-18025732902). Hard-coded
// rather than read from env, so a missing build variable can't silently drop it.
const GADS_BOOKING_REQUEST_LABEL = "urZaCKej_eEcEKa2q5ND";

/** Fires booking_confirmed exactly once per booking_ref, even across refreshes. */
export default function ThankYouTracker({
  bookingRef,
  room,
  value,
}: {
  bookingRef: string;
  room: string;
  value: number;
}) {
  useEffect(() => {
    const key = `booking_confirmed:${bookingRef}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    // Google Ads Booking Request — once per booking (same guard as above).
    trackAdsConversion(GADS_BOOKING_REQUEST_LABEL);
    trackEvent("booking_confirmed", {
      booking_ref: bookingRef,
      event_id: bookingRef, // same id server-side CAPI uses → Meta dedupes browser + server
      room,
      value,
      currency: "PKR",
    });
    // Direct Meta Pixel fire — same eventId as the server CAPI call in
    // createBooking(), so Meta dedupes rather than double-counting.
    trackMetaPixel(
      "Lead",
      { content_name: room, value, currency: "PKR" },
      bookingRef
    );
    // Paired with createBooking()'s server-side Purchase CAPI call.
    trackMetaPixel(
      "Purchase",
      { content_name: room, value, currency: "PKR" },
      `${bookingRef}-purchase`
    );
  }, [bookingRef, room, value]);
  return null;
}
