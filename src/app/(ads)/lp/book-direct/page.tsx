import type { Metadata } from "next";
import { Phone, MessageCircle, Check } from "lucide-react";
import HeroBookingBar from "@/components/HeroBookingBar";
import ContactButton from "@/components/ContactButton";
import WhyBookDirect from "@/components/WhyBookDirect";
import GoogleRating from "@/components/GoogleRating";
import RoomCard from "@/components/RoomCard";
import ViewTracker from "@/components/ViewTracker";
import { rooms as fallbackRooms, type Room } from "@/data/rooms";
import { getRoomsStatic, featuredImage } from "@/lib/rooms";

export const metadata: Metadata = {
  title: "Hotel Rooms In Multan — From PKR 3,000/Night",
  robots: { index: false, follow: false },
};

// Ad-only landing page for the "Pre-Booking Demand" campaign: someone in
// another city planning a trip, searching the brand name or a room/rate
// keyword. No navbar, no footer, no other exits besides call/WhatsApp/booking.
export default async function BookDirectLandingPage() {
  const dbRooms = await getRoomsStatic();
  const rooms: Room[] =
    dbRooms.length > 0
      ? dbRooms.map((r) => ({
          slug: r.slug,
          name: r.name,
          capacity: r.capacity ?? `${r.max_adults} Adults`,
          maxAdults: r.max_adults,
          maxChildren: r.max_children,
          price: Number(r.price_per_night),
          originalPrice: r.original_price ? Number(r.original_price) : undefined,
          available: r.is_active,
          image: featuredImage(r),
          features:
            r.amenities?.length
              ? r.amenities
              : (fallbackRooms.find((f) => f.slug === r.slug)?.features ?? []),
        }))
      : fallbackRooms;

  return (
    <>
      <ViewTracker event="view_item_list" params={{ list_name: "lp_book_direct" }} />
      <section className="bg-navy-dark py-10 text-center sm:py-14">
        <div className="container-site max-w-3xl">
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Hotel Rooms In Multan — From PKR 3,000/Night
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Hotel Silver Sand Multan, Multan Cantt — free cancellation, pay at the hotel, no
            prepayment needed. Confirm instantly on WhatsApp or by call.
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
        <div className="container-site">
          <h2 className="text-center font-heading text-2xl font-bold text-navy">Our Rooms</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {rooms.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-10">
        <div className="container-site max-w-3xl">
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "500 m walk from Multan Cantt Railway Station",
              "24-hour check-in — arrive at any hour",
              "Free cancellation, no prepayment — pay at the hotel",
              "Free private parking on site",
              "Breakfast included, WiFi rated 10/10 on Booking.com",
              "In Multan Cantt since 1986",
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
