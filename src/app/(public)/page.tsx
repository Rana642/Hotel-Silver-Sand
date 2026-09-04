import Image from "next/image";
import { Phone, MapPin, Mail, ArrowRight, MessageCircle, Check } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import TrackedLink from "@/components/TrackedLink";
import HeroBookingBar from "@/components/HeroBookingBar";
import HeroSlider from "@/components/HeroSlider";
import { getHeroImagesStatic } from "@/lib/hero";
import SectionHeading from "@/components/SectionHeading";
import RoomCard from "@/components/RoomCard";
import AmenityCard from "@/components/AmenityCard";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import JsonLd from "@/components/JsonLd";
import FaqAccordion from "@/components/FaqAccordion";
import GoogleRating from "@/components/GoogleRating";
import { rooms as fallbackRooms, type Room } from "@/data/rooms";
import { amenities } from "@/data/amenities";
import { faqs } from "@/data/hotel-facts";
import { getRoomsStatic, featuredImage } from "@/lib/rooms";
import { site, tel, mapEmbedUrl } from "@/data/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 60;

export default async function HomePage() {
  // Rates and names come from the database so a change in the admin dashboard
  // reaches the homepage; the static list is only a fallback.
  const dbRooms = await getRoomsStatic();
  const featured: Room[] =
    dbRooms.length > 0
      ? dbRooms.slice(0, 4).map((r) => ({
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
      : fallbackRooms.slice(0, 4);
  const heroImages = await getHeroImagesStatic();

  return (
    <>
      {/* Hero — the whole first screen has to work on its own: what this is,
          who it's for, why to trust it, and the one action we want. */}
      <section className="relative bg-cream">
        {/* Shorter on a phone so the headline, the trust row and the booking
            widget all land within reach instead of pushing the CTA off-screen. */}
        <div className="relative h-[34vh] min-h-[240px] w-full overflow-hidden sm:h-[72vh] lg:h-[80vh]">
          <HeroSlider images={heroImages} />
          {/* Scrim over the top 60% only — that is where the headline and the trust
              row sit, and on a bright-sky slide they are unreadable without it.
              The slider already lays its own gradient over the bottom edge. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[62%] bg-gradient-to-b from-navy-dark/85 via-navy-dark/60 to-transparent sm:block" />
        </div>

        {/* Headline: overlays the upper third of the photo on sm+, sits below it on a phone
            (a 300 px-tall image has no room for type). One H1, positioned two ways. */}
        <div className="container-site pt-5 text-center sm:absolute sm:inset-x-0 sm:top-[19%] sm:pt-0">
          <h1 className="font-heading text-2xl font-bold leading-tight text-navy sm:text-5xl sm:text-white sm:drop-shadow lg:text-6xl">
            Hotel Silver Sand Multan
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate sm:mt-3 sm:text-lg sm:text-white/90">
            An affordable, air-conditioned hotel in Multan Cantt — a{" "}
            <span className="font-semibold text-navy sm:text-white">500 m walk</span> from Multan
            Cantt Railway Station. Book direct, pay at the hotel, cancel free.
          </p>
          {/* The strongest proof we have gets its own line, above the chips. */}
          <div className="mt-3 sm:mt-4">
            <span className="hidden sm:inline-block">
              <GoogleRating variant="light" />
            </span>
            <span className="sm:hidden">
              <GoogleRating variant="dark" size="sm" />
            </span>
          </div>

          {/* Chips rather than plain text: over a photo, loose white type loses its
              contrast exactly where the scrim fades out. */}
          <ul className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-xs font-medium text-slate sm:mt-4 sm:gap-2 sm:text-sm sm:text-white">
            {[
              "Free cancellation — pay at the hotel",
              "WiFi rated 10/10 on Booking.com",
              "Free private parking",
              "Serving Multan since 1986",
            ].map((t) => (
              <li
                key={t}
                className="flex items-center gap-1.5 sm:border sm:border-white/20 sm:bg-navy-dark/55 sm:px-3 sm:py-1.5 sm:backdrop-blur-sm"
              >
                <Check className="size-3.5 shrink-0 text-gold" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Booking bar — the single primary action. Below the photo on a phone,
            floating over its lower third on sm+. */}
        <div className="z-10 py-4 sm:absolute sm:inset-x-0 sm:bottom-12 sm:py-0 lg:bottom-16">
          <div className="container-site">
            <HeroBookingBar />
          </div>
        </div>
      </section>

      {/* Welcome */}
      <section className="bg-white">
        <div className="container-site grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-xl shadow-card">
            <Image
              src="/images/welcome.jpg"
              alt="Reception at Hotel Silver Sand Multan"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
              Welcome to Hotel Silver Sand Multan
            </h2>
            <p className="subtitle-serif mt-2 text-lg">Four decades of hospitality excellence</p>
            <p className="mt-5 leading-relaxed text-slate">
              Step off the train at Multan Cantt and you are five minutes from your room — we are a
              500 m walk from the station, and 2.4 km from Multan International Airport. No long
              taxi ride at midnight, no hunting for the address in the dark.
            </p>
            <p className="mt-4 leading-relaxed text-slate">
              Every room is air-conditioned and soundproofed, with a private attached bathroom, a
              fridge and a TV. Parking is free and private, the WiFi is genuinely fast, and the
              front desk is staffed 24 hours — so a delayed flight or a late train is never a
              problem. Serving travellers in Multan Cantt since 1986.
            </p>
            <ButtonLink href="/about" variant="navy" className="mt-6">
              Discover Our Story
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="bg-white">
        <div className="container-site py-16 sm:py-20">
          <SectionHeading
            title="Our Rooms"
            subtitle="Air-conditioned, soundproofed, and priced honestly"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href="/rooms" variant="outline">
              See All Rooms &amp; Rates <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Premium Amenities */}
      <section className="bg-navy">
        <div className="container-site py-16 sm:py-20">
          <SectionHeading
            title="Premium Amenities"
            subtitle="Everything you need for a comfortable stay"
            light
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {amenities.map((a) => (
              <AmenityCard key={a.title} amenity={a} variant="dark" />
            ))}
          </div>
        </div>
      </section>

      {/* Guest Reviews */}
      <section className="bg-cream">
        <div className="container-site py-16 sm:py-20">
          <SectionHeading
            title="Guest Reviews"
            subtitle="837 people have stayed and said so publicly"
          />
          <div className="mt-5 text-center">
            <GoogleRating variant="dark" />
          </div>
          <div className="mt-8">
            <ReviewsCarousel />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-white">
        <div className="container-site grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-gray-100 shadow-card">
            <iframe
              src={mapEmbedUrl()}
              title="Hotel Silver Sand Multan location on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[4/3] w-full"
            />
          </div>
          <div>
            <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">Our Location</h2>
            <p className="subtitle-serif mt-2 text-lg">Conveniently located in Multan Cantt</p>
            <ul className="mt-6 space-y-5 text-slate">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-gold" />
                <span>
                  <span className="block font-semibold text-navy">Address</span>
                  {site.address.full}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-gold" />
                <span>
                  <span className="block font-semibold text-navy">Contact</span>
                  <a href={tel} className="hover:text-gold">
                    {site.phone}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-gold" />
                <span>
                  <span className="block font-semibold text-navy">Email</span>
                  <a href={`mailto:${site.email}`} className="break-all hover:text-gold">
                    {site.email}
                  </a>
                </span>
              </li>
            </ul>
            <TrackedLink
              href={site.mapDirections}
              event="directions_click"
              params={{ location: "home" }}
              variant="gold"
              className="mt-7"
              external
            >
              Get Directions
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* Before You Book — the questions that actually stop a booking */}
      <section className="bg-cream">
        <div className="container-site max-w-4xl py-16 sm:py-20">
          <SectionHeading title="Before You Book" subtitle="The things guests ask us most" />
          <div className="mt-8">
            <FaqAccordion items={faqs.slice(0, 5)} openFirst={false} />
          </div>
          <div className="mt-8 text-center">
            <ButtonLink href="/faq" variant="outline">
              All FAQs &amp; Hotel Policies <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* WhatsApp Channel band */}
      <section className="bg-navy-dark">
        <div className="container-site flex flex-col items-center justify-center gap-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="flex items-center gap-2 font-heading text-lg font-semibold text-white">
            <MessageCircle className="size-5 text-gold" />
            Stay Updated — Join our WhatsApp Channel
          </p>
          <ButtonLink href={site.whatsappChannel} variant="gold" external>
            Join Now
          </ButtonLink>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: featured.map((room, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: room.name,
            url: `${site.url}/rooms`,
          })),
        }}
      />
    </>
  );
}
