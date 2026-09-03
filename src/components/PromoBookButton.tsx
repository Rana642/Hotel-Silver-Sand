"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

function addDay(ymd: string, n: number) {
  const d = new Date(ymd + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PromoBookButton({ coupon, checkIn }: { coupon?: string | null; checkIn?: string | null }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        const q = new URLSearchParams();
        if (checkIn) {
          q.set("checkIn", checkIn);
          q.set("checkOut", addDay(checkIn, 1));
        }
        if (coupon) q.set("promo", coupon);
        const qs = q.toString();
        router.push(`/reservations${qs ? `?${qs}` : ""}`);
      }}
      className="inline-flex items-center gap-2 bg-gold px-7 py-3 text-sm font-semibold text-navy-dark transition hover:brightness-95"
    >
      <CalendarDays className="size-4" /> Book Now
    </button>
  );
}
