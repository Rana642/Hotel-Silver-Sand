import type { Metadata } from "next";
import { Phone, MessageCircle, Check } from "lucide-react";
import HeroBookingBar from "@/components/HeroBookingBar";
import ContactButton from "@/components/ContactButton";
import WhyBookDirect from "@/components/WhyBookDirect";
import GoogleRating from "@/components/GoogleRating";
import ViewTracker from "@/components/ViewTracker";

export const metadata: Metadata = {
  title: "Hotel In Multan Cantt — 500m From The Station",
  robots: { index: false, follow: false },
};

// Ad-only landing page for the "Arrival Intent" campaign: someone physically in
// Multan right now — just off a train at Cantt, or just landed at the airport —
// searching for a room. Message-matches "hotel in multan cantt" / "hotel near
// multan airport" from the headline down; no navbar, no footer, no other exits.
export default function NearStationLandingPage() {
  return (
    <>
      <ViewTracker event="view_item_list" params={{ list_name: "lp_near_station" }} />
      <section className="bg-navy-dark py-10 text-center sm:py-14">
        <div className="container-site max-w-3xl">
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Just Arrived in Multan? Your Room Is 500m From The Station.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Hotel Silver Sand Multan — air-conditioned rooms in Multan Cantt, 2.4 km from Multan
            International Airport. Check-in available 24 hours, so a late train or a delayed flight
            is never a problem.
          </p>
          <div className="mt-4 flex justify-center">
            <GoogleRating variant="light" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <ContactButton
              mode="call"
              className="flex min-h-[52px] items-center justify-center gap-2 bg-gold px-8 text-base font-bold text-navy-dark transition hover:brightness-95"
            >
              <Phone className="size-5" /> Call Now
            </ContactButton>
            <ContactButton
              mode="whatsapp"
              className="flex min-h-[52px] items-center justify-center gap-2 bg-[#25D366] px-8 text-base font-bold text-white transition hover:brightness-95"
            >
              <MessageCircle className="size-5" /> WhatsApp Us
            </ContactButton>
          </div>
        </div>
      </section>

      <section className="bg-cream py-10">
        <div className="container-site max-w-4xl">
          <HeroBookingBar />
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="container-site max-w-3xl">
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "500 m walk from Multan Cantt Railway Station",
              "2.4 km / ~8 minutes from Multan International Airport",
              "24-hour check-in — arrive at any hour",
              "Free cancellation, no prepayment — pay at the hotel",
              "Free private parking on site",
              "Breakfast included, WiFi rated 10/10 on Booking.com",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-slate">
                <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 text-center">
            <WhyBookDirect />
          </div>
        </div>
      </section>
    </>
  );
}
