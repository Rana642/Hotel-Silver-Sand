"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Phone, MessageCircle } from "lucide-react";
import { useBooking } from "@/components/BookingProvider";
import { createBooking } from "@/app/actions/booking";
import { previewCoupon } from "@/app/actions/coupon";
import { pkr } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";

export default function RoomBookingForm({
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
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ checkIn: "", checkOut: "", guests: "2", name: "", phone: "", email: "" });
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [discount, setDiscount] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const nights = f.checkIn && f.checkOut ? Math.max(0, Math.round((+new Date(f.checkOut) - +new Date(f.checkIn)) / 86400000)) : 0;
  const subtotal = price * (nights || 1);
  const total = Math.max(0, subtotal - discount);
  const gst = Math.round((total * gstPercent) / 100);
  const cell = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";

  async function applyCoupon() {
    if (!coupon.trim()) return;
    setCheckingCoupon(true);
    const res = await previewCoupon(coupon, subtotal);
    setCheckingCoupon(false);
    if (res.valid) { setDiscount(res.discount); setCouponMsg({ ok: true, text: `Applied — save ${pkr(res.discount)}` }); }
    else { setDiscount(0); setCouponMsg({ ok: false, text: res.message }); }
  }

  function validate() {
    if (!f.checkIn || !f.checkOut) return "Please pick check-in and check-out dates.";
    if (f.checkOut <= f.checkIn) return "Check-out must be after check-in.";
    if (!f.name.trim()) return "Please enter your name.";
    if (!/^[+()\d\s-]{7,}$/.test(f.phone)) return "Please enter a valid phone number.";
    if (!confirmed) return "Please confirm the hotel location to continue.";
    return null;
  }

  async function submit() {
    const v = validate();
    setError(v);
    if (v) return;
    setLoading(true);
    trackEvent("begin_checkout", { room: roomName, value: total, currency: "PKR" });
    try {
      const res = await createBooking({
        roomType: roomName, checkIn: f.checkIn, checkOut: f.checkOut,
        guests: Number(f.guests) || 1, roomsCount: 1,
        name: f.name, phone: f.phone, email: f.email,
        couponCode: coupon.trim() || undefined,
      });
      if (!res.success) { setError(res.error); setLoading(false); return; }
      // Redirect to the thank-you page — that URL is what GA4/Meta funnels track.
      router.push(`/thank-you?ref=${encodeURIComponent(res.bookingRef)}`);
    } catch {
      setError("Something went wrong. Please try WhatsApp or call us.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-card lg:sticky lg:top-24">
      <div className="flex items-baseline gap-2">
        {original && <span className="text-gray-400 line-through">{pkr(original)}</span>}
        <span className="font-heading text-2xl font-bold text-navy">{pkr(price)}</span>
        <span className="text-sm text-slate">/ night</span>
      </div>
      {discountPct > 0 && <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">Save {discountPct}%</span>}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="block"><span className="mb-1 block text-xs font-semibold text-navy">Check-in</span>
          <input type="date" min={today} value={f.checkIn} onChange={(e) => set("checkIn", e.target.value)} className={cell} /></label>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-navy">Check-out</span>
          <input type="date" min={f.checkIn || today} value={f.checkOut} onChange={(e) => set("checkOut", e.target.value)} className={cell} /></label>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-navy">Guests</span>
          <input type="number" min={1} value={f.guests} onChange={(e) => set("guests", e.target.value)} className={cell} /></label>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-navy">Full name</span>
          <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" className={cell} /></label>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-navy">Phone</span>
          <input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="03xx-xxxxxxx" className={cell} /></label>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-navy">Email <span className="font-normal text-gray-400">(opt.)</span></span>
          <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className={cell} /></label>
      </div>

      <div className="mt-3 flex gap-2">
        <input value={coupon} onChange={(e) => { setCoupon(e.target.value); setDiscount(0); setCouponMsg(null); }} placeholder="Coupon code" className={cell + " uppercase"} />
        <button onClick={applyCoupon} disabled={checkingCoupon || !coupon.trim()} className="shrink-0 rounded-md bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-dark disabled:opacity-50">{checkingCoupon ? "…" : "Apply"}</button>
      </div>
      {couponMsg && <p className={`mt-1 text-xs ${couponMsg.ok ? "text-green-600" : "text-red-600"}`}>{couponMsg.text}</p>}

      <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
        <div className="flex justify-between text-slate"><span>{pkr(price)} × {nights || 1} night{(nights || 1) > 1 ? "s" : ""}</span><span className="text-navy">{pkr(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>− {pkr(discount)}</span></div>}
        <div className="flex justify-between font-bold text-navy"><span>Est. Total</span><span className="text-gold">{pkr(total)}</span></div>
        <p className="text-xs text-slate">+ {pkr(gst)} GST ({gstPercent}%) — excluded</p>
      </div>

      <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-navy">
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#d9a928]" />
        <span>I confirm this booking is for <strong>Hotel Silver Sand, Multan, Pakistan</strong>.</span>
      </label>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button onClick={submit} disabled={loading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:brightness-95 disabled:opacity-60">
        <CalendarDays className="size-4" /> {loading ? "Saving…" : "Book Now"}
      </button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button onClick={() => booking.openContact("call")} className="flex items-center justify-center gap-1.5 rounded-md border border-navy/20 px-3 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white"><Phone className="size-4" /> Call</button>
        <button onClick={() => booking.openContact("whatsapp")} className="flex items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white hover:brightness-95"><MessageCircle className="size-4" /> WhatsApp</button>
      </div>
      <p className="mt-2 text-center text-xs text-slate">No payment now — confirm via WhatsApp</p>
    </div>
  );
}
