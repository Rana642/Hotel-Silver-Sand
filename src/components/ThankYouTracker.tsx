"use client";

import { useEffect } from "react";
import { trackEvent, trackMetaPixel } from "@/lib/analytics";

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
    trackEvent("booking_confirmed", {
      booking_ref: bookingRef,
      event_id: bookingRef, // same id server-side CAPI uses → Meta dedupes browser + server
      room,
      value,
      currency: "PKR",
    });
    // Direct Meta Pixel fire (no GTM) — same eventId as the server CAPI call
    // in createBooking(), so Meta dedupes rather than double-counting.
    trackMetaPixel(
      "Lead",
      { content_name: room, value, currency: "PKR" },
      bookingRef
    );
  }, [bookingRef, room, value]);
  return null;
}
