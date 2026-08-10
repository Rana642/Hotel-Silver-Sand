"use client";

import Image from "next/image";
import { Phone, MessageCircle, CalendarDays, ExternalLink } from "lucide-react";
import { site, tel, waLink } from "@/data/site";
import { useBooking } from "@/components/BookingProvider";

export default function BookingBar() {
  const booking = useBooking();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-navy/97 backdrop-blur print:hidden">
      <div className="container-site flex items-center justify-between gap-3 py-2.5">
        <div className="hidden items-center gap-3 lg:flex">
          <Image
            src="/images/logo.svg"
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-full"
          />
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Ready to book?</p>
            <p className="text-xs text-gold">Best price guaranteed directly</p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 lg:w-auto">
          <a
            href={tel}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-navy transition hover:bg-cream lg:flex-none"
          >
            <Phone className="size-4" />
            <span className="hidden xs:inline">Call Now</span>
          </a>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 lg:flex-none"
          >
            <MessageCircle className="size-4" />
            <span className="hidden xs:inline">WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => booking.open()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-gold px-3 py-2.5 text-sm font-semibold text-navy-dark transition hover:brightness-95 lg:flex-none"
          >
            <CalendarDays className="size-4" />
            <span className="hidden xs:inline">Book Now</span>
          </button>
          <a
            href={
              site.bookingDotComUrl ||
              waLink("Hi, I'd like to check availability and book a room at Hotel Silver Sand Multan.")
            }
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center justify-center gap-1.5 rounded-md border border-white/40 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:flex"
          >
            <ExternalLink className="size-4" />
            Booking.com
          </a>
        </div>
      </div>
    </div>
  );
}
