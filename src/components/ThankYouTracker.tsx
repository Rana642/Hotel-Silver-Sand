"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

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
  }, [bookingRef, room, value]);
  return null;
}
