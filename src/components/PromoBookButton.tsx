"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { saveIntent } from "@/lib/bookingIntent";

export default function PromoBookButton({ coupon }: { coupon?: string | null }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (coupon) saveIntent({ coupon });
        router.push("/rooms#room-list");
      }}
      className="inline-flex items-center gap-2 bg-gold px-7 py-3 text-sm font-semibold text-navy-dark transition hover:brightness-95"
    >
      <CalendarDays className="size-4" /> Book Now
    </button>
  );
}
