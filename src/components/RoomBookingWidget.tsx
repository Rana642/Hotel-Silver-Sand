"use client";

import { useState } from "react";
import { CalendarDays, Phone, MessageCircle } from "lucide-react";
import { useBooking } from "@/components/BookingProvider";
import { pkr } from "@/lib/format";

export default function RoomBookingWidget({
  roomName,
  price,
  original,
  discountPct,
  gstPercent,
}: {
  roomName: string;
  price: number;
  original: number | null;
  discountPct: number;
  gstPercent: number;
}) {
  const booking = useBooking();
  const today = new Date().toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const nights = checkIn && checkOut ? Math.max(0, Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86400000)) : 0;
  const subtotal = price * (nights || 1);
  const gst = Math.round((subtotal * gstPercent) / 100);
  const cell = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-card lg:sticky lg:top-24">
      <div className="flex items-baseline gap-2">
        {original && <span className="text-gray-400 line-through">{pkr(original)}</span>}
        <span className="font-heading text-2xl font-bold text-navy">{pkr(price)}</span>
        <span className="text-sm text-slate">/ night</span>
      </div>
      {discountPct > 0 && (
        <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
          Save {discountPct}%
        </span>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="block"><span className="mb-1 block text-xs font-semibold text-navy">Check-in</span>
          <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={cell} />
        </label>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-navy">Check-out</span>
          <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={cell} />
        </label>
        <label className="col-span-2 block"><span className="mb-1 block text-xs font-semibold text-navy">Guests</span>
          <input type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} className={cell} />
        </label>
      </div>

      <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
        <div className="flex justify-between text-slate">
          <span>{pkr(price)} × {nights || 1} night{(nights || 1) > 1 ? "s" : ""}</span>
          <span className="text-navy">{pkr(subtotal)}</span>
        </div>
        <div className="flex justify-between font-bold text-navy">
          <span>Est. Total</span>
          <span className="text-gold">{pkr(subtotal)}</span>
        </div>
        <p className="text-xs text-slate">+ {pkr(gst)} GST ({gstPercent}%) — excluded, payable at hotel</p>
      </div>

      <button
        onClick={() => booking.open({ room: roomName, checkIn, checkOut, guests })}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:brightness-95"
      >
        <CalendarDays className="size-4" /> Book Now
      </button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button onClick={() => booking.openContact("call")} className="flex items-center justify-center gap-1.5 rounded-md border border-navy/20 px-3 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white">
          <Phone className="size-4" /> Call
        </button>
        <button onClick={() => booking.openContact("whatsapp")} className="flex items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white hover:brightness-95">
          <MessageCircle className="size-4" /> WhatsApp
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-slate">No payment now — confirm via WhatsApp</p>
    </div>
  );
}
