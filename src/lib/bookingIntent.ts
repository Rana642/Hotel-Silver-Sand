"use client";

/**
 * A lightweight "booking intent" persisted in localStorage so we can:
 *  - carry hero search dates into the room booking form,
 *  - show a "Continue your Booking" banner if the guest left without booking.
 * Cleared once a booking is actually submitted.
 */
export type BookingIntent = {
  room?: string;
  roomSlug?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  updatedAt: number;
};

const KEY = "hss_booking_intent";

export function saveIntent(patch: Partial<BookingIntent>) {
  if (typeof window === "undefined") return;
  try {
    const cur = getIntent() ?? { updatedAt: 0 };
    const next: BookingIntent = { ...cur, ...patch, updatedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("hss-intent"));
  } catch {}
}

export function getIntent(): BookingIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as BookingIntent;
    // expire after 7 days
    if (Date.now() - data.updatedAt > 7 * 24 * 60 * 60 * 1000) {
      clearIntent();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearIntent() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("hss-intent"));
  } catch {}
}
