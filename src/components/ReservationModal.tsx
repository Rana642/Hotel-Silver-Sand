"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Search, TicketPercent } from "lucide-react";
import DateRangePicker from "@/components/booking/DateRangePicker";
import OccupancyPicker, { type Occupancy } from "@/components/booking/OccupancyPicker";
import WhyBookDirect from "@/components/WhyBookDirect";
import { saveIntent } from "@/lib/bookingIntent";
import { rooms } from "@/data/rooms";

const startingFrom = Math.min(...rooms.map((r) => r.price));

function localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ReservationModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const today = localDate(0);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(localDate(1));
  const [occ, setOcc] = useState<Occupancy>({ adults: 1, children: 0, rooms: 1 });
  const [promo, setPromo] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function book() {
    saveIntent({
      checkIn, checkOut,
      guests: String(occ.adults + occ.children),
      adults: occ.adults, children: occ.children, rooms: occ.rooms,
      coupon: promo.trim() || undefined,
    });
    const q = new URLSearchParams({
      checkIn, checkOut,
      adults: String(occ.adults), children: String(occ.children), rooms: String(occ.rooms),
    });
    if (promo.trim()) q.set("promo", promo.trim());
    onClose();
    router.push(`/reservations?${q.toString()}`);
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-16 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-4xl border border-white/15 bg-navy-dark/95 p-5 shadow-pop sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-white">Reservations</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-white/80 hover:text-gold">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.2fr_1fr_auto]">
          <DateRangePicker checkIn={checkIn} checkOut={checkOut} min={today} onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co); }} />
          <OccupancyPicker value={occ} onChange={setOcc} />
          <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2">
            <TicketPercent className="size-5 shrink-0 text-gold" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-slate">Promo Code</span>
              <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Optional"
                className="block w-full text-sm font-semibold uppercase text-navy placeholder:font-normal placeholder:normal-case placeholder:text-gray-400 focus:outline-none" />
            </span>
          </div>
          <div className="flex flex-col items-stretch justify-start gap-1 text-center">
            <span className="text-xs text-white/80">From <span className="font-semibold text-white">PKR {startingFrom.toLocaleString("en-PK")}</span>/night</span>
            <button onClick={book} className="flex min-h-[46px] items-center justify-center gap-2 bg-gold px-6 py-2.5 text-sm font-semibold text-navy-dark transition hover:brightness-95">
              <Search className="size-4" /> Book Now
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <WhyBookDirect light />
          <Link href="/manage-booking" onClick={onClose} className="text-xs font-semibold text-white/80 underline decoration-white/30 underline-offset-2 hover:text-gold">
            Manage Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
