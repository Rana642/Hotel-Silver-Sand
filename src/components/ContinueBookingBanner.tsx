"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { getIntent, clearIntent, type BookingIntent } from "@/lib/bookingIntent";
import { useMinRate } from "@/lib/useMinRate";

function fmt(d?: string) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function ContinueBookingBanner() {
  const pathname = usePathname();
  const [intent, setIntent] = useState<BookingIntent | null>(null);
  const startingFrom = useMinRate();

  useEffect(() => {
    const read = () => setIntent(getIntent());
    read();
    window.addEventListener("hss-intent", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("hss-intent", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  // Hide on the thank-you page, and only show when there's a meaningful intent.
  if (!intent || pathname?.startsWith("/thank-you")) return null;
  if (!intent.checkIn && !intent.checkOut && !intent.room) return null;

  const href = intent.roomSlug ? `/rooms/${intent.roomSlug}` : "/rooms#room-list";
  const dates =
    intent.checkIn && intent.checkOut ? `${fmt(intent.checkIn)} – ${fmt(intent.checkOut)}` : "Dates flexible";
  const guests = intent.guests ? `${intent.guests} guest${Number(intent.guests) > 1 ? "s" : ""}` : "";

  return (
    <div className="fixed right-3 top-20 z-40 max-sm:inset-x-3 max-sm:bottom-[84px] max-sm:right-auto max-sm:top-auto print:hidden">
      <div className="flex items-stretch overflow-hidden border border-white/15 border-b-gold/40 bg-navy-dark/60 text-white shadow-pop backdrop-blur-lg">
        <Link href={href} className="flex flex-1 items-center gap-3 py-2.5 pl-4 pr-3 transition hover:bg-white/10">
          <div className="leading-tight">
            <p className="text-sm font-bold text-gold">Continue your Booking</p>
            <p className="text-xs text-white/85">
              {dates}
              {guests ? ` · ${guests}` : ""}
            </p>
            <p className="text-[11px] text-white/60">Rooms from PKR {startingFrom.toLocaleString("en-PK")}/night</p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-gold" />
        </Link>
        <button
          onClick={() => clearIntent()}
          aria-label="Dismiss"
          className="flex items-center border-l border-white/10 px-2 text-white/60 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
