import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Phone, ArrowRight, MessageCircle } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { site, tel, waLink } from "@/data/site";
import { fmtDate, pkr } from "@/lib/format";
import ThankYouTracker from "@/components/ThankYouTracker";
import type { Booking } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking Request Received",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  let booking: Booking | null = null;
  if (ref) {
    const supabase = createServiceClient();
    const { data } = await supabase.from("bookings").select("*").eq("booking_ref", ref).maybeSingle();
    booking = (data as Booking | null) ?? null;
  }

  const waMsg = booking
    ? [
        `*Confirming booking ${booking.booking_ref} — ${site.name}*`,
        `Room: ${booking.room_name}`,
        `Check-in: ${booking.check_in}`,
        `Check-out: ${booking.check_out}`,
        `Guests: ${booking.guests}`,
        `Name: ${booking.guest_name}`,
        `Phone: ${booking.guest_phone}`,
      ].join("\n")
    : "Hi, I just submitted a booking request. Please confirm.";

  return (
    <>
      {booking && (
        <ThankYouTracker
          bookingRef={booking.booking_ref}
          room={booking.room_name}
          value={Number(booking.total)}
        />
      )}
      <section className="bg-cream">
        <div className="container-site max-w-2xl py-14 sm:py-20">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="size-14 text-green-500" />
            <h1 className="mt-4 font-heading text-3xl font-bold text-navy sm:text-4xl">
              Thank you! We&apos;ve got your request.
            </h1>
            <p className="mt-3 max-w-lg text-slate">
              No payment has been taken. We will confirm your room via WhatsApp or call shortly.
            </p>
          </div>

          {booking ? (
            <>
              <div className="mt-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h2 className="font-heading text-lg font-bold text-navy">Booking Summary</h2>
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-navy">
                    {booking.booking_ref}
                  </span>
                </div>
                <table className="w-full text-left text-sm">
                  <tbody>
                    <Row k="Room" v={booking.room_name} />
                    <Row k="Guest Name" v={booking.guest_name} />
                    <Row k="Phone" v={booking.guest_phone} />
                    <Row k="Check-in" v={fmtDate(booking.check_in)} />
                    <Row k="Check-out" v={fmtDate(booking.check_out)} />
                    <Row k="Nights" v={String(booking.nights)} />
                    <Row k="Guests" v={`${booking.guests} guest${booking.guests > 1 ? "s" : ""}`} />
                    <tr>
                      <td className="px-6 py-3 font-medium text-slate">Estimated Total</td>
                      <td className="px-6 py-3 text-right font-heading text-lg font-bold text-gold">
                        {pkr(Number(booking.total))}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="border-t border-gray-100 bg-amber-50 px-6 py-3 text-sm">
                  <span className="font-semibold text-amber-700">Status: Pending Confirmation</span>{" "}
                  <span className="text-amber-800">— we will WhatsApp or call to confirm.</span>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-navy-dark p-6 text-center text-white sm:p-8">
                <h2 className="font-heading text-xl font-bold">Want Instant Confirmation?</h2>
                <p className="mt-2 text-sm text-white/70">
                  Tap the button below to message us on WhatsApp with your booking details pre-filled.
                </p>
                <a
                  href={waLink(waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#25D366] px-8 py-3 font-semibold text-white hover:brightness-95"
                >
                  <MessageCircle className="size-4" /> Confirm on WhatsApp
                </a>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="text-navy">We didn&apos;t find that booking reference. Please contact us to confirm your request.</p>
            </div>
          )}

          <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-card">
            <h2 className="font-heading text-lg font-bold text-navy">What Happens Next?</h2>
            <ol className="mt-4 space-y-4">
              {[
                { t: "We Check Availability", d: "Our team reviews your request and verifies the room is ready for your dates." },
                { t: "We WhatsApp or Call You", d: "We confirm your room and share the best direct rate — usually within a few hours." },
                { t: "Arrive & Enjoy", d: "Check in at any time (24 hours). No surprises." },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-navy-dark">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-navy">{s.t}</p>
                    <p className="text-sm text-slate">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/rooms"
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-semibold text-navy-dark hover:brightness-95"
            >
              View All Rooms <ArrowRight className="size-4" />
            </Link>
            <a
              href={tel}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-navy/20 px-6 py-3 font-semibold text-navy hover:bg-navy hover:text-white"
            >
              <Phone className="size-4" /> Call {site.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="w-40 px-6 py-3 font-medium text-slate">{k}</td>
      <td className="px-6 py-3 text-right text-navy">{v}</td>
    </tr>
  );
}
