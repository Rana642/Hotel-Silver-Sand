import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import RoomCard from "@/components/RoomCard";
import JsonLd from "@/components/JsonLd";
import { rooms } from "@/data/rooms";
import { pageMeta } from "@/lib/seo";
import { site } from "@/data/site";

export const metadata: Metadata = pageMeta({
  title: "Rooms & Suites",
  description:
    "Explore comfortable, affordable rooms and suites at Hotel Silver Sand Multan — Deluxe King, Deluxe Triple, Executive Twin and Family rooms in Multan Cantt. Book direct.",
  path: "/rooms",
});

export default function RoomsPage() {
  return (
    <>
      <PageHero title="Our Rooms & Suites" subtitle="Comfort designed for every traveler" />

      <section className="bg-cream">
        <div className="container-site py-16 sm:py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {rooms.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={rooms.map((room) => ({
          "@context": "https://schema.org",
          "@type": "HotelRoom",
          name: room.name,
          url: `${site.url}/rooms`,
          image: `${site.url}${room.image}`,
          occupancy: { "@type": "QuantitativeValue", maxValue: room.maxAdults + room.maxChildren },
          amenityFeature: room.features.map((f) => ({
            "@type": "LocationFeatureSpecification",
            name: f,
            value: true,
          })),
          offers: {
            "@type": "Offer",
            price: room.price,
            priceCurrency: "PKR",
            availability: room.available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }))}
      />
    </>
  );
}
