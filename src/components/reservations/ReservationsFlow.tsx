"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users, BedDouble, Wifi, Car, Bus, Clock, Sparkles, Info, Check,
  ChevronLeft, ChevronRight, Pencil, X, Tag, CalendarDays,
} from "lucide-react";
import DateRangePicker from "@/components/booking/DateRangePicker";
import OccupancyPicker, { type Occupancy } from "@/components/booking/OccupancyPicker";
import DealBanner from "@/components/reservations/DealBanner";
import type { BannerDeal } from "@/lib/deals";
import { createBooking } from "@/app/actions/booking";
import { previewCoupon } from "@/app/actions/coupon";
import { pkr } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { clearIntent } from "@/lib/bookingIntent";
import { site } from "@/data/site";

export type RoomVM = {
  id: string;
  slug: string;
  name: string;
  capacity: string;
  maxAdults: number;
  maxChildren: number;
  bed: string;
  description: string;
  amenities: string[];
  images: string[];
  basePrice: number; // room's normal nightly price (pre-deal)
  price: number; // effective nightly price after any active deal
  original: number | null; // rack rate (struck through)
  gstPercent: number;
  unitsLeft: number;
  dealName: string | null; // active deal name for the selected check-in, if any
  dealPct: number; // deal discount % (0 if none)
  refundable: boolean; // from the active deal
  freeCancelDays: number;
};

type Search = { checkIn: string; checkOut: string; adults: number; children: number; rooms: number; promo: string };

const FALLBACK_IMG = "/images/gallery/851976912.jpg";

/** Inclusions shown on the rate plan (real, pay-at-hotel model). */
const INCLUSIONS = [
  { icon: BedDouble, label: "Book Now, Pay at Hotel" },
  { icon: Clock, label: "Early Check-in & Check-out (subject to availability)" },
  { icon: Sparkles, label: "Room Upgrade (subject to availability)" },
  { icon: Car, label: "Free Parking Available" },
  { icon: Bus, label: "Pick-up & Drop Service (chargeable)" },
  { icon: Wifi, label: "Free Wi-Fi" },
];

