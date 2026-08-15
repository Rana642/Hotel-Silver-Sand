"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, Search } from "lucide-react";
import { saveIntent } from "@/lib/bookingIntent";
import WhyBookDirect from "@/components/WhyBookDirect";

export default function HeroBookingBar() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  function search() {
    saveIntent({ checkIn, checkOut, guests, room: undefined, roomSlug: undefined });
    router.push("/rooms#room-list");
  }

  const cell =
    "w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

  return (
    <div className="mx-auto mt-8 max-w-4xl rounded-xl bg-white/95 p-3 text-left shadow-pop backdrop-blur sm:p-4">
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate">
            <CalendarDays className="size-3.5 text-gold" /> Check In
          </span>
          <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={cell} />
        </label>
        <label className="block">
          <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate">
            <CalendarDays className="size-3.5 text-gold" /> Check Out
          </span>
          <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={cell} />
        </label>
        <label className="block">
          <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate">
            <Users className="size-3.5 text-gold" /> Guests
          </span>
          <input type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} className={cell} />
        </label>
        <button
          type="button"
          onClick={search}
          className="mt-auto flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-navy-dark transition hover:brightness-95"
        >
          <Search className="size-4" /> Book Now
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between px-1">
        <WhyBookDirect />
        <span className="text-xs text-slate">Best price guaranteed directly</span>
      </div>
    </div>
  );
}
