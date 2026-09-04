"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, TicketPercent } from "lucide-react";
import { saveIntent } from "@/lib/bookingIntent";
import DateRangePicker from "@/components/booking/DateRangePicker";
import OccupancyPicker, { type Occupancy } from "@/components/booking/OccupancyPicker";
import WhyBookDirect from "@/components/WhyBookDirect";
import { useMinRate } from "@/lib/useMinRate";

function localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HeroBookingBar() {
  const router = useRouter();
  const today = localDate(0);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(localDate(1));
  const [occ, setOcc] = useState<Occupancy>({ adults: 1, children: 0, rooms: 1 });
  const [coupon, setCoupon] = useState("");
  const startingFrom = useMinRate();

  function search() {
    saveIntent({
      checkIn,
      checkOut,
      guests: String(occ.adults + occ.children),
      adults: occ.adults,
      children: occ.children,
      rooms: occ.rooms,
      coupon: coupon.trim() || undefined,
      room: undefined,
      roomSlug: undefined,
    });
    const q = new URLSearchParams({
      checkIn,
      checkOut,
      adults: String(occ.adults),
      children: String(occ.children),
      rooms: String(occ.rooms),
    });
    if (coupon.trim()) q.set("promo", coupon.trim());
    router.push(`/reservations?${q.toString()}`);
  }

  return (
    <div className="mx-auto max-w-5xl border border-white/15 bg-navy-dark/80 p-4 text-left shadow-pop sm:p-5">
      {/* One row of four controls, all the same height and all starting on the same
          line. The secondary text used to be stacked above and below the button,
          which pushed it out of line with the fields. */}
      <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_1.3fr_1fr_auto]">
        <DateRangePicker checkIn={checkIn} checkOut={checkOut} min={today} onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co); }} />
        <OccupancyPicker value={occ} onChange={setOcc} />
        <div className="flex min-h-[52px] items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2">
          <TicketPercent className="size-5 shrink-0 text-gold" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold text-slate">Coupon Code</span>
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Optional"
              className="block w-full text-sm font-semibold uppercase text-navy placeholder:font-normal placeholder:normal-case placeholder:text-gray-400 focus:outline-none"
            />
          </span>
        </div>
        <button
          type="button"
          onClick={search}
          className="flex min-h-[52px] items-center justify-center gap-2 bg-gold px-8 text-sm font-semibold text-navy-dark transition hover:brightness-95"
        >
          <Search className="size-4" /> Book Now
        </button>
      </div>

      {/* Everything secondary on one baseline under the row. */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-white/10 pt-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="text-xs text-white/80">
            From <span className="font-semibold text-white">PKR {startingFrom.toLocaleString("en-PK")}</span>/night
          </span>
          <WhyBookDirect light />
        </div>
        <Link
          href="/manage-booking"
          className="text-xs font-semibold text-white/80 underline decoration-white/30 underline-offset-2 hover:text-gold"
        >
          Manage Booking
        </Link>
      </div>
    </div>
  );
}
