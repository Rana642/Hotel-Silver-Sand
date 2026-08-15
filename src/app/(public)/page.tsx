import Image from "next/image";
import { Phone, MapPin, Mail, ArrowRight, MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import ContactButton from "@/components/ContactButton";
import TrackedLink from "@/components/TrackedLink";
import HeroBookingBar from "@/components/HeroBookingBar";
import SectionHeading from "@/components/SectionHeading";
import RoomCard from "@/components/RoomCard";
import AmenityCard from "@/components/AmenityCard";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import JsonLd from "@/components/JsonLd";
import { rooms } from "@/data/rooms";
import { amenities } from "@/data/amenities";
import { site, tel, mapEmbedUrl } from "@/data/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const featured = rooms.slice(0, 4);

  return (
    <>
      {/* Hero — building shot with the booking widget floating over its lower-middle */}
      <section className="relative bg-cream">
        <div className="relative h-[54vh] min-h-[380px] w-full overflow-hidden sm:h-[72vh] lg:h-[80vh]">
          <Image
            src="/images/hero.png"
            alt="Hotel Silver Sand Multan building exterior"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/40 via-transparent to-transparent" />
        </div>
        {/* mobile: floats just over the image bottom; desktop: sits higher on the building */}
        <div className="relative z-10 -mt-24 pb-2 sm:absolute sm:inset-x-0 sm:bottom-20 sm:mt-0 sm:pb-0 lg:bottom-28">
          <div className="container-site">
            <HeroBookingBar />
          </div>
        </div>
      </section>

      {/* Hotel name / intro band */}
      <section className="bg-cream">
        <div className="container-site py-12 text-center sm:py-16">
          <h1 className="font-heading text-4xl font-bold text-navy sm:text-5xl lg:text-6xl">
            Hotel Silver Sand Multan
          </h1>
          <p className="subtitle-serif mt-3 text-xl sm:text-2xl">40 Years of Trusted Comfort</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate sm:text-base">
            8 Minutes from Multan Airport • Prime Location in Cantt • Established 1986
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/rooms" variant="gold">
              Explore Rooms
            </ButtonLink>
            <ContactButton mode="call" variant="outline">
              <Phone className="size-4" /> Call Now
            </ContactButton>
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
              Since 1986, Hotel Silver Sand Multan has been a trusted choice for comfortable
              accommodation. Located in the heart of Multan Cantt, just 8 minutes from Multan
              International Airport, we offer the perfect blend of convenience and comfort.
            </p>
            <p className="mt-4 leading-relaxed text-slate">
              Our commitment to personalized service, modern amenities, and competitive pricing has
              made us a preferred destination for both business and leisure travelers visiting
              Multan.
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
            title="Featured Rooms & Suites"
            subtitle="Comfort designed for every traveler"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href="/rooms" variant="outline">
              View All Rooms & Suites <ArrowRight className="size-4" />
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
          <SectionHeading title="Guest Reviews" subtitle="What our guests say about us" />
          <div className="mt-10">
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
