"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, Search, TicketPercent } from "lucide-react";
import { saveIntent } from "@/lib/bookingIntent";
import WhyBookDirect from "@/components/WhyBookDirect";
import { rooms } from "@/data/rooms";

const startingFrom = Math.min(...rooms.map((r) => r.price));

export default function HeroBookingBar() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [coupon, setCoupon] = useState("");

  function search() {
    saveIntent({ checkIn, checkOut, guests, coupon: coupon.trim() || undefined, room: undefined, roomSlug: undefined });
    router.push("/rooms#room-list");
  }

  const label = "mb-1 flex items-center gap-1 text-xs font-semibold text-white/85";
  const cell =
    "w-full border border-white/20 bg-white px-3 py-2.5 text-sm text-navy shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="mx-auto max-w-5xl border border-white/15 bg-navy-dark/80 p-4 text-left shadow-pop sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.7fr_1fr_auto]">
        <label className="block">
          <span className={label}><CalendarDays className="size-3.5 text-gold" /> Check In</span>
          <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={cell} />
        </label>
        <label className="block">
          <span className={label}><CalendarDays className="size-3.5 text-gold" /> Check Out</span>
          <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={cell} />
        </label>
        <label className="block">
          <span className={label}><Users className="size-3.5 text-gold" /> Guests</span>
          <input type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} className={cell} />
        </label>
        <div className="block">
          <label className="block">
            <span className={label}><TicketPercent className="size-3.5 text-gold" /> Coupon Code</span>
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Optional" className={cell + " uppercase placeholder:normal-case placeholder:text-gray-400"} />
          </label>
          <div className="mt-1.5">
            <WhyBookDirect light />
          </div>
        </div>
        <div className="flex flex-col items-stretch justify-end gap-1 text-center">
          <span className="text-xs text-white/80">
            From <span className="font-semibold text-white">PKR {startingFrom.toLocaleString("en-PK")}</span>/night
          </span>
          <button
            type="button"
            onClick={search}
            className="flex min-h-[46px] items-center justify-center gap-2 bg-gold px-6 py-2.5 text-sm font-semibold text-navy-dark transition hover:brightness-95"
          >
            <Search className="size-4" /> Book Now
          </button>
          <Link
            href="/manage-booking"
            className="text-xs font-semibold text-white/80 underline decoration-white/30 underline-offset-2 hover:text-gold"
          >
            Manage Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
