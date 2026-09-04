"use client";

import { useEffect, useState } from "react";
import { rooms } from "@/data/rooms";

/** Static fallback so the label never renders empty before the fetch lands. */
const FALLBACK = Math.min(...rooms.map((r) => r.price));

let cached: number | null = null;

/**
 * Lowest nightly rate as currently set in the admin dashboard.
 * Rates are managed by the owner (read off the Booking.com extranet), so the
 * "From PKR x/night" labels must not be baked into the bundle.
 */
export function useMinRate() {
  const [rate, setRate] = useState<number>(cached ?? FALLBACK);

  useEffect(() => {
    if (cached !== null) return;
    let alive = true;
    fetch("/api/min-rate")
      .then((r) => r.json())
      .then((d) => {
        const n = Number(d?.minRate);
        if (!alive || !Number.isFinite(n) || n <= 0) return;
        cached = n;
        setRate(n);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return rate;
}
