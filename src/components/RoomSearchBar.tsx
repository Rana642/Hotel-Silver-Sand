"use client";

import { useState } from "react";
import { CalendarDays, Users, Search } from "lucide-react";
import { useBooking } from "@/components/BookingProvider";

export default function RoomSearchBar() {
  const booking = useBooking();
  const today = new Date().toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const cell = "w-full rounded-md border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/60 focus:border-gold focus:outline-none";

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]">
      <label className="block">
        <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-white/80"><CalendarDays className="size-3.5" /> Check-in</span>
        <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={cell} />
      </label>
      <label className="block">
        <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-white/80"><CalendarDays className="size-3.5" /> Check-out</span>
        <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={cell} />
      </label>
      <label className="block">
        <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-white/80"><Users className="size-3.5" /> Guests</span>
        <input type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} className={cell + " lg:w-24"} />
      </label>
      <button
        type="button"
        onClick={() => booking.open({ checkIn, checkOut, guests })}
        className="mt-auto flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-navy-dark transition hover:brightness-95"
      >
        <Search className="size-4" /> Search
      </button>
    </div>
  );
}