function fmtLong(ymd: string) {
  return new Date(ymd + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

/** Cancellation policy text for a room's active deal. */
function cancellation(refundable: boolean, days: number, checkIn: string): { free: boolean; text: string } {
  if (!refundable) return { free: false, text: "Non-Refundable" };
  const d = new Date(checkIn + "T00:00:00");
  d.setDate(d.getDate() - Math.max(0, days));
  return { free: true, text: `Book Risk Free! Cancel for free on or before ${fmtLong(d.toISOString().slice(0, 10))}` };
}

export default function ReservationsFlow({
  rooms,
  initial,
  today,
  nights,
  banner,
}: {
  rooms: RoomVM[];
  initial: Search;
  today: string;
  nights: number;
  banner?: BannerDeal | null;
}) {
  const router = useRouter();

  // Availability-bar (search) state — "Check Availability" pushes to the URL.
  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [occ, setOcc] = useState<Occupancy>({ adults: initial.adults, children: initial.children, rooms: initial.rooms });
  const [promo, setPromo] = useState(initial.promo);

  const guests = occ.adults + occ.children;

  // Selection + step.
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selected = rooms.find((r) => r.slug === selectedSlug) ?? null;

  function checkAvailability() {
    const q = new URLSearchParams({
      checkIn, checkOut,
      adults: String(occ.adults), children: String(occ.children), rooms: String(occ.rooms),
    });
    if (promo.trim()) q.set("promo", promo.trim());
    setSelectedSlug(null);
    router.push(`/reservations?${q.toString()}`);
  }

  function selectRoom(slug: string) {
    setSelectedSlug(slug);
    const r = rooms.find((x) => x.slug === slug);
    if (r) trackEvent("begin_checkout", { room: r.name, value: r.price * nights * occ.rooms, currency: "PKR" });
    if (typeof window !== "undefined") setTimeout(() => document.getElementById("guest-info")?.scrollIntoView({ behavior: "smooth" }), 60);
  }

  return (
    <div className="bg-cream">
      <div className="container-site max-w-5xl py-6 sm:py-10">
        {/* Header band */}
        <div className="rounded-t-lg bg-white px-5 py-4 shadow-card">
          <h1 className="font-heading text-xl font-bold text-navy sm:text-2xl">Reservations</h1>
        </div>

        {/* Availability bar */}
        <div className="border-x border-gray-100 bg-white px-4 py-4 shadow-card">
          <div className="grid gap-2 lg:grid-cols-[1.1fr_1.3fr_1.1fr_0.9fr_auto]">
            <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
              <span className="block text-[11px] font-semibold text-slate">Property</span>
              <span className="block truncate text-sm font-semibold text-navy">{site.name}</span>
            </div>
            <DateRangePicker checkIn={checkIn} checkOut={checkOut} min={today} onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co); }} />
            <OccupancyPicker value={occ} onChange={setOcc} />
            <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2">
              <Tag className="size-4 shrink-0 text-gold" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-slate">Promo Code</span>
                <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Optional"
                  className="block w-full text-sm font-semibold uppercase text-navy placeholder:font-normal placeholder:normal-case placeholder:text-gray-400 focus:outline-none" />
              </span>
            </div>
            <button onClick={checkAvailability}
              className="rounded-md border-2 border-navy bg-white px-5 py-2 text-sm font-bold text-navy transition hover:bg-navy hover:text-white">
              Check Availability
            </button>
          </div>
        </div>

        {/* Featured deal banner + live countdown */}
        {banner && (
          <div className="mt-3">
            <DealBanner deal={banner} />
          </div>
        )}

        {/* Select Room bar */}
        <div className="mt-3 flex items-center justify-between bg-navy-dark px-5 py-3 text-white">
          <h2 className="font-heading text-base font-bold">
            Select Room <span className="font-normal text-white/70">({occ.adults} Adult{occ.adults > 1 ? "s" : ""}{occ.children ? `, ${occ.children} Child${occ.children > 1 ? "ren" : ""}` : ""})</span>
          </h2>
          {selected && (
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden font-semibold sm:inline">{selected.name}</span>
              <span className="text-gold">{pkr(selected.price)}/night</span>
              <button onClick={() => setSelectedSlug(null)} className="flex items-center gap-1 text-white/80 hover:text-gold">
                <Pencil className="size-3.5" /> Modify
              </button>
            </div>
          )}
        </div>

        {/* Room list — hidden once a room is selected (collapses like Zehneria) */}
        {!selected && (
          <div className="border-x border-gray-100 bg-cream">
            {rooms.map((room) => (
              <RoomRow key={room.slug} room={room} nights={nights} roomsWanted={occ.rooms} guests={guests} checkIn={checkIn} onBook={() => selectRoom(room.slug)} />
            ))}
          </div>
        )}

        {/* Guest information + summary */}
        {selected && (
          <GuestInformation
            room={selected}
            search={{ checkIn, checkOut, adults: occ.adults, children: occ.children, rooms: occ.rooms, promo }}
            nights={nights}
            onDone={() => clearIntent()}
            router={router}
          />
        )}

        {/* Footer strip */}
        <div className="rounded-b-lg bg-navy px-5 py-6 text-sm text-white/80">
          <p className="font-heading text-base font-bold text-white">{site.name}, Multan</p>
          <p className="mt-1">{site.address.full}</p>
          <p className="mt-1">{site.phone} · {site.email}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Room row */

function RoomRow({
  room, nights, roomsWanted, guests, checkIn, onBook,
}: {
  room: RoomVM; nights: number; roomsWanted: number; guests: number; checkIn: string; onBook: () => void;
}) {
  const [tab, setTab] = useState<"rates" | "amenities" | "photos">("rates");
  const total = room.price * nights * roomsWanted;
  const soldOut = room.unitsLeft <= 0;
  const lowStock = room.unitsLeft > 0 && room.unitsLeft <= 3;
  const tooSmall = guests > (room.maxAdults + room.maxChildren) * roomsWanted;
  const dealName = room.dealName ?? "Best Available Rate";
  const strike = room.original && room.original > room.price ? room.original : room.basePrice > room.price ? room.basePrice : null;
  const cancel = cancellation(room.refundable, room.freeCancelDays, checkIn);

  return (
    <div className="border-b border-gray-200 last:border-0">
      {/* Header */}
      <div className="flex flex-col gap-3 bg-gray-100/70 p-3 sm:flex-row">
        <div className="relative h-28 w-full overflow-hidden rounded sm:w-44 sm:shrink-0">
          <Image src={room.images[0] ?? FALLBACK_IMG} alt={room.name} fill className="object-cover" sizes="200px" />
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <h3 className="font-heading text-lg font-bold text-navy">{room.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-slate">
            {Array.from({ length: Math.min(room.maxAdults, 4) }).map((_, i) => <Users key={i} className="size-3.5" />)}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate"><BedDouble className="size-4" /> Bed: <b className="font-semibold text-navy">{room.bed}</b></p>
        </div>
        <div className="flex flex-col items-start justify-center sm:items-end sm:text-right">
          {soldOut ? (
            <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">Sold out for these dates</span>
          ) : (
            <>
              {lowStock && <span className="mb-1 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">In high demand! Only {room.unitsLeft} room{room.unitsLeft > 1 ? "s" : ""} left</span>}
              {strike && <span className="text-sm text-gray-400 line-through">{pkr(strike)}</span>}
              <div><span className="text-sm text-slate">From </span><span className="font-heading text-xl font-bold text-navy">{pkr(room.price)}</span><span className="text-sm text-slate">/night</span></div>
              <span className="text-xs text-slate">+ {room.gstPercent}% GST</span>
              <span className="mt-0.5 text-xs text-slate">Total {pkr(total)} for {nights} night{nights > 1 ? "s" : ""} + tax</span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 bg-white px-4">
        {(["rates", "amenities", "photos"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`-mb-px border-b-2 py-2.5 text-sm font-medium capitalize transition ${tab === t ? "border-navy text-navy" : "border-transparent text-slate hover:text-navy"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white p-4">
        {tab === "rates" && (
          <div>
            {tooSmall && <p className="mb-2 text-xs text-amber-700">This room fits up to {room.maxAdults + room.maxChildren} guest(s). Add more rooms for your group.</p>}
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-semibold text-navy">
                  {dealName}
                  {room.dealPct > 0 && <span className="ml-2 inline-flex items-center gap-1 text-sm font-semibold text-red-600"><Tag className="size-3.5" /> {room.dealPct}% Off On Room Price</span>}
                </p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {INCLUSIONS.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2 text-sm text-slate"><Icon className="size-4 shrink-0 text-gold" /> {label}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-slate">Best direct rate — no payment now, pay when you arrive.</p>
                <p className={`mt-1 flex items-center gap-1.5 text-sm font-medium ${cancel.free ? "text-green-600" : "text-slate"}`}>
                  <Info className="size-4 shrink-0" /> {cancel.text}
                </p>
              </div>
              <div className="text-left sm:text-right">
                {strike && <span className="block text-sm text-gray-400 line-through">{pkr(strike)}</span>}
                <span className="font-heading text-xl font-bold text-navy">{pkr(room.price)}</span><span className="text-sm text-slate">/night</span>
                <p className="text-xs text-slate">Total {pkr(total)} for {nights} night{nights > 1 ? "s" : ""}</p>
                <button onClick={onBook} disabled={soldOut}
                  className="mt-2 w-full rounded-md bg-navy px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-40 sm:w-auto">
                  {soldOut ? "Sold Out" : "Book Now"}
                </button>
              </div>
            </div>
          </div>
        )}
        {tab === "amenities" && (
          <div>
            {room.description && <p className="mb-3 text-sm leading-relaxed text-slate">{room.description}</p>}
            {room.amenities.length > 0 ? (
              <div className="grid gap-x-6 gap-y-1.5 sm:grid-cols-3">
                {room.amenities.map((a) => <span key={a} className="flex items-center gap-2 text-sm text-slate"><Check className="size-4 shrink-0 text-green-600" /> {a}</span>)}
              </div>
            ) : <p className="text-sm text-slate">AC, Free WiFi, TV, Room Service, Attached Bathroom & more.</p>}
          </div>
        )}
        {tab === "photos" && <PhotoCarousel images={room.images.length ? room.images : [FALLBACK_IMG]} alt={room.name} />}
      </div>
    </div>
  );
}

function PhotoCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((p) => (p + d + images.length) % images.length);
  return (
    <div>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
        <Image src={images[i]} alt={`${alt} photo ${i + 1}`} fill className="object-cover" sizes="800px" />
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"><ChevronLeft className="size-5" /></button>
            <button onClick={() => go(1)} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"><ChevronRight className="size-5" /></button>
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
              {images.map((_, idx) => <span key={idx} className={`size-1.5 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- Guest information */

function GuestInformation({
  room, search, nights, onDone, router,
}: {
  room: RoomVM;
  search: Search;
  nights: number;
  onDone: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Coupon
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const subtotal = room.price * nights * search.rooms;
  const strike = room.original && room.original > room.price ? room.original : room.basePrice > room.price ? room.basePrice : null;
  const savings = strike ? (strike - room.price) * nights * search.rooms : 0;
  const cancel = cancellation(room.refundable, room.freeCancelDays, search.checkIn);
  const afterDiscount = Math.max(0, subtotal - discount);
  const gst = Math.round((afterDiscount * room.gstPercent) / 100);
  const grandTotal = afterDiscount + gst;

  useEffect(() => {
    // auto-check promo from the search bar once when landing on guest step
    const code = search.promo.trim();
    if (!code) return;
    previewCoupon(code, subtotal).then((res) => {
      if (res.valid) { setDiscount(res.discount); setCouponMsg({ ok: true, text: `Promo applied — save ${pkr(res.discount)}` }); }
      else setCouponMsg({ ok: false, text: res.message });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validate() {
    if (!name.trim()) return "Please enter your name.";
    if (!/^[+()\d\s-]{7,}$/.test(phone)) return "Please enter a valid phone number.";
    if (!agree) return "Please accept the Terms & Conditions to continue.";
    return null;
  }

  async function submit() {
    const v = validate();
    setError(v);
    if (v) return;
    setLoading(true);
    try {
      const res = await createBooking({
        roomType: room.name,
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        guests: search.adults + search.children,
        roomsCount: search.rooms,
        name, phone, email,
        requests,
        couponCode: search.promo.trim() || undefined,
      });
      if (!res.success) { setError(res.error); setLoading(false); return; }
      onDone();
      router.push(`/thank-you?ref=${encodeURIComponent(res.bookingRef)}`);
    } catch {
      setError("Something went wrong. Please try WhatsApp or call us.");
      setLoading(false);
    }
  }

  const input = "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div id="guest-info" className="border-x border-b border-gray-100 bg-white">
      <div className="bg-navy-dark px-5 py-3"><h2 className="font-heading text-base font-bold text-white">Guest Information</h2></div>
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <div>
          <div className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="First Name and Last Name" className={input} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className={input} />
              <div className="flex">
                <span className="flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-slate">🇵🇰 +92</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="Enter phone number" className={input + " rounded-l-none"} />
              </div>
            </div>
            <textarea rows={3} value={requests} onChange={(e) => setRequests(e.target.value)} placeholder="Special Requests" className={input + " resize-y"} />
          </div>

          <p className="mt-4 text-center text-sm font-semibold text-green-600">Book your stay before the prices go up!</p>

          <label className="mt-3 flex cursor-pointer items-start justify-center gap-2 text-sm text-navy">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#d9a928]" />
            <span>By completing this reservation you accept our{" "}
              <button type="button" onClick={() => setShowTerms(true)} className="font-semibold text-navy underline">Terms &amp; Conditions</button>.
            </span>
          </label>

          {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

          <div className="mt-4 flex flex-col items-center">
            <button onClick={submit} disabled={loading}
              className="w-full max-w-sm rounded-md bg-gold px-6 py-3.5 font-semibold text-navy-dark transition hover:brightness-95 disabled:opacity-60">
              {loading ? "Booking…" : "Book Now, Pay at Hotel"}
            </button>
            <p className="mt-2 text-center text-xs text-slate">No payment now — pay at the hotel. We confirm on WhatsApp or by call.</p>
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="h-fit rounded-lg border border-gray-200 p-5 shadow-card">
          <h3 className="font-heading text-lg font-bold text-navy">Your Booking Details</h3>
          <div className="mt-3 flex justify-between border-b border-gray-100 pb-3 text-sm">
            <span className="font-semibold text-navy">{site.name}</span>
          </div>
          <div className="border-b border-gray-100 py-3 text-sm">
            <p className="flex items-center gap-1.5 text-navy"><CalendarDays className="size-4 text-gold" /> {fmtLong(search.checkIn)} – {fmtLong(search.checkOut)}</p>
            <p className="mt-1 text-slate">{nights} Night{nights > 1 ? "s" : ""} · {search.rooms} Room{search.rooms > 1 ? "s" : ""} · {search.adults + search.children} Guest{search.adults + search.children > 1 ? "s" : ""}</p>
          </div>
          <div className="border-b border-gray-100 py-3 text-sm">
            <div className="flex justify-between"><span className="font-semibold text-navy">Room — {room.name}</span><span className="text-navy">{pkr(room.price)}</span></div>
            <p className="text-slate">{room.dealName ?? "Best Available Rate"} · {search.adults} Adult{search.adults > 1 ? "s" : ""}{search.children ? `, ${search.children} Child${search.children > 1 ? "ren" : ""}` : ""} · Pay at Hotel</p>
            <p className={`text-xs ${cancel.free ? "text-green-600" : "text-slate"}`}>{cancel.text}</p>
          </div>
          <div className="space-y-1.5 py-3 text-sm">
            <div className="flex justify-between text-slate"><span>Sub Total ({pkr(room.price)} × {nights}n × {search.rooms})</span><span className="text-navy">{pkr(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Promo discount</span><span>− {pkr(discount)}</span></div>}
            <div className="flex justify-between text-slate"><span>Taxes &amp; Fees (GST {room.gstPercent}%)</span><span className="text-navy">{pkr(gst)}</span></div>
            <div className="mt-1 flex justify-between border-t border-gray-100 pt-2 font-bold text-navy"><span>Grand Total</span><span>{pkr(grandTotal)}</span></div>
          </div>
          <div className="rounded-md bg-cream px-3 py-2 text-sm">
            <div className="flex justify-between text-slate"><span>Pay Now</span><span className="font-semibold text-green-600">{pkr(0)}</span></div>
            <div className="flex justify-between text-navy"><span>Pay at Hotel</span><span className="font-bold">{pkr(grandTotal)}</span></div>
          </div>
          {(savings > 0 || discount > 0) && <p className="mt-2 text-center text-sm font-semibold text-green-600">You are saving {pkr(savings + discount)} on this deal!</p>}
          {couponMsg && <p className={`mt-1 text-center text-xs ${couponMsg.ok ? "text-green-600" : "text-red-600"}`}>{couponMsg.text}</p>}
        </aside>
      </div>

      {/* Terms modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setShowTerms(false)}>
          <div className="w-full max-w-lg rounded-lg bg-white shadow-pop">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <h3 className="font-heading text-lg font-bold text-navy">Terms &amp; Conditions</h3>
              <button onClick={() => setShowTerms(false)} aria-label="Close" className="text-slate hover:text-navy"><X className="size-5" /></button>
            </div>
            <ul className="space-y-2 px-5 py-4 text-sm text-slate">
              <li>a) You are making a booking with the hotel directly.</li>
              <li>b) Please review the booking &amp; cancellation policy. Cancellation penalties may apply for changes or cancellations.</li>
              <li>c) You may be asked to show ID and the booking details at check-in.</li>
              <li>d) Inclusions not listed as part of this booking may be chargeable.</li>
              <li>e) No online payment is taken — payment is made at the hotel. We confirm your room on WhatsApp or by call.</li>
            </ul>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3">
              <button onClick={() => { setAgree(true); setShowTerms(false); }} className="rounded-md bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-dark">Accept &amp; Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
