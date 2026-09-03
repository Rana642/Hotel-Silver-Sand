"use client";

import Link from "next/link";
import { CalendarDays, Phone, MessageCircle } from "lucide-react";
import { useBooking } from "@/components/BookingProvider";
import { pkr } from "@/lib/format";

/**
 * Compact booking CTA on the room detail page. The full booking happens on the
 * dedicated /reservations flow, so this just shows the price and routes there
 * (plus quick Call / WhatsApp).
 */
export default function RoomBookCta({
  price,
  original,
  discountPct,
  gstPercent,
}: {
  price: number;
  original: number | null;
  discountPct: number;
  gstPercent: number;
}) {
  const booking = useBooking();
  const gst = Math.round((price * gstPercent) / 100);

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
      <p className="mt-1 text-xs text-slate">+ {pkr(gst)} GST ({gstPercent}%) — excluded</p>

      <Link
        href="/reservations"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:brightness-95"
      >
        <CalendarDays className="size-4" /> Check Availability &amp; Book
      </Link>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          onClick={() => booking.openContact("call")}
          className="flex items-center justify-center gap-1.5 rounded-md border border-navy/20 px-3 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white"
        >
          <Phone className="size-4" /> Call
        </button>
        <button
          onClick={() => booking.openContact("whatsapp")}
          className="flex items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-slate">No payment now — confirm via WhatsApp</p>
    </div>
  );
}
